import {
  Headset,
  MessageCircleQuestion,
  BookOpenText,
  TrendingUp,
  CircleHelp,
} from 'lucide-react'
import type { UseCaseOption } from './onboarding-types'

export const USE_CASES: UseCaseOption[] = [
  {
    id: 'call-centre',
    name: 'Call Center',
    description: 'AI system used by human call center agents for enhancing call center operations, such as handling customer queries, providing responses to common questions, and assisting with next steps.',
    icon: Headset,
  },
  {
    id: 'customer-faqs',
    name: 'Customer FAQ',
    description: 'AI system used for answering common customer queries, such as requests for information about product and service offerings, completing product processes, and company policies.',
    icon: MessageCircleQuestion,
  },
  {
    id: 'knowledge-management',
    name: 'Knowledge Management',
    description: 'AI system used by employees for retrieving internal policy, standards, or procedures information across an enterprise.',
    icon: BookOpenText,
  },
  {
    id: 'investment-management',
    name: 'Investment Management',
    description: 'AI system to provide customers with real-time updates and insights on investments, monitor portfolio performance, answer questions about individual investments, and provide general market data and metadata.',
    icon: TrendingUp,
  },
  {
    id: 'other',
    name: 'Other',
    description: 'Define your own use case',
    icon: CircleHelp,
  },
]

export const DEFAULT_FEATURES = [
  'Maintain your AI Models, AI Agents and tools at a single space',
  'Run Evaluation on compliance, jailbreaking and more',
  'Protect with Guardrails with realtime observability and Monitoring',
]
