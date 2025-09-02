import { cn } from "@/lib/utils"
import { 
  OpenAIInlineIcon, 
  RemoteInlineIcon, 
  LocalInlineIcon, 
  AnthropicInlineIcon 
} from "@/components/inline-ai-icons"

// Import SVG files for non-theme-adaptive icons
import AzureSvg from "@/assets/icons/AISystem/Azure.svg"
import MistralSvg from "@/assets/icons/AISystem/Mistral.svg"
import DatabricksSvg from "@/assets/icons/AISystem/Databricks.svg"
import HuggingFaceSvg from "@/assets/icons/AISystem/HuggingFace.svg"
import AWSSvg from "@/assets/icons/AISystem/AWS.svg"
import DynamoAISvg from "@/assets/icons/AISystem/DynamoAI.svg"

interface AISystemIconProps {
  type: 'OpenAI' | 'Azure' | 'Mistral' | 'Databricks' | 'HuggingFace' | 'Anthropic' | 'Remote' | 'Local' | 'AWS' | 'DynamoAI'
  className?: string
}

export function AISystemIcon({ type, className }: AISystemIconProps) {
  // Check if the icon has fill="currentColor" and should adapt to theme
  const hasCurrentColorFill = () => {
    return ['OpenAI', 'Remote', 'Local', 'Anthropic'].includes(type)
  }

  const getIconColor = () => {
    // For icons with fill="currentColor", use theme-adaptive colors
    if (hasCurrentColorFill()) {
      return "text-foreground" // This will automatically adapt to light/dark theme
    }
    
    // For other icons, these colors won't apply since they're using <img> tags
    return ""
  }

  const getIconSrc = () => {
    switch (type) {
      case 'Azure':
        return AzureSvg
      case 'Mistral':
        return MistralSvg
      case 'Databricks':
        return DatabricksSvg
      case 'HuggingFace':
        return HuggingFaceSvg
      case 'AWS':
        return AWSSvg
      case 'DynamoAI':
        return DynamoAISvg
      default:
        return AzureSvg // fallback
    }
  }

  // Render inline SVG for theme-adaptive icons
  if (hasCurrentColorFill()) {
    return (
      <div className={cn("flex items-center justify-center w-8 h-8 rounded-full", className)}>
        {type === 'OpenAI' && <OpenAIInlineIcon className={getIconColor()} />}
        {type === 'Remote' && <RemoteInlineIcon className={getIconColor()} />}
        {type === 'Local' && <LocalInlineIcon className={getIconColor()} />}
        {type === 'Anthropic' && <AnthropicInlineIcon className={getIconColor()} />}
      </div>
    )
  }
  
  // Render regular img tags for fixed-color icons
  return (
    <div className={cn("flex items-center justify-center w-8 h-8 rounded-full", className)}>
      <img
        src={getIconSrc()}
        alt={`${type} icon`}
        className="w-5 h-5"
      />
    </div>
  )
}
