import type { JailbreakEvaluationResult } from '../../types/jailbreak-evaluation'
import { JudgementsSidebar } from './judgements-sidebar'
import { Badge } from '@/components/ui/badge'
import { MarkdownRenderer } from '@/components/patterns/ui-patterns/markdown-renderer'

interface EvaluationConversationViewProps {
  record: JailbreakEvaluationResult
}

export function EvaluationConversationView({ record }: EvaluationConversationViewProps) {
  const isAttackSuccess = record.attackOutcome === 'Attack Success'

  return (
    <div className="h-full grid grid-cols-[1fr_450px]">
      {/* Main Content - Left Side */}
      <div className="h-full overflow-y-auto border-r border-gray-200 py-6 px-12">
        <div className="max-w-2xl mx-auto space-y-6">

          {/* Prompt Title & Attack Outcome Header */}
          <section className="space-y-2 pb-4">
            {record.promptTitle && (
              <h2 className="text-lg font-550 leading-6 text-gray-900">
                {record.promptTitle}
              </h2>
            )}
            <div className="flex items-center gap-2">

              <Badge
                variant="secondary"
                className={` ${
                  isAttackSuccess
                    ? 'bg-red-50 text-red-700 '
                    : 'bg-green-50 text-green-700 '
                }`}
              >
                {record.attackOutcome}
              </Badge>
            </div>
          </section>

          {/* Base Prompt */}
          <section className="space-y-2">
            <h3 className="text-[0.8125rem] font-550 leading-4 text-gray-600">
              Base Prompt
            </h3>
            <div className="text-sm font-425 leading-5 text-gray-900">
              {record.basePrompt}
            </div>
          </section>

          {/* Jailbreak Prompt */}
          <section className="space-y-2">
            <h3 className="text-[0.8125rem] font-550 leading-4 text-gray-600">
              Jailbreak Prompt
            </h3>
            <div className="border border-gray-200 rounded p-2 space-y-6">
              <div className="space-y-2">
                <p className="text-[0.8125rem] font-425 leading-4 text-gray-600">User</p>
                <p className="text-sm leading-5 text-gray-900">
                  {record.adversarialPrompt}
                </p>
              </div>
            </div>
          </section>

          {/* AI System Response */}
          <section className="space-y-2">
            <h3 className="text-[0.8125rem] font-550 leading-4 text-gray-600">
              AI System Response
            </h3>
            <div>
              <MarkdownRenderer content={record.systemResponse} />
            </div>
          </section>

        </div>
      </div>

      {/* Judgements Sidebar - Right Side */}
      <JudgementsSidebar record={record} />
    </div>
  )
}
