import { useEffect, useRef, useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import { notificationService } from '@/lib/notifications/notification-service';
import type { RealtimeChannel } from '@supabase/supabase-js';

/**
 * Local Storage Key for tracking last seen status of evaluations
 */
const LAST_SEEN_STATUS_KEY = 'evaluation-last-seen-status';

/**
 * Session Storage Key for tracking notifications shown in current session
 */
const SESSION_SHOWN_KEY = 'evaluation-session-shown';

/**
 * Global evaluation monitor - watches ALL evaluations across all AI systems
 * Mounted in App.tsx to work on any page
 * Triggers notification events via NotificationService when evaluations complete
 */
export function useGlobalEvaluationMonitor() {
  const channelRef = useRef<RealtimeChannel | null>(null);
  const lastSeenStatusRef = useRef<Map<string, string>>(new Map());
  const sessionShownRef = useRef<Set<string>>(new Set());
  const [isInitialized, setIsInitialized] = useState(false);

  // Load persisted data on mount
  useEffect(() => {
    try {
      const storedStatus = localStorage.getItem(LAST_SEEN_STATUS_KEY);
      if (storedStatus) {
        const parsed = JSON.parse(storedStatus);
        lastSeenStatusRef.current = new Map(Object.entries(parsed));
      }

      const sessionShown = sessionStorage.getItem(SESSION_SHOWN_KEY);
      if (sessionShown) {
        sessionShownRef.current = new Set(JSON.parse(sessionShown));
      }
    } catch (error) {
      console.warn('Failed to load notification tracking data:', error);
    }
  }, []);

  // Save helpers
  const saveLastSeenStatus = () => {
    try {
      const statusObj = Object.fromEntries(lastSeenStatusRef.current);
      localStorage.setItem(LAST_SEEN_STATUS_KEY, JSON.stringify(statusObj));
    } catch (error) {
      console.warn('Failed to save last seen status:', error);
    }
  };

  const saveSessionShown = () => {
    try {
      sessionStorage.setItem(
        SESSION_SHOWN_KEY,
        JSON.stringify(Array.from(sessionShownRef.current))
      );
    } catch (error) {
      console.warn('Failed to save session shown list:', error);
    }
  };

  // Check for evaluations that completed while app was closed
  useEffect(() => {
    if (isInitialized) return;

    const checkCompletedWhileAway = async () => {
      try {
        const { data: evaluations, error } = await supabase
          .from('evaluations')
          .select(`
            id,
            name,
            status,
            ai_system_id,
            ai_systems (
              name
            )
          `)
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Error loading evaluations:', error);
          setIsInitialized(true);
          return;
        }

        evaluations?.forEach((evaluation: any) => {
          const lastSeenStatus = lastSeenStatusRef.current.get(evaluation.id);
          const currentStatus = evaluation.status;
          const alreadyShownInSession = sessionShownRef.current.has(evaluation.id);

          const completedWhileAway =
            (lastSeenStatus === 'running' || lastSeenStatus === 'pending') &&
            currentStatus === 'completed' &&
            !alreadyShownInSession;

          if (completedWhileAway) {
            notificationService.triggerEvaluationCompletion({
              evaluationId: evaluation.id,
              evaluationName: evaluation.name,
              systemName: evaluation.ai_systems?.name || 'Unknown',
              title: 'Completed While You Were Away',
              description: `${evaluation.name} has finished running`,
            });

            sessionShownRef.current.add(evaluation.id);
            saveSessionShown();
          }

          lastSeenStatusRef.current.set(evaluation.id, currentStatus);
        });

        saveLastSeenStatus();
        setIsInitialized(true);
      } catch (error) {
        console.error('Failed to check completed evaluations:', error);
        setIsInitialized(true);
      }
    };

    const timer = setTimeout(() => {
      checkCompletedWhileAway();
    }, 500);

    return () => clearTimeout(timer);
  }, [isInitialized]);

  // Set up real-time subscription
  useEffect(() => {
    if (!isInitialized) return;

    const channel = supabase
      .channel('global-evaluation-monitor')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'evaluations'
        },
        async (payload) => {
          const updatedEval = payload.new;
          const lastSeenStatus = lastSeenStatusRef.current.get(updatedEval.id);
          const currentStatus = updatedEval.status;
          const alreadyShownInSession = sessionShownRef.current.has(updatedEval.id);

          const justCompleted =
            (lastSeenStatus === 'running' || lastSeenStatus === 'pending') &&
            currentStatus === 'completed' &&
            !alreadyShownInSession;

          if (justCompleted) {
            const { data: aiSystem } = await supabase
              .from('ai_systems')
              .select('name')
              .eq('id', updatedEval.ai_system_id)
              .single();

            notificationService.triggerEvaluationCompletion({
              evaluationId: updatedEval.id,
              evaluationName: updatedEval.name,
              systemName: aiSystem?.name || 'Unknown',
              title: 'Evaluation Completed',
              description: `${updatedEval.name} has finished running`,
            });

            sessionShownRef.current.add(updatedEval.id);
            saveSessionShown();

            console.log('🎉 [Global Monitor] Evaluation completion detected:', {
              id: updatedEval.id,
              name: updatedEval.name,
            });
          }

          if (lastSeenStatus !== currentStatus) {
            lastSeenStatusRef.current.set(updatedEval.id, currentStatus);
            saveLastSeenStatus();
          }
        }
      )
      .subscribe();

    channelRef.current = channel;

    return () => {
      console.log('🔌 [Global Monitor] Unsubscribing');
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [isInitialized]);

  // Save on unmount
  useEffect(() => {
    return () => {
      saveLastSeenStatus();
    };
  }, []);
}
