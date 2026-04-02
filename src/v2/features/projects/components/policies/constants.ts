import type { PolicyTemplate } from './types'

export const contentVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
}

export const POLICY_CATEGORIES = ['Safety', 'Content', 'Compliance', 'Behavioral'] as const

export const POLICY_TEMPLATES: PolicyTemplate[] = [
  {
    id: 'harmful-content',
    name: 'Harmful Content Prevention',
    category: 'Safety',
    description: 'Prevent generation of violent, dangerous, or harmful content.',
    detail: 'This policy ensures AI outputs do not include instructions for violence, self-harm, weapons, or any content that could cause physical harm. It covers direct harm, incitement, and detailed dangerous instructions.',
    allowed: [
      'Discuss historical events involving conflict in educational context',
      'Provide safety guidelines and harm prevention advice',
      'Reference fictional violence in literary analysis',
    ],
    disallowed: [
      'Provide instructions for creating weapons or explosives',
      'Generate content promoting self-harm or suicide',
      'Give detailed instructions for dangerous activities',
    ],
  },
  {
    id: 'pii-protection',
    name: 'PII Protection',
    category: 'Safety',
    description: 'Prevent exposure or generation of personally identifiable information.',
    detail: 'This policy guards against generating, storing, or exposing personal data such as social security numbers, credit card details, addresses, phone numbers, and other PII. It enforces data minimization principles.',
    allowed: [
      'Explain what PII is and why it matters',
      'Discuss data protection best practices',
      'Use clearly fictional example data for demonstrations',
    ],
    disallowed: [
      'Generate realistic-looking social security numbers',
      'Output credit card numbers or bank account details',
      'Produce fake but realistic personal profiles with addresses',
    ],
  },
  {
    id: 'hate-speech',
    name: 'Hate Speech & Discrimination',
    category: 'Content',
    description: 'Block discriminatory, hateful, or biased content targeting protected groups.',
    detail: 'This policy prevents the AI from generating content that discriminates against or demeans individuals based on race, ethnicity, gender, sexual orientation, religion, disability, age, or other protected characteristics.',
    allowed: [
      'Discuss diversity and inclusion topics objectively',
      'Explain historical context of discrimination for educational purposes',
      'Provide anti-discrimination resources and guidance',
    ],
    disallowed: [
      'Generate slurs or derogatory language targeting any group',
      'Create stereotyping content about protected characteristics',
      'Produce content that dehumanizes or demeans any group',
    ],
  },
  {
    id: 'misinformation',
    name: 'Misinformation Prevention',
    category: 'Content',
    description: 'Ensure factual accuracy and prevent spreading of false information.',
    detail: 'This policy ensures the AI does not generate misleading claims, fabricated statistics, false medical advice, or conspiracy theories. It promotes accuracy, source attribution, and appropriate uncertainty acknowledgment.',
    allowed: [
      'Present well-sourced factual information',
      'Acknowledge uncertainty when evidence is limited',
      'Discuss debunked claims in context of fact-checking',
    ],
    disallowed: [
      'Generate fabricated statistics or fake research citations',
      'Provide unverified medical or legal advice as fact',
      'Spread conspiracy theories or debunked claims as truth',
    ],
  },
  {
    id: 'gdpr-compliance',
    name: 'GDPR Compliance',
    category: 'Compliance',
    description: 'Ensure outputs comply with EU data protection regulations.',
    detail: 'This policy aligns AI behavior with GDPR requirements including data minimization, purpose limitation, consent awareness, right to erasure principles, and cross-border data transfer considerations.',
    allowed: [
      'Explain GDPR principles and requirements',
      'Process data with appropriate consent context',
      'Recommend privacy-preserving approaches',
    ],
    disallowed: [
      'Process personal data without considering consent requirements',
      'Suggest storing data beyond stated purpose',
      'Recommend cross-border data transfers without safeguards',
    ],
  },
  {
    id: 'financial-regulations',
    name: 'Financial Regulations',
    category: 'Compliance',
    description: 'Ensure compliance with financial services regulations and disclaimers.',
    detail: 'This policy ensures the AI includes appropriate disclaimers for financial content, avoids giving specific investment advice, and complies with regulations like SEC, FINRA, and MiFID II requirements.',
    allowed: [
      'Provide general financial education and concepts',
      'Explain investment terminology and market mechanics',
      'Include appropriate disclaimers with financial content',
    ],
    disallowed: [
      'Give specific investment recommendations without disclaimers',
      'Guarantee returns or make promises about financial outcomes',
      'Provide tax advice as professional counsel',
    ],
  },
  {
    id: 'professional-tone',
    name: 'Professional Tone',
    category: 'Behavioral',
    description: 'Maintain professional, respectful, and brand-appropriate communication.',
    detail: 'This policy ensures the AI maintains a professional demeanor, uses appropriate language, and represents your brand voice consistently. It covers tone, formality level, and communication standards.',
    allowed: [
      'Use clear, professional language in all responses',
      'Maintain helpful and respectful tone',
      'Adapt formality based on context while staying professional',
    ],
    disallowed: [
      'Use casual slang or informal abbreviations',
      'Generate sarcastic or dismissive responses',
      'Use aggressive or confrontational language',
    ],
  },
  {
    id: 'transparency',
    name: 'AI Transparency',
    category: 'Behavioral',
    description: 'Ensure the AI is transparent about its limitations and nature.',
    detail: 'This policy ensures the AI clearly identifies itself as an AI, acknowledges its limitations, does not pretend to have experiences it cannot have, and is honest about uncertainty in its responses.',
    allowed: [
      'Clearly state when information may be outdated',
      'Acknowledge limitations of AI-generated content',
      'Recommend consulting human experts for critical decisions',
    ],
    disallowed: [
      'Pretend to be a human or claim personal experiences',
      'Express certainty about topics where the AI lacks knowledge',
      'Hide the fact that content is AI-generated when asked',
    ],
  },
]
