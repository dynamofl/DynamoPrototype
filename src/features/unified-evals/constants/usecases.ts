import type { UsecaseOption } from '../types'

export const USECASE_OPTIONS: UsecaseOption[] = [
  {
    value: 'chatbot-assistant',
    label: 'Chatbot Assistant',
    description:
      'AI system used to assist users in conversational tasks across products and surfaces.',
  },
  {
    value: 'call-center',
    label: 'Call Center',
    description:
      'AI system used by human call center agents for enhancing call center operations, such as handling customer queries, providing responses to common questions, and assisting with next steps.',
  },
  {
    value: 'customer-faq',
    label: 'Customer FAQ',
    description:
      'AI system used for answering common customer queries, such as requests for information about product and service offerings, completing product processes, and company policies.',
  },
  {
    value: 'knowledge-management',
    label: 'Knowledge Management',
    description:
      'AI system used by employees for retrieving internal policy, standards, or procedures information across an enterprise.',
  },
]
