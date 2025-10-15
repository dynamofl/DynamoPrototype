import type { SeverityLevel } from '../../lib/attack-severity'
import Severity1Icon from '@/assets/icons/Severity1.svg'
import Severity2Icon from '@/assets/icons/Severity2.svg'
import Severity3Icon from '@/assets/icons/Severity3.svg'

interface SeverityIconProps {
  level: SeverityLevel
  size?: 'sm' | 'md' | 'lg'
}

export function SeverityIcon({ level, size = 'sm' }: SeverityIconProps) {
  // Size classes
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  }

  // Get the appropriate icon and filter based on level
  const getSeverityConfig = (level: SeverityLevel) => {
    switch (level) {
      case 1:
        return {
          icon: Severity1Icon,
          filter: 'brightness(0) saturate(100%) invert(44%) sepia(91%) saturate(2372%) hue-rotate(338deg) brightness(95%) contrast(93%)'
        }
      case 2:
        return {
          icon: Severity2Icon,
          filter: 'brightness(0) saturate(100%) invert(25%) sepia(85%) saturate(5963%) hue-rotate(346deg) brightness(93%) contrast(90%)'
        }
      case 3:
        return {
          icon: Severity3Icon,
          filter: 'brightness(0) saturate(100%) invert(11%) sepia(95%) saturate(7496%) hue-rotate(349deg) brightness(93%) contrast(104%)'
        }
    }
  }

  const config = getSeverityConfig(level)

  return (
    <img
      src={config.icon}
      alt={`Severity Level ${level}`}
      className={sizeClasses[size]}
      style={{ filter: config.filter }}
    />
  )
}
