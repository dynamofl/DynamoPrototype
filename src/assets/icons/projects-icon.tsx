interface ProjectsIconProps {
  className?: string
}

export function ProjectsIcon({ className }: ProjectsIconProps) {
  return (
    <svg 
      className={className}
      viewBox="0 0 14 14" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
    >
      <path 
        d="M4.08333 1.16602H9.91667M2.91667 3.49935H11.0833M2.91667 5.83268H11.0833C11.7277 5.83268 12.25 6.35502 12.25 6.99935V11.666C12.25 12.3103 11.7277 12.8327 11.0833 12.8327H2.91667C2.27233 12.8327 1.75 12.3103 1.75 11.666V6.99935C1.75 6.35502 2.27233 5.83268 2.91667 5.83268Z" 
        stroke="currentColor" 
        strokeWidth="1.33333" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      />
    </svg>
  )
}