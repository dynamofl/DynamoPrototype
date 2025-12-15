import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import type { RealtimeChannel } from '@supabase/supabase-js';

interface UsePromptSubscriptionOptions {
  evaluationId: string;
  testType: 'jailbreak' | 'compliance' | 'hallucination';
  enabled?: boolean;
}

interface PromptWithStatus {
  id: string;
  evaluation_id: string;
  prompt_index: number;
  policy_id?: string;
  policy_name?: string;
  topic?: string;
  base_prompt: string;
  behavior_type?: 'Allowed' | 'Disallowed';
  status: 'pending' | 'running' | 'completed' | 'failed';
  created_at: string;
  started_at?: string;
  completed_at?: string;
  [key: string]: any; // Allow additional fields based on test type
}

interface UsePromptSubscriptionResult {
  prompts: PromptWithStatus[];
  loading: boolean;
  error: Error | null;
}

export function usePromptSubscription(
  options: UsePromptSubscriptionOptions
): UsePromptSubscriptionResult {
  const [prompts, setPrompts] = useState<PromptWithStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!options.enabled) {
      setLoading(false);
      return;
    }

    let channel: RealtimeChannel | null = null;

    // Determine table name based on test type
    const getTableName = (testType: string): string => {
      switch (testType) {
        case 'compliance':
          return 'compliance_prompts';
        case 'hallucination':
          return 'hallucination_prompts';
        case 'jailbreak':
        default:
          return 'jailbreak_prompts';
      }
    };

    const tableName = getTableName(options.testType);

    // Initial fetch of all prompts
    const fetchPrompts = async () => {
      try {
        const { data, error: fetchError } = await supabase
          .from(tableName)
          .select('*')
          .eq('evaluation_id', options.evaluationId)
          .order('prompt_index');

        if (fetchError) {
          throw fetchError;
        }

        if (data) {
          setPrompts(data);
        }
        setLoading(false);
      } catch (err) {
        console.error('Error fetching prompts:', err);
        setError(err instanceof Error ? err : new Error('Failed to fetch prompts'));
        setLoading(false);
      }
    };

    fetchPrompts();

    // Subscribe to real-time updates on the prompts table
    channel = supabase
      .channel(`prompts:${options.evaluationId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: tableName,
          filter: `evaluation_id=eq.${options.evaluationId}`
        },
        (payload) => {
          console.log('📊 [Real-time] Prompt updated:', {
            id: payload.new.id,
            status: payload.new.status,
            prompt_index: payload.new.prompt_index
          });
          // Update the specific prompt in the array
          setPrompts(prev => prev.map(p =>
            p.id === payload.new.id ? (payload.new as PromptWithStatus) : p
          ));
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: tableName,
          filter: `evaluation_id=eq.${options.evaluationId}`
        },
        (payload) => {
          console.log('📊 [Real-time] New prompt added:', {
            id: payload.new.id,
            prompt_index: payload.new.prompt_index
          });
          // Add new prompt to the array (for dynamically added prompts)
          setPrompts(prev => {
            const exists = prev.some(p => p.id === payload.new.id);
            if (exists) return prev;
            return [...prev, payload.new as PromptWithStatus].sort(
              (a, b) => a.prompt_index - b.prompt_index
            );
          });
        }
      )
      .subscribe((status) => {
        console.log('📊 [Real-time] Subscription status:', {
          evaluationId: options.evaluationId,
          table: tableName,
          status
        });
      });

    // Cleanup subscription on unmount
    return () => {
      if (channel) {
        channel.unsubscribe();
      }
    };
  }, [options.evaluationId, options.testType, options.enabled]);

  return { prompts, loading, error };
}
