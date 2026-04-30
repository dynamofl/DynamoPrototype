export interface AttackOption {
  id: string
  name: string
  meta: string
  description: string
}

export const ATTACK_OPTIONS: AttackOption[] = [
  {
    id: 'perturbation',
    name: 'Perturbation',
    meta: '5 Attacks, Estimate 30-45 minutes',
    description:
      'Tests minor input tweaks such as typos, casing, unicode, paraphrasing that bypass your policy controls.',
  },
  {
    id: 'light-adversarial',
    name: 'Light Adversarial',
    meta: '45 Attacks, Estimate 2-5 hours',
    description:
      'Runs a broad library of known single-turn jailbreak techniques against each selected policy.',
  },
  {
    id: 'expert-multi-turn',
    name: 'Expert Multi-turn Adversarial',
    meta: '8 Attacks, Estimate 6-8 hours',
    description:
      'Simulates sophisticated adversaries who escalate across multiple turns to violate model behaviors.',
  },
]

export const DEFAULT_EVAL_METRICS = [
  'F1 Score',
  'Accuracy',
  'Precision',
  'Recall',
  'FPR',
  'FNR',
]
