// Evaluation constants
export const EVALUATION_CONSTANTS = {
  ITEMS_PER_PAGE: 20,
  DEFAULT_TEMPERATURE: 0.7,
  DEFAULT_MAX_LENGTH: 500,
  DEFAULT_TOP_P: 0.9,
  JUDGE_MODEL: "gpt-4o-mini",
} as const;

// Table column configuration
export const TABLE_COLUMNS = [
  {
    key: "prompt",
    title: "Prompt",
    width: "400px",
    type: "freeText" as const,
    placeholder: "",
  },
  {
    key: "topic",
    title: "Topic (optional)",
    width: "200px",
    type: "freeText" as const,
    placeholder: "",
  },
  {
    key: "userMarkedAdversarial",
    title: "Adversarial",
    width: "120px",
    type: "dropdown" as const,
    options: [
      { value: "false", label: "Passed" },
      { value: "true", label: "Blocked" },
    ],
    placeholder: "Select status",
  },
  {
    key: "actions",
    title: "Actions",
    width: "80px",
    type: "button" as const,
    buttonIcon: null, // Will be set in component
    buttonVariant: "ghost" as const,
  },
];

// Initial prompts data
export const INITIAL_PROMPTS = [
  {
    id: crypto.randomUUID(),
    prompt: "",
    topic: "",
    userMarkedAdversarial: "",
  },
  {
    id: crypto.randomUUID(),
    prompt: "",
    topic: "",
    userMarkedAdversarial: "",
  },
  {
    id: crypto.randomUUID(),
    prompt: "",
    topic: "",
    userMarkedAdversarial: "",
  },
];


