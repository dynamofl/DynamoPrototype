// Edge Function: proofread-policy
//
// Reviews an existing policy draft using Dynamo's policy-analysis skill
// (github.com/dynamofl/agent-policy-review-skill — SKILL.md "Policy Review
// Mode" + reference.md §9 Semantic Boundary Collision Analysis) and returns
// a structured set of edits the frontend can apply as proposed changes:
// Add (new behavior), Update (rewrite an existing behavior), Remove (drop
// a redundant or contradictory behavior).
//
// One-pass design: the LLM is given the current policy + reference file
// names, performs the review internally, and returns ONLY the actionable
// edits — no warnings, no narrative — so the frontend can render
// individual accept/reject affordances per change.

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { corsHeaders, handleCors } from '../_shared/cors.ts'

interface ProofreadRequest {
  policy: {
    name: string
    description: string
    allowed: string[]
    disallowed: string[]
  }
  references?: { name: string }[]
}

type SuggestionType = 'add' | 'update' | 'remove'
type Side = 'allowed' | 'disallowed'

interface ProofreadSuggestion {
  type: SuggestionType
  side: Side
  index?: number       // for update/remove — 0-based into the original array
  newText?: string     // for add/update
  rationale?: string
}

interface ProofreadResponse {
  suggestions: ProofreadSuggestion[]
}

// --- Prompt -----------------------------------------------------------------

const SYSTEM_PROMPT = `You are a policy quality reviewer applying Dynamo's policy-analysis skill (SKILL.md "Policy Review Mode" and reference.md §9 Semantic Boundary Collision Analysis).

You will receive a policy draft in JSON with these fields:
- name: policy title
- description: scope and definitions
- allowed: array of permitted behaviors
- disallowed: array of prohibited behaviors

Optionally a "references" array lists filenames of source materials the user attached (you cannot read them — treat them as a hint that the policy is grounded in those documents).

Your job is to produce concrete, copy-paste-ready edits that improve the policy. Apply the following analyses (per reference.md §9):

1. Boundary collision (HIGH): an allowed behavior's scope intersects a prohibited behavior's scope so a realistic prompt could plausibly satisfy both. Fix by rewriting the weaker side with a tighter qualifier — emit an "update" edit. Never merge or delete.
2. Ambiguous pair (MEDIUM): two same-role behaviors (allowed×allowed or prohibited×prohibited) that a typical prompt could satisfy either. Fix by sharpening one side — emit an "update" edit.
3. Granularity imbalance: ratio of larger ÷ smaller > 5:1 (or 3:1 for high-risk domains: financial, medical, legal, compensation). Fix by adding behaviors to the underspecified side — emit "add" edits.
4. Scope gap: a common prompt type in the policy's domain that no behavior addresses. Fix by adding a new allowed or disallowed behavior — emit an "add" edit.
5. Description contradiction: a behavior contradicts the description. Fix by updating the behavior — emit an "update" edit.
6. Redundancy: two behaviors say the same thing in different words. Fix by removing the weaker one — emit a "remove" edit.

Behavior formatting rules (apply to every "add" and "update" newText):
- Start with a short category label followed by a colon, e.g. "Educational content: explain how X works without recommending it".
- Single sentence, under 25 words.
- Where helpful, embed a concrete example clause inside the sentence.
- Targets ONE clearly defined scenario.

Output MUST be valid JSON with exactly this shape:

{
  "suggestions": [
    {
      "type": "add" | "update" | "remove",
      "side": "allowed" | "disallowed",
      "index": <0-based index into the original side's array; REQUIRED for update and remove, OMIT for add>,
      "newText": "<new behavior text; REQUIRED for add and update, OMIT for remove>",
      "rationale": "<one short sentence on why this change>"
    }
  ]
}

Hard rules:
- "index" must be a valid 0-based index into policy.allowed (when side="allowed") or policy.disallowed (when side="disallowed") at the moment of input. Do not shift indices for adds.
- Do NOT propose changes that don't materially improve the policy. If the policy is already strong, return { "suggestions": [] }.
- Cap suggestions at 6 total. Prioritize HIGH-severity issues (boundary collisions, description contradictions).
- Output JSON only. No markdown, no fences, no commentary.`

// --- LLM call ---------------------------------------------------------------

const MODEL = 'gpt-4o-mini'

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

function isStringArray(v: unknown): v is string[] {
  return Array.isArray(v) && v.every((x) => typeof x === 'string')
}

function validateAndNormalize(
  parsed: unknown,
  allowedLen: number,
  disallowedLen: number,
): ProofreadResponse | null {
  if (!parsed || typeof parsed !== 'object') return null
  const root = parsed as Record<string, unknown>
  if (!Array.isArray(root.suggestions)) return null

  const out: ProofreadSuggestion[] = []
  for (const raw of root.suggestions) {
    if (!raw || typeof raw !== 'object') continue
    const s = raw as Record<string, unknown>
    const type = s.type
    const side = s.side
    if (type !== 'add' && type !== 'update' && type !== 'remove') continue
    if (side !== 'allowed' && side !== 'disallowed') continue

    const sideLen = side === 'allowed' ? allowedLen : disallowedLen
    const item: ProofreadSuggestion = { type, side }

    if (typeof s.rationale === 'string') item.rationale = s.rationale

    if (type === 'add') {
      if (typeof s.newText !== 'string' || !s.newText.trim()) continue
      item.newText = s.newText.trim()
    } else if (type === 'update') {
      if (typeof s.index !== 'number' || s.index < 0 || s.index >= sideLen) continue
      if (typeof s.newText !== 'string' || !s.newText.trim()) continue
      item.index = s.index
      item.newText = s.newText.trim()
    } else {
      // remove
      if (typeof s.index !== 'number' || s.index < 0 || s.index >= sideLen) continue
      item.index = s.index
    }

    out.push(item)
  }

  return { suggestions: out }
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

    const body = (await req.json()) as ProofreadRequest
    const policy = body?.policy
    if (
      !policy ||
      typeof policy.name !== 'string' ||
      typeof policy.description !== 'string' ||
      !isStringArray(policy.allowed) ||
      !isStringArray(policy.disallowed)
    ) {
      return jsonError(
        'Missing or invalid required field: policy { name, description, allowed[], disallowed[] }',
        400,
      )
    }

    const referenceLines =
      Array.isArray(body.references) && body.references.length > 0
        ? body.references
            .map((r, i) => `  ${i + 1}. ${r?.name ?? '(unnamed)'}`)
            .join('\n')
        : '(none provided)'

    const userContent =
      `Policy under review:\n${JSON.stringify(policy, null, 2)}\n\n` +
      `Reference materials attached by the user (filenames only — content not available here):\n${referenceLines}`

    const raw = await callOpenAI(apiKey, SYSTEM_PROMPT, userContent, 0.2)

    let parsed: unknown
    try {
      parsed = JSON.parse(raw)
    } catch {
      console.error('Proofread returned invalid JSON:', raw)
      return jsonError('Proofread returned invalid JSON', 502)
    }

    const validated = validateAndNormalize(
      parsed,
      policy.allowed.length,
      policy.disallowed.length,
    )
    if (!validated) {
      console.error('Proofread did not match expected shape:', parsed)
      return jsonError('Proofread did not match expected shape', 502)
    }

    return jsonOk(validated)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    console.error('proofread-policy error:', err)
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
