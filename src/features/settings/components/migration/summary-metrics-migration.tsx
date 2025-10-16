import { useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { CheckCircle2, XCircle, AlertCircle, Loader2, Database } from 'lucide-react';

interface MigrationStats {
  total: number;
  migrated: number;
  skipped: number;
  errors: number;
}

interface MigrationLog {
  type: 'info' | 'success' | 'warning' | 'error';
  message: string;
  evaluationName?: string;
}

export function SummaryMetricsMigration() {
  const [isRunning, setIsRunning] = useState(false);
  const [stats, setStats] = useState<MigrationStats>({ total: 0, migrated: 0, skipped: 0, errors: 0 });
  const [logs, setLogs] = useState<MigrationLog[]>([]);
  const [progress, setProgress] = useState(0);

  const addLog = (log: MigrationLog) => {
    setLogs(prev => [...prev, log]);
  };

  const calculateSummaryMetrics = (prompts: any[]) => {
    const totalTests = prompts.length;
    let attackSuccesses = 0;
    let attackFailures = 0;
    let aiSystemOnlySuccesses = 0;
    let aiSystemOnlyFailures = 0;

    const byPolicy: Record<string, any> = {};
    const byAttackType: Record<string, any> = {};
    const byBehaviorType: Record<string, any> = {};
    const guardrailMetricsMap: Map<string, any> = new Map();

    for (const prompt of prompts) {
      // Count outcomes
      if (prompt.attack_outcome === 'Attack Success') attackSuccesses++;
      else if (prompt.attack_outcome === 'Attack Failure') attackFailures++;

      if (prompt.ai_system_attack_outcome === 'Attack Success') aiSystemOnlySuccesses++;
      else if (prompt.ai_system_attack_outcome === 'Attack Failure') aiSystemOnlyFailures++;

      // Group by policy
      const policyId = prompt.policy_id || 'unknown';
      if (!byPolicy[policyId]) {
        byPolicy[policyId] = {
          total: 0,
          successes: 0,
          failures: 0,
          policyName: prompt.policy_name || 'Unknown'
        };
      }
      byPolicy[policyId].total++;
      if (prompt.attack_outcome === 'Attack Success') byPolicy[policyId].successes++;
      else byPolicy[policyId].failures++;

      // Group by attack type
      const attackType = prompt.attack_type || 'unknown';
      if (!byAttackType[attackType]) {
        byAttackType[attackType] = { total: 0, successes: 0, failures: 0 };
      }
      byAttackType[attackType].total++;
      if (prompt.attack_outcome === 'Attack Success') byAttackType[attackType].successes++;
      else byAttackType[attackType].failures++;

      // Group by behavior type
      const behaviorType = prompt.behavior_type || 'unknown';
      if (!byBehaviorType[behaviorType]) {
        byBehaviorType[behaviorType] = { total: 0, successes: 0, failures: 0 };
      }
      byBehaviorType[behaviorType].total++;
      if (prompt.attack_outcome === 'Attack Success') byBehaviorType[behaviorType].successes++;
      else byBehaviorType[behaviorType].failures++;

      // Process per-guardrail metrics
      const inputGuardrails = prompt.input_guardrail?.details || [];
      const outputGuardrails = prompt.output_guardrail?.details || [];
      const allGuardrailDetails = [...inputGuardrails, ...outputGuardrails];

      for (const detail of allGuardrailDetails) {
        if (!detail.guardrailId || !detail.guardrailName) continue;

        if (!guardrailMetricsMap.has(detail.guardrailId)) {
          guardrailMetricsMap.set(detail.guardrailId, {
            id: detail.guardrailId,
            name: detail.guardrailName,
            type: inputGuardrails.some((g: any) => g.guardrailId === detail.guardrailId) ? 'input' : 'output',
            byPolicy: {},
            totalTests: 0,
            attackSuccesses: 0,
            attackFailures: 0,
            byAttackType: {},
            byBehaviorType: {},
            guardrailOnlySuccesses: 0,
            guardrailOnlyFailures: 0
          });
        }

        const guardrailMetrics = guardrailMetricsMap.get(detail.guardrailId);
        guardrailMetrics.totalTests++;

        const guardrailBlocked = detail.judgement === 'Blocked';
        const attackSuccess = prompt.attack_outcome === 'Attack Success';
        const aiSystemSuccess = prompt.ai_system_attack_outcome === 'Attack Success';

        if (attackSuccess) guardrailMetrics.attackSuccesses++;
        else guardrailMetrics.attackFailures++;

        if (guardrailBlocked && aiSystemSuccess) guardrailMetrics.guardrailOnlySuccesses++;
        if (!guardrailBlocked && !attackSuccess && !aiSystemSuccess) guardrailMetrics.guardrailOnlyFailures++;

        // By Policy
        if (!guardrailMetrics.byPolicy[policyId]) {
          guardrailMetrics.byPolicy[policyId] = {
            total: 0,
            successes: 0,
            failures: 0,
            policyName: prompt.policy_name || 'Unknown'
          };
        }
        guardrailMetrics.byPolicy[policyId].total++;
        if (attackSuccess) guardrailMetrics.byPolicy[policyId].successes++;
        else guardrailMetrics.byPolicy[policyId].failures++;

        // By Attack Type
        if (!guardrailMetrics.byAttackType[attackType]) {
          guardrailMetrics.byAttackType[attackType] = { total: 0, successes: 0, failures: 0 };
        }
        guardrailMetrics.byAttackType[attackType].total++;
        if (attackSuccess) guardrailMetrics.byAttackType[attackType].successes++;
        else guardrailMetrics.byAttackType[attackType].failures++;

        // By Behavior Type
        if (!guardrailMetrics.byBehaviorType[behaviorType]) {
          guardrailMetrics.byBehaviorType[behaviorType] = { total: 0, successes: 0, failures: 0 };
        }
        guardrailMetrics.byBehaviorType[behaviorType].total++;
        if (attackSuccess) guardrailMetrics.byBehaviorType[behaviorType].successes++;
        else guardrailMetrics.byBehaviorType[behaviorType].failures++;
      }
    }

    // Calculate success rates
    for (const policyId in byPolicy) {
      const policy = byPolicy[policyId];
      policy.successRate = policy.total > 0 ? (policy.successes / policy.total) * 100 : 0;
    }

    for (const attackType in byAttackType) {
      const stats = byAttackType[attackType];
      stats.successRate = stats.total > 0 ? (stats.successes / stats.total) * 100 : 0;
    }

    for (const behaviorType in byBehaviorType) {
      const stats = byBehaviorType[behaviorType];
      stats.successRate = stats.total > 0 ? (stats.successes / stats.total) * 100 : 0;
    }

    // Calculate guardrail success rates
    const guardrailsArray = Array.from(guardrailMetricsMap.values()).map(g => {
      for (const policyId in g.byPolicy) {
        const policy = g.byPolicy[policyId];
        policy.successRate = policy.total > 0 ? (policy.successes / policy.total) * 100 : 0;
      }

      for (const attackType in g.byAttackType) {
        const stats = g.byAttackType[attackType];
        stats.successRate = stats.total > 0 ? (stats.successes / stats.total) * 100 : 0;
      }

      for (const behaviorType in g.byBehaviorType) {
        const stats = g.byBehaviorType[behaviorType];
        stats.successRate = stats.total > 0 ? (stats.successes / stats.total) * 100 : 0;
      }

      const successRate = g.totalTests > 0 ? (g.attackSuccesses / g.totalTests) * 100 : 0;
      const guardrailOnlySuccessRate = g.totalTests > 0
        ? (g.guardrailOnlySuccesses / g.totalTests) * 100
        : 0;

      return { ...g, successRate, guardrailOnlySuccessRate };
    });

    const successRate = totalTests > 0 ? (attackSuccesses / totalTests) * 100 : 0;
    const aiSystemOnlySuccessRate = totalTests > 0
      ? (aiSystemOnlySuccesses / totalTests) * 100
      : 0;

    return {
      aiSystem: {
        totalTests,
        attackSuccesses,
        attackFailures,
        successRate,
        aiSystemOnlySuccesses,
        aiSystemOnlyFailures,
        aiSystemOnlySuccessRate,
        byPolicy,
        byAttackType,
        byBehaviorType
      },
      guardrails: guardrailsArray.length > 0 ? guardrailsArray : undefined,
      // Legacy fields for backward compatibility
      totalTests,
      attackSuccesses,
      attackFailures,
      successRate,
      aiSystemOnlySuccesses,
      aiSystemOnlyFailures,
      aiSystemOnlySuccessRate,
      byPolicy,
      byAttackType,
      byBehaviorType
    };
  };

  const runMigration = async () => {
    setIsRunning(true);
    setLogs([]);
    setStats({ total: 0, migrated: 0, skipped: 0, errors: 0 });
    setProgress(0);

    try {
      addLog({ type: 'info', message: 'Starting migration...' });

      // Fetch all completed evaluations
      const { data: evaluations, error: fetchError } = await supabase
        .from('evaluations')
        .select('id, name, summary_metrics')
        .eq('status', 'completed')
        .order('created_at', { ascending: false });

      if (fetchError) {
        throw new Error(`Error fetching evaluations: ${fetchError.message}`);
      }

      if (!evaluations || evaluations.length === 0) {
        addLog({ type: 'info', message: 'No completed evaluations found' });
        return;
      }

      addLog({ type: 'info', message: `Found ${evaluations.length} completed evaluations` });
      setStats(prev => ({ ...prev, total: evaluations.length }));

      // Process each evaluation
      for (let i = 0; i < evaluations.length; i++) {
        const evaluation = evaluations[i];
        const progressPercent = ((i + 1) / evaluations.length) * 100;
        setProgress(progressPercent);

        try {
          // Check if already migrated
          if (evaluation.summary_metrics?.aiSystem) {
            addLog({
              type: 'info',
              message: 'Already migrated, skipping',
              evaluationName: evaluation.name
            });
            setStats(prev => ({ ...prev, skipped: prev.skipped + 1 }));
            continue;
          }

          // Fetch prompts for this evaluation
          const { data: prompts, error: promptsError } = await supabase
            .from('evaluation_prompts')
            .select('*')
            .eq('evaluation_id', evaluation.id)
            .eq('status', 'completed');

          if (promptsError) {
            throw new Error(`Error fetching prompts: ${promptsError.message}`);
          }

          if (!prompts || prompts.length === 0) {
            addLog({
              type: 'warning',
              message: 'No completed prompts found, skipping',
              evaluationName: evaluation.name
            });
            setStats(prev => ({ ...prev, skipped: prev.skipped + 1 }));
            continue;
          }

          // Recalculate summary metrics
          const newSummaryMetrics = calculateSummaryMetrics(prompts);

          // Update evaluation
          const { error: updateError } = await supabase
            .from('evaluations')
            .update({ summary_metrics: newSummaryMetrics })
            .eq('id', evaluation.id);

          if (updateError) {
            throw new Error(`Error updating evaluation: ${updateError.message}`);
          }

          addLog({
            type: 'success',
            message: `Successfully migrated (${newSummaryMetrics.guardrails?.length || 0} guardrails tracked)`,
            evaluationName: evaluation.name
          });
          setStats(prev => ({ ...prev, migrated: prev.migrated + 1 }));

        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          addLog({
            type: 'error',
            message: errorMessage,
            evaluationName: evaluation.name
          });
          setStats(prev => ({ ...prev, errors: prev.errors + 1 }));
        }
      }

      addLog({ type: 'success', message: 'Migration complete!' });

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      addLog({ type: 'error', message: `Fatal error: ${errorMessage}` });
    } finally {
      setIsRunning(false);
      setProgress(100);
    }
  };

  const getLogIcon = (type: MigrationLog['type']) => {
    switch (type) {
      case 'success':
        return <CheckCircle2 className="h-4 w-4 text-green-600" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-600" />;
      case 'warning':
        return <AlertCircle className="h-4 w-4 text-amber-600" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-600" />;
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            <CardTitle>Summary Metrics Migration</CardTitle>
          </div>
          <CardDescription>
            Update existing evaluations to include per-guardrail breakdown in summary metrics.
            This migration is safe to run multiple times and will skip already-migrated evaluations.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>What this does:</strong> Recalculates summary_metrics for all completed evaluations to include
              detailed per-guardrail effectiveness metrics. This enables you to see which guardrails are most effective
              at blocking attacks.
            </AlertDescription>
          </Alert>

          <div className="space-y-4">
            <div className="grid grid-cols-4 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardDescription>Total</CardDescription>
                  <CardTitle className="text-2xl">{stats.total}</CardTitle>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardDescription>Migrated</CardDescription>
                  <CardTitle className="text-2xl text-green-600">{stats.migrated}</CardTitle>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardDescription>Skipped</CardDescription>
                  <CardTitle className="text-2xl text-gray-600">{stats.skipped}</CardTitle>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardDescription>Errors</CardDescription>
                  <CardTitle className="text-2xl text-red-600">{stats.errors}</CardTitle>
                </CardHeader>
              </Card>
            </div>

            {isRunning && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-700">Progress</span>
                  <span className="text-gray-700">{Math.round(progress)}%</span>
                </div>
                <Progress value={progress} className="h-2" />
              </div>
            )}

            <Button
              onClick={runMigration}
              disabled={isRunning}
              className="w-full"
              size="lg"
            >
              {isRunning ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Running Migration...
                </>
              ) : (
                'Run Migration'
              )}
            </Button>
          </div>

          {logs.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-gray-900">Migration Log</h3>
              <div className="max-h-96 space-y-1 overflow-y-auto rounded-md border border-gray-200 bg-gray-50 p-4">
                {logs.map((log, index) => (
                  <div key={index} className="flex items-start gap-2 text-sm font-mono">
                    {getLogIcon(log.type)}
                    <div className="flex-1">
                      {log.evaluationName && (
                        <span className="font-semibold text-gray-900">{log.evaluationName}: </span>
                      )}
                      <span className="text-gray-700">{log.message}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
