import { MessagesSquare } from 'lucide-react'
import type { UsecaseOption } from '../types'

interface UseCasePreviewProps {
  option: UsecaseOption
}

export function UseCasePreview({ option }: UseCasePreviewProps) {
  return (
    <div className="flex h-full w-full flex-col">
      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto flex w-full max-w-2xl flex-col gap-6 px-6 py-12">
          <div className="flex flex-col gap-4">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
              <MessagesSquare className="h-5 w-5 text-gray-700" />
            </span>
            <h1 className="text-2xl font-medium tracking-tight text-gray-900">
              {option.label}
            </h1>
            <p className="text-sm leading-6 text-gray-700">
              {option.description}
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <p className="text-sm font-medium text-gray-900">
              Why This Use Case?
            </p>
            <ul className="flex flex-col gap-1.5">
              {USE_CASE_RATIONALE.map((item, idx) => (
                <li key={idx} className="flex items-stretch gap-4">
                  <span className="w-0.5 shrink-0 rounded-lg bg-gray-200" />
                  <span className="flex-1 py-1 text-sm leading-6 text-gray-700">
                    {item}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div className="flex flex-col gap-3">
            <p className="text-sm font-medium text-gray-900">
              Recommended Evaluations
            </p>
            <div className="flex flex-wrap gap-2">
              {RECOMMENDED_EVALS.map((tag) => (
                <span
                  key={tag}
                  className="rounded-md bg-gray-100 px-2 py-0.5 text-xs text-gray-700"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

const USE_CASE_RATIONALE = [
  'Tailors evaluation criteria to the conversational and operational patterns specific to this surface.',
  'Highlights risks and behaviors that matter most for this domain so reviewers can prioritize accordingly.',
  'Aligns benchmarks with industry expectations, making results easier to act on with stakeholders.',
]

const RECOMMENDED_EVALS = [
  'Policy Compliance',
  'Hallucination',
  'PII Disclosure',
  'Toxicity',
  'Jailbreak Resistance',
]
