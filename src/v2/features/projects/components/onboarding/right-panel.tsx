import { Check, User, Users } from 'lucide-react'
import { cn } from '@/lib/utils'
import { DynamoLogoIcon } from '@/assets/icons/dynamo-logo-icon'
import type { ProjectVisibility } from '../../types/project'
import type { OnboardingStep } from './onboarding-types'
import { DEFAULT_FEATURES } from './onboarding-constants'
import { UseCaseCarousel } from './use-case-carousel'

export function RightPanel({ step, name, selectedId, customName, customDescription, visibility }: {
  step: OnboardingStep
  name: string
  selectedId: string | null
  customName?: string
  customDescription?: string
  visibility: ProjectVisibility
}) {
  if (step === 'usecase') {
    return <UseCaseCarousel selectedId={selectedId} customName={customName} customDescription={customDescription} />
  }

  // Providers step — empty right panel for now
  if (step === 'providers') {
    return null
  }

  return (
    <div className="flex items-center justify-center p-5">
      <div className="w-full max-w-lg rounded-2xl bg-gray-900 p-6 relative overflow-hidden shadow-xl">
        {/* Dynamo logo watermark */}
        <div className="absolute top-0 right-0 opacity-10">
          <DynamoLogoIcon className="w-20 h-20 text-gray-0" />
        </div>

        {step === 'create' && (
          <>
            <p className="text-[0.75rem] text-gray-500 mb-1 font-[450]">Project</p>
            <p className={cn('text-lg font-[550] mb-5', name.trim() ? 'text-gray-100' : 'text-gray-600')}>
              {name.trim() || 'Untitled'}
            </p>
            <div className="space-y-3">
              {DEFAULT_FEATURES.map((f, i) => (
                <div key={i} className="flex items-start gap-2.5">
                  <Check className="h-3.5 w-3.5 text-green-500 mt-0.5 shrink-0" strokeWidth={2.5} />
                  <span className="text-[0.8125rem] text-gray-400 leading-relaxed">{f}</span>
                </div>
              ))}
            </div>
          </>
        )}

        {step === 'permissions' && (
          <>
            <p className="text-[0.75rem] text-gray-500 mb-1 font-[450]">Access</p>
            <p className="text-lg font-[550] text-gray-100 mb-5">
              {visibility === 'private' ? 'Private project' : 'Public project'}
            </p>
            <div className="flex items-center gap-2 mb-4">
              {visibility === 'private' ? (
                <div className="h-8 w-8 rounded-full bg-gray-700 flex items-center justify-center">
                  <User className="h-4 w-4 text-gray-300" strokeWidth={1.5} />
                </div>
              ) : (
                <div className="flex -space-x-2">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="h-8 w-8 rounded-full bg-gray-700 border-2 border-gray-900 flex items-center justify-center">
                      <Users className="h-3.5 w-3.5 text-gray-400" strokeWidth={1.5} />
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="space-y-3">
              {(visibility === 'private' ? [
                'Only you can access this project',
                'Invite team members at any time',
                'Full control over who sees your work',
              ] : [
                'Your entire team can view this project',
                'Evaluation results are shared across members',
                'Collaborate on policies and datasets together',
              ]).map((f, i) => (
                <div key={i} className="flex items-start gap-2.5">
                  <Check className="h-3.5 w-3.5 text-green-500 mt-0.5 shrink-0" strokeWidth={2.5} />
                  <span className="text-[0.8125rem] text-gray-400 leading-relaxed">{f}</span>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
