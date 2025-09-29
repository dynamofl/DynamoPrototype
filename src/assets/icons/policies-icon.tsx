import { PolicyIcon } from './policy-icon'

interface PoliciesIconProps {
  className?: string
}

export function PoliciesIcon({ className }: PoliciesIconProps) {
  return <PolicyIcon className={className} />
}