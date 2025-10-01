import { InfoIcon, FileText, ExternalLink } from 'lucide-react'
import type { EvaluationRecord, ConversationMessage } from '../types/types'
import Severity0Icon from '@/assets/icons/Severity0.svg'
import Severity1Icon from '@/assets/icons/Severity1.svg'
import Severity2Icon from '@/assets/icons/Severity2.svg'
import Severity3Icon from '@/assets/icons/Severity3.svg'
import BlockIcon from '@/assets/icons/Block.svg'
import StatusCompleteIcon from '@/assets/icons/StatusComplete.svg'
import { PolicyIcon } from '@/assets/icons/policy-icon'

interface EvaluationConversationDetailProps {
  record: EvaluationRecord
}

function InfoIconOutline() {
  return <InfoIcon className="w-4 h-4 text-gray-400" />
}

function PolicyFileIcon() {
  return <PolicyIcon className="w-4 h-4" />
}

function ArrowTopRightIcon() {
  return <ExternalLink className="w-4 h-4 text-gray-500" />
}

// Use the same severity icon logic from the table
function getSeverityIcon(severity: number) {
  switch (severity) {
    case 0:
      return <img src={Severity0Icon} alt="Severity 0" className="w-4 h-4" style={{ filter: 'brightness(0) saturate(100%) invert(39%) sepia(80%) saturate(1969%) hue-rotate(96deg) brightness(96%) contrast(95%)' }} />
    case 1:
      return <img src={Severity1Icon} alt="Severity 1" className="w-4 h-4" style={{ filter: 'brightness(0) saturate(100%) invert(44%) sepia(91%) saturate(2372%) hue-rotate(338deg) brightness(95%) contrast(93%)' }} />
    case 2:
      return <img src={Severity2Icon} alt="Severity 2" className="w-4 h-4" style={{ filter: 'brightness(0) saturate(100%) invert(25%) sepia(85%) saturate(5963%) hue-rotate(346deg) brightness(93%) contrast(90%)' }} />
    case 3:
      return <img src={Severity3Icon} alt="Severity 3" className="w-4 h-4" style={{ filter: 'brightness(0) saturate(100%) invert(11%) sepia(95%) saturate(7496%) hue-rotate(349deg) brightness(93%) contrast(104%)' }} />
    default:
      return <img src={Severity1Icon} alt="Severity 1" className="w-4 h-4" style={{ filter: 'brightness(0) saturate(100%) invert(44%) sepia(91%) saturate(2372%) hue-rotate(338deg) brightness(95%) contrast(93%)' }} />
  }
}

// Use the same blocked/allowed icon logic from the table
function getStatusIcon(status: string) {
  return status === 'Blocked' ? 
    <img src={BlockIcon} alt="Blocked" className="w-4 h-4" style={{ filter: 'brightness(0) saturate(100%) invert(25%) sepia(85%) saturate(5963%) hue-rotate(346deg) brightness(93%) contrast(90%)' }} /> :
    <img src={StatusCompleteIcon} alt="Allowed" className="w-4 h-4" style={{ filter: 'brightness(0) saturate(100%) invert(39%) sepia(80%) saturate(1969%) hue-rotate(96deg) brightness(96%) contrast(95%)' }} />
}

export function EvaluationConversationDetail({ record }: EvaluationConversationDetailProps) {
  const renderFrameworkLinks = () => {
    return record.frameworksReferred.map((framework, index) => {
      const getFrameworkIcon = (frameworkName: string) => {
        const name = frameworkName.toLowerCase()
        if (name.includes('mitre')) return '🛡️'
        if (name.includes('nist')) return '🏛️'
        if (name.includes('owasp')) return '🔒'
        return '📋'
      }

      return (
        <div key={index} className="inline-flex items-center text-gray-600 gap-1 p-1 bg-gray-100 rounded hover:bg-gray-200 transition-colors cursor-pointer">
          <span className="text-[13px]">{getFrameworkIcon(framework.framework)}</span>
          <span className="text-xs font-450 truncate max-w-40">
            {framework.name}
          </span>
        </div>
      )
    })
  }

  const getConversationMessages = (): ConversationMessage[] => {
    // Prefer structured conversation data if available
    if (record.jailbrokenConversation && record.jailbrokenConversation.length > 0) {
      return record.jailbrokenConversation.map(msg => ({
        ...msg,
        message: cleanMessageContent(msg.message)
      }))
    }
    
    // Fallback to parsing string format
    const prompt = record.jailbrokenPrompt
    
    // For simple prompts without conversation structure, return as single user message
    if (!prompt.includes('USER:') && !prompt.includes('AGENT:') && !prompt.includes('User:') && !prompt.includes('AI Assistant:')) {
      return [{ role: 'user', message: cleanMessageContent(prompt.trim()) }]
    }
    
    // Parse string conversation format
    const parts = prompt.split(/(USER:|AGENT:|User:|AI Assistant:)/i).filter(part => part.trim() !== '')
    const messages: ConversationMessage[] = []
    
    for (let i = 0; i < parts.length; i += 2) {
      if (parts[i] && parts[i + 1]) {
        const roleText = parts[i].trim().toLowerCase()
        const role = roleText.includes('user') ? 'user' : 
                    roleText.includes('agent') || roleText.includes('assistant') ? 'agent' : 
                    'system'
        
        messages.push({
          role: role as "user" | "agent" | "system",
          message: cleanMessageContent(parts[i + 1].trim())
        })
      }
    }
    
    return messages
  }

  const cleanMessageContent = (message: string): string => {
    // Remove role prefixes that might appear at the start of messages
    return message
      .replace(/^(Assistant:|User:|AI Assistant:|AGENT:|USER:)\s*/i, '')
      .trim()
  }

  const conversationMessages = getConversationMessages()
  
  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'user':
        return 'User'
      case 'agent':
        return 'AI Assistant'
      case 'system':
        return 'System'
      default:
        return role.charAt(0).toUpperCase() + role.slice(1)
    }
  }

  return (
    <div className="h-full overflow-y-auto py-4">
      <div className="max-w-2xl mx-auto px-4 space-y-6">
        
        {/* Evaluation Summary */}
        <section className="space-y-2">
          <h3 className="text-[11px] font-450 text-gray-500 uppercase tracking-wide">
            Evaluation Summary
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            
            {/* Attack Type */}
            <div className="border border-gray-200 rounded-lg p-2 space-y-2">
              <div className="flex items-center gap-1">
                <span className="text-xs font-450 text-gray-600">Attack Type</span>
                <InfoIconOutline />
              </div>
              <div className="flex items-center gap-2">
                {getSeverityIcon(record.severity)}
                <span className="text-[13px] font-450 text-gray-900 truncate">
                  {record.attackType}
                </span>
              </div>
            </div>

            {/* Guardrail Response */}
            <div className="border border-gray-200 rounded-lg p-2 space-y-2">
              <div className="flex items-center gap-1">
                <span className="text-xs font-450 text-gray-600">Guardrail Response</span>
                <InfoIconOutline />
              </div>
              <div className="flex items-center gap-2">
                {getStatusIcon(record.inputGuardrailResultAggregate)}
                <span className="text-[13px] font-450 text-gray-900">
                  {record.inputGuardrailResultAggregate}
                </span>
              </div>
            </div>

            {/* AI System Response */}
            <div className="border border-gray-200 rounded-lg p-2 space-y-2">
              <div className="flex items-center gap-1">
                <span className="text-xs font-450 text-gray-600">AI System Response</span>
                <InfoIconOutline />
              </div>
              <div className="flex items-center gap-2">
                {getStatusIcon(record.aiSystemResponseType)}
                <span className="text-[13px] font-450 text-gray-900">
                  {record.aiSystemResponseType}
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Base Prompt */}
        <section className="space-y-2">
          <h3 className="text-[11px] font-450 text-gray-500 uppercase tracking-wide">
            Base Prompt
          </h3>
          <div className="text-[13px] text-gray-900 leading-relaxed">
            {record.basePrompt}
          </div>
        </section>

        {/* Attack Details */}
        <section className="space-y-2">
          <h3 className="text-[11px] font-450 text-gray-500 uppercase tracking-wide">
            Attack Details
          </h3>
          <div className="border border-gray-200 rounded-md p-2 space-y-2">
            
            {/* Attack Area */}
            <div className="flex py-1">
              <div className="w-36 text-xs font-450 text-gray-500">
                Attack Area:
              </div>
              <div className="flex-1 text-xs text-gray-900">
                {record.attackArea}
              </div>
            </div>

            {/* Data Source */}
            <div className="flex">
              <div className="w-36 text-xs font-450 text-gray-500 pt-1">
                Data Source:
              </div>
              <div className="flex-1 gap-1">
                <div className="inline-flex items-center text-gray-600 gap-1 p-1 bg-gray-100 rounded hover:bg-gray-200 transition-colors cursor-pointer">
                  <PolicyFileIcon/>
                  <span className="text-xs font-450">
                    {record.dataSource}
                  </span>
                
                </div>
              </div>
            </div>

            {/* Frameworks */}
            <div className="flex">
              <div className="w-36 text-xs font-450 text-gray-500 pt-1">
                Frameworks:
              </div>
              <div className="flex-1">
                <div className="flex flex-wrap gap-2">
                  {renderFrameworkLinks()}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Jailbreak Prompt */}
        <section className="space-y-2">
          <h3 className="text-[11px] font-450 text-gray-500 uppercase tracking-wide">
            Jailbreak Prompt
          </h3>
          <div className="border border-gray-200 rounded p-2 space-y-6">
            {conversationMessages.map((message, index) => (
              <div key={index} className="space-y-2 w-full">
                <div className="w-full">
                  <p className="text-[13px] font-400 leading-5 text-gray-500">
                    {getRoleLabel(message.role)}
                  </p>
                </div>
                <div className="w-full">
                  <p className="text-[13px] font-400 leading-5 text-gray-900 whitespace-pre-wrap">
                    {message.message}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Input Guardrails */}
        <section className="space-y-2">
          <h3 className="text-[11px] font-450 text-gray-500 uppercase tracking-wide">
            Input Guardrails
          </h3>
          <div className="border border-gray-200 rounded-md p-1 ">
            {record.inputGuardrails.map((guardrail, index) => (
              <div key={index} className="flex items-center gap-2 p-2 rounded hover:bg-gray-50">
                {getStatusIcon(guardrail.result)}
                <span className="text-xs text-gray-900 flex-1">
                  <span className="font-450">{guardrail.name}:</span>
                  <span className="ml-1">{guardrail.result}</span>
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* AI System Response */}
        <section className="space-y-2">
          <h3 className="text-[11px] font-450 text-gray-500 uppercase tracking-wide">
            AI System Response
          </h3>
          <div className="text-[13px] text-gray-900 leading-relaxed">
            {record.aiSystemResponse}
          </div>
          <div className="border border-gray-200 rounded-md p-1">
            <div className="flex items-center gap-2 p-2">
              {getStatusIcon(record.aiSystemResponseType)}
              <span className="text-xs text-gray-900">
                <span className="font-450">Judgement Item:</span>
                <span className="ml-1">{record.aiSystemResponseType}</span>
              </span>
            </div>
          </div>
        </section>

      </div>
    </div>
  )
}