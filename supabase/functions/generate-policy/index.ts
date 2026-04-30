// Edge Function: generate-policy
//
// Two-pass policy generation grounded in Dynamo's policy-analysis skill:
//   1. Draft pass — produces a structured policy from the user's objective
//      using the skill's drafting best practices.
//   2. Review pass — runs Semantic Boundary Collision Analysis on the draft,
//      revises in-place where it can, and returns unresolved warnings.
//
// Reference: github.com/dynamofl/agent-policy-review-skill
//   - SKILL.md (drafting + review modes)
//   - reference.md §3–4 (writing behaviors), §9 (collision analysis)

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { corsHeaders, handleCors } from '../_shared/cors.ts'

interface GeneratePolicyRequest {
  objective: string
}

type Direction = 'input' | 'output' | 'both'

interface GeneratedPolicy {
  name: string
  description: string
  useCase: string
  inputOutputDirection: Direction
  allowedBehaviors: string[]
  disallowedBehaviors: string[]
}

type WarningKind =
  | 'boundary_collision'
  | 'ambiguous_pair'
  | 'granularity_imbalance'
  | 'scope_gap'
  | 'description_contradiction'

interface PolicyWarning {
  kind: WarningKind
  severity: 'high' | 'medium' | 'low'
  behaviors: Array<{ side: 'allowed' | 'disallowed'; index: number }>
  boundaryPrompt?: string
  explanation: string
  recommendation: string
}

interface ReviewResult {
  policy: GeneratedPolicy
  warnings: PolicyWarning[]
}

// --- Prompts ----------------------------------------------------------------

const DRAFT_SYSTEM_PROMPT = `You are a policy authoring assistant for AI guardrails. You write policy definitions that downstream guardrail models will use to classify user prompts as allowed or prohibited.

The user message describes a policy to author. It may be a plain objective, OR it may use this structure:

  # User Instruction
  <the user's intent — what kind of policy they want, in their own words>

  # Reference Materials
  <guidance on how to use the materials>

  ## Reference file: <filename>
  <extracted file content>

  ## Web reference: <url>
  <extracted page content>

When the structured form is present:
- The "User Instruction" expresses intent. Phrases like "extract information from the file", "use this document", "build a policy from this" describe HOW to use the materials — they are not the subject of the policy. Do not literalize them (e.g., do not produce a policy about "extraction" or "documents").
- The "Reference Materials" are authoritative subject-matter context. Synthesize the policy from them: identify the domain, the concerns, and the concrete allowed/disallowed behaviors implied. If a reference already contains explicit allowed/disallowed lists, treat them as input to your synthesis (refine, dedupe, format per the rules below) — not as the final answer.
- The actual policy subject usually comes from the materials, not from a literal reading of the instruction.

STEP 0 — DETERMINE BEHAVIOR COUNTS (do this BEFORE drafting):
Scan the User Instruction for any number that refers to behaviors, prompts, items, examples, rules, or list size. If found, that number sets the count. Use this exact decision table:

  User wrote                                 → allowedCount, disallowedCount
  -------------------------------------------------------------------------
  (no number mentioned)                      → 5–7,   5–7    [DEFAULT]
  "10 allowed behaviors"                     → 10,    5–7
  "12 disallowed behaviors"                  → 5–7,   12
  "10 allowed and 8 disallowed"              → 10,    8
  "give me 10 behaviors"                     → 10,    10     [unqualified → both]
  "10 behaviors per side" / "10 each"        → 10,    10
  "at least 12 behaviors"                    → ≥12,   ≥12
  "generate 15 prompts per side"             → 15,    15     [prompts/items/examples = behaviors]
  "extra 5 behaviors" / "5 more behaviors"   → 5–7+5, 5–7+5  [add to default]
  "double the behaviors"                     → 10–14, 10–14
  "as many as possible"                      → 12+,   12+

Treat synonyms for "behaviors" as equivalent: prompts, items, examples, rules, scenarios, entries, points, list items.

Generate EXACTLY the count you derived from this table. Produce items individually — do not stop short citing space, ratio, or quality concerns. If the count is large, push for genuinely distinct scenarios rather than near-duplicates.

Given these inputs, produce a structured policy. Output MUST be valid JSON with these exact keys:

- name (string): short Title-Cased policy name, 3–6 words. Action-oriented; describes intent at a glance.
- description (string): 2–4 sentences. State scope, define any key terms, and end with a default-allow clause: "All behaviors not explicitly prohibited by this policy are allowed."
- useCase (string): one sentence stating the domain and intended context (e.g., "Internal Knowledge Management Chatbot used by employees to answer questions about company documents.").
- inputOutputDirection ("input" | "output" | "both"): whether the policy applies to user prompts (input), AI responses (output), or both. Infer from the objective; default to "both" if ambiguous.
- allowedBehaviors (string[]): exactly the count you determined in Step 0 for allowedCount.
- disallowedBehaviors (string[]): exactly the count you determined in Step 0 for disallowedCount.

Behavior formatting rules (apply to every item in allowedBehaviors and disallowedBehaviors):
- Start with a short category label followed by a colon, e.g. "Educational content: explain how X works without recommending it".
- Single sentence, under 25 words.
- Where helpful, embed a concrete example clause inside the sentence.
- Each behavior targets ONE clearly defined scenario — never combine multiple distinct prohibitions into one item.

Hard rules:
1. No two behaviors overlap. If two would overlap, differentiate them with distinct examples or scope qualifiers — do not merge them.
2. Allowed-to-prohibited count ratio must stay within 5:1 (or 3:1 for high-risk domains: financial, medical, legal, compensation), UNLESS the User Instruction explicitly requests a count that breaks this ratio — explicit user counts override this rule.
3. Allowed × prohibited overlap is the highest-cost defect. Before finalizing, check each allowed behavior against each prohibited behavior — if a realistic prompt could plausibly satisfy both, rewrite one of them.
4. Define every domain-specific or ambiguous term inside the description. No undefined jargon.
5. Output JSON only. No markdown, no fences, no commentary.`

const REVIEW_SYSTEM_PROMPT = `You are a policy quality reviewer applying the Semantic Boundary Collision Analysis taxonomy from the Dynamo policy-analysis skill.

You will receive the original user input followed by a draft policy in JSON. The original user input is provided for context only — use it to interpret the user's intent (e.g., explicit behavior counts they requested). Do not flag warnings for things the user explicitly asked for.

Run the following analysis:

Within-policy collision types:
- boundary_collision (HIGH): an allowed behavior's semantic scope intersects a prohibited behavior's scope. A realistic prompt could legitimately satisfy both.
- ambiguous_pair (MEDIUM): two same-role behaviors (allowed×allowed or prohibited×prohibited) that are hard to distinguish — a typical prompt could satisfy either.
- granularity_imbalance (MEDIUM): allowed-to-prohibited ratio above 5:1 (or 3:1 for high-risk domains: financial, medical, legal, compensation). Skip this warning if the original User Instruction explicitly requested a behavior count that would naturally produce this ratio — user-requested counts are not a defect.
- scope_gap (MEDIUM): a common, realistic prompt in the policy's domain that no defined behavior addresses.
- description_contradiction (HIGH): the description or scope statement claims something that conflicts with a behavior.

Procedure:
1. Enumerate every allowed × prohibited pair, every allowed × allowed pair, every prohibited × prohibited pair. Assess each for semantic overlap.
2. Compute the granularity ratio (larger count ÷ smaller count).
3. Identify scope gaps for the stated domain.
4. Compare the description against each behavior for contradictions.
5. **Revise the draft in place** to fix every collision you can resolve by rewording (tighten scope, add a qualifier, add a distinguishing example). Never merge or delete behaviors. If you cannot resolve a collision by rewording, leave it and report it as a warning.
6. After revision, re-check. Only emit a warning if it remains true of the REVISED policy.

Every boundary_collision and ambiguous_pair warning MUST include a "boundaryPrompt" — a concrete realistic prompt that triggers the ambiguity. A collision without a boundary prompt is not actionable; do not emit it.

Output MUST be valid JSON with these exact top-level keys:
- policy: same shape as the input (name, description, useCase, inputOutputDirection, allowedBehaviors, disallowedBehaviors). This is the REVISED version.
- warnings: array of warning objects:
  - kind: "boundary_collision" | "ambiguous_pair" | "granularity_imbalance" | "scope_gap" | "description_contradiction"
  - severity: "high" | "medium" | "low"
  - behaviors: array of { side: "allowed" | "disallowed", index: number } pointing into the REVISED policy's arrays. Empty array allowed for granularity_imbalance and scope_gap.
  - boundaryPrompt: string. REQUIRED for boundary_collision and ambiguous_pair. Omit for other kinds.
  - explanation: 1–2 sentences on what the issue is and why it matters.
  - recommendation: a concrete fix the user could apply.

Output JSON only. No markdown, no fences, no commentary.`

// --- LLM call ---------------------------------------------------------------

const MODEL = 'gpt-4o-mini' // Upgrade to 'gpt-4o' for higher-quality reviews.

async function callOpenAI(
  apiKey: string,
  systemPrompt: string,
  userContent: string,
  temperature: number,
): Promise<string> {
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: MODEL,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userContent },
      ],
      temperature,
      response_format: { type: 'json_object' },
    }),
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`OpenAI ${res.status}: ${text}`)
  }
  const json = await res.json()
  const content = json?.choices?.[0]?.message?.content
  if (typeof content !== 'string') {
    throw new Error('OpenAI returned an empty response')
  }
  return content
}

// --- Validation -------------------------------------------------------------

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((v) => typeof v === 'string')
}

function isPolicy(value: unknown): value is GeneratedPolicy {
  if (!value || typeof value !== 'object') return false
  const v = value as Record<string, unknown>
  return (
    typeof v.name === 'string' &&
    typeof v.description === 'string' &&
    typeof v.useCase === 'string' &&
    (v.inputOutputDirection === 'input' ||
      v.inputOutputDirection === 'output' ||
      v.inputOutputDirection === 'both') &&
    isStringArray(v.allowedBehaviors) &&
    isStringArray(v.disallowedBehaviors)
  )
}

function isReviewResult(value: unknown): value is ReviewResult {
  if (!value || typeof value !== 'object') return false
  const v = value as Record<string, unknown>
  if (!isPolicy(v.policy)) return false
  if (!Array.isArray(v.warnings)) return false
  return v.warnings.every((w) => {
    if (!w || typeof w !== 'object') return false
    const wo = w as Record<string, unknown>
    return (
      typeof wo.kind === 'string' &&
      typeof wo.severity === 'string' &&
      typeof wo.explanation === 'string' &&
      typeof wo.recommendation === 'string' &&
      Array.isArray(wo.behaviors)
    )
  })
}

// --- Handler ----------------------------------------------------------------

serve(async (req: Request) => {
  const corsResponse = handleCors(req)
  if (corsResponse) return corsResponse

  try {
    const apiKey = Deno.env.get('OPENAI_API_KEY')
    if (!apiKey) {
      return jsonError('OpenAI API key not configured', 500)
    }

    const { objective }: GeneratePolicyRequest = await req.json()
    if (!objective || typeof objective !== 'string' || !objective.trim()) {
      return jsonError('Missing required field: objective', 400)
    }

    // Pass 1 — Draft.
    const draftRaw = await callOpenAI(
      apiKey,
      DRAFT_SYSTEM_PROMPT,
      `Objective: ${objective.trim()}`,
      0.4,
    )
    let draft: unknown
    try {
      draft = JSON.parse(draftRaw)
    } catch {
      console.error('Draft pass returned invalid JSON:', draftRaw)
      return jsonError('Draft pass returned invalid JSON', 502)
    }
    if (!isPolicy(draft)) {
      console.error('Draft did not match expected shape:', draft)
      return jsonError('Draft did not match expected shape', 502)
    }

    // Pass 2 — Review + revise.
    let reviewed: ReviewResult | null = null
    try {
      const reviewRaw = await callOpenAI(
        apiKey,
        REVIEW_SYSTEM_PROMPT,
        `Original user input:\n${objective.trim()}\n\nDraft policy:\n${JSON.stringify(draft, null, 2)}`,
        0.2,
      )
      const parsed = JSON.parse(reviewRaw)
      if (isReviewResult(parsed)) {
        reviewed = parsed
      } else {
        console.warn('Review pass returned invalid shape; using draft.')
      }
    } catch (err) {
      console.warn('Review pass failed; using draft.', err)
    }

    const policy = reviewed?.policy ?? draft
    const warnings = reviewed?.warnings ?? []

    return jsonOk({ policy, warnings })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    console.error('generate-policy error:', err)
    return jsonError(message, 500)
  }
})

function jsonOk(body: unknown) {
  return new Response(JSON.stringify(body), {
    status: 200,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}

function jsonError(message: string, status: number) {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}
