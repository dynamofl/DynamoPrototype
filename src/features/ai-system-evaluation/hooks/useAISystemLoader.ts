import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAISystemsSupabase } from '@/features/ai-systems/lib/useAISystemsSupabase';
import type { AISystem } from '@/features/ai-systems/types/types';
import { fromUrlSlug } from '@/lib/utils';

export function useAISystemLoader(systemName: string | undefined) {
  const navigate = useNavigate();
  const { aiSystems, loading: supabaseLoading } = useAISystemsSupabase();
  const [aiSystem, setAiSystem] = useState<AISystem | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!systemName) {
      navigate('/ai-systems');
      return;
    }

    // Wait for Supabase data to load
    if (supabaseLoading) {
      return;
    }

    try {
      // Convert URL slug back to AI system name
      const aiSystemNames = aiSystems.map(s => s.name);
      const decodedName = fromUrlSlug(systemName, aiSystemNames);
      const system = aiSystems.find(s => s.name === decodedName);

      if (system) {
        setAiSystem(system);
      } else {
        navigate('/ai-systems');
      }
    } catch (error) {
      console.error('Failed to load AI system:', error);
      navigate('/ai-systems');
    } finally {
      setLoading(false);
    }
  }, [systemName, supabaseLoading, aiSystems, navigate]);

  return { aiSystem, loading };
}