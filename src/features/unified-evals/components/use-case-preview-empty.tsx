import emptyIllustration from './illustrations/policy-preview-empty.svg'

export function UseCasePreviewEmpty() {
  return (
    <div className="flex h-full w-full items-center justify-center">
      <div className="flex flex-col items-center justify-center gap-4">
        <img
          src={emptyIllustration}
          alt=""
          aria-hidden="true"
          className="h-16 w-16 opacity-90"
        />
        <p className="text-sm text-gray-500">Click use case to preview here</p>
      </div>
    </div>
  )
}
