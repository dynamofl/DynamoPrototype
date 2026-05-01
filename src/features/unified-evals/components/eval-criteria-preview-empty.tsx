import emptyIllustration from './illustrations/eval-criteria-preview-empty.svg'

export function EvalCriteriaPreviewEmpty() {
  return (
    <div className="flex flex-col items-center justify-center gap-4">
      <img
        src={emptyIllustration}
        alt=""
        aria-hidden="true"
        className="h-16 w-16 opacity-90"
      />
      <p className="text-sm text-gray-500">Evaluation Criteria Preview Comes Here</p>
    </div>
  )
}
