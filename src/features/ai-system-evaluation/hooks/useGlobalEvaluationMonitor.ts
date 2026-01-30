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
  console.log('🚀🚀🚀 useGlobalEvaluationMonitor HOOK CALLED 🚀🚀🚀');

  const channelRef = useRef<RealtimeChannel | null>(null);
  const lastSeenStatusRef = useRef<Map<string, string>>(new Map());
  const sessionShownRef = useRef<Set<string>>(new Set());
  const [isInitialized, setIsInitialized] = useState(false);
  const isMountedRef = useRef(true);

  console.log('🚀 useGlobalEvaluationMonitor: Hook body executing, isInitialized =', isInitialized);

  // Load persisted data on mount
  useEffect(() => {
    console.log('🚀 useGlobalEvaluationMonitor: Load persisted data effect running');
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
    console.log('🎯 useGlobalEvaluationMonitor: First effect (checkCompletedWhileAway) running, isInitialized =', isInitialized);
    if (isInitialized) {
      console.log('⏭️ useGlobalEvaluationMonitor: Already initialized, skipping');
      return;
    }

    // Use effect-specific cancellation flag to handle React StrictMode double-mounting
    let cancelled = false;

    const checkCompletedWhileAway = async () => {
      console.log('🔎 useGlobalEvaluationMonitor: Checking for completed evaluations...');
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
          console.error('❌ useGlobalEvaluationMonitor: Error loading evaluations:', error);
          if (!cancelled) setIsInitialized(true);
          return;
        }

        console.log(`📋 useGlobalEvaluationMonitor: Found ${evaluations?.length || 0} evaluations`);

        // Check if this effect has been cancelled (component unmounted or re-run)
        console.log('🔍 useGlobalEvaluationMonitor: Checking if cancelled =', cancelled);
        if (cancelled) {
          console.warn('⚠️ useGlobalEvaluationMonitor: Effect cancelled, stopping evaluation processing');
          return;
        }

        console.log('🔄 useGlobalEvaluationMonitor: Processing evaluations...');
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

        console.log('✅ useGlobalEvaluationMonitor: Finished processing all evaluations');
        console.log('💾 useGlobalEvaluationMonitor: About to save last seen status');
        saveLastSeenStatus();
        console.log('✅ useGlobalEvaluationMonitor: Last seen status saved');
        console.log('✅ useGlobalEvaluationMonitor: About to set isInitialized = true, cancelled =', cancelled);
        if (!cancelled) {
          setIsInitialized(true);
          console.log('✅ useGlobalEvaluationMonitor: setIsInitialized(true) called');
        } else {
          console.warn('⚠️ useGlobalEvaluationMonitor: Effect cancelled, NOT setting isInitialized');
        }
      } catch (error) {
        console.error('❌ Failed to check completed evaluations:', error);
        if (!cancelled) {
          setIsInitialized(true);
          console.log('✅ useGlobalEvaluationMonitor: setIsInitialized(true) called after error');
        }
      }
    };

    const timer = setTimeout(() => {
      console.log('⏰ useGlobalEvaluationMonitor: Timer fired, calling checkCompletedWhileAway');
      checkCompletedWhileAway();
    }, 500);

    return () => {
      console.log('🧹 useGlobalEvaluationMonitor: Cleanup - cancelling effect and clearing timer');
      cancelled = true;
      clearTimeout(timer);
    };
  }, [isInitialized]);

  // Set up real-time subscription
  useEffect(() => {
    console.log('🎯 useGlobalEvaluationMonitor: Second effect (subscription) running, isInitialized =', isInitialized);
    if (!isInitialized) {
      console.log('⏳ useGlobalEvaluationMonitor: Not initialized yet, skipping subscription setup');
      return;
    }

    console.log('🎬 useGlobalEvaluationMonitor: Setting up real-time subscription');

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
          console.log('📡 useGlobalEvaluationMonitor: Received database update', payload);

          const updatedEval = payload.new;
          const lastSeenStatus = lastSeenStatusRef.current.get(updatedEval.id);
          const currentStatus = updatedEval.status;
          const alreadyShownInSession = sessionShownRef.current.has(updatedEval.id);

          console.log('🔍 useGlobalEvaluationMonitor: Checking completion status', {
            evaluationId: updatedEval.id,
            evaluationName: updatedEval.name,
            lastSeenStatus,
            currentStatus,
            alreadyShownInSession,
          });

          const justCompleted =
            (lastSeenStatus === 'running' || lastSeenStatus === 'pending') &&
            currentStatus === 'completed' &&
            !alreadyShownInSession;

          console.log('✅ useGlobalEvaluationMonitor: justCompleted =', justCompleted);

          if (justCompleted) {
            console.log('🎯 Evaluation just completed!', {
              evaluationId: updatedEval.id,
              evaluationName: updatedEval.name,
              lastSeenStatus,
              currentStatus
            });

            const { data: aiSystem } = await supabase
              .from('ai_systems')
              .select('name')
              .eq('id', updatedEval.ai_system_id)
              .single();

            // Check if component is still mounted before triggering notification
            if (!isMountedRef.current) return;

            console.log('📢 Triggering notification for evaluation:', updatedEval.name);

            notificationService.triggerEvaluationCompletion({
              evaluationId: updatedEval.id,
              evaluationName: updatedEval.name,
              systemName: aiSystem?.name || 'Unknown',
              title: 'Evaluation Completed',
              description: `${updatedEval.name} has finished running`,
            });

            sessionShownRef.current.add(updatedEval.id);
            saveSessionShown();
          }

          if (lastSeenStatus !== currentStatus) {
            lastSeenStatusRef.current.set(updatedEval.id, currentStatus);
            saveLastSeenStatus();
          }
        }
      )
      .subscribe((status) => {
        console.log('🔌 useGlobalEvaluationMonitor: Subscription status changed:', status);
      });

    channelRef.current = channel;

    console.log('✅ useGlobalEvaluationMonitor: Subscription setup complete');

    return () => {
      console.log('🔌 useGlobalEvaluationMonitor: Cleaning up subscription');
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [isInitialized]);

  // Save on unmount and mark as unmounted
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      saveLastSeenStatus();
    };
  }, []);
}
