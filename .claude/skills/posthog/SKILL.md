---
name: posthog
description: Use this skill whenever defining PostHog event tracking for a feature, writing PostHog instrumentation code, or filling out the PostHog Tracking section of a handoff doc. Codifies the team's event taxonomy ([object]_[verb] snake_case), property standards, funnel design, identify/group conventions, time-to-complete tracking, and anti-patterns. Auto-loaded by the handoff-doc skill.
---

# PostHog Skill

Standards for instrumenting features with PostHog. Codified 2026-05-01 to keep event taxonomy consistent, funnels meaningful, and analytics data useful instead of noisy.

## 1. Event Taxonomy — naming convention

**Format:** `[object]_[verb]` in `snake_case`. The object is the noun being acted on; the verb is past tense for completed actions, or imperative for user-initiated triggers.

✅ Good — `model_trained`, `dataset_uploaded`, `report_generated`, `evaluation_started`, `policy_selected`, `eval_run_submitted`
❌ Bad — `clickedRunButton`, `user_did_thing`, `submitButtonClicked`, `eval` (verb missing), `unified_eval_create_step_viewed` (over-namespaced — see below)

Namespace prefixes (e.g. `unified_eval_*`) are acceptable only when the same object name appears in multiple unrelated features and would collide. Default to no prefix.

For each new feature, identify the **four event categories**. A feature missing any category is under-instrumented — call this out in the handoff's Open Items.

| Category | Purpose | Example |
|---|---|---|
| **Entry** | User starts the flow | `feature_opened`, `wizard_started`, `eval_creation_opened` |
| **Key Action(s)** | Meaningful steps within the flow | `policy_selected`, `attack_toggled`, `dataset_uploaded` |
| **Success / Completion** | What "done" looks like | `evaluation_completed`, `report_published`, `eval_run_created` |
| **Exit / Error** | Where things go wrong | `submission_failed`, `wizard_abandoned`, `eval_run_create_failed` |

## 2. Properties — capture rich context, never PII

Every event MUST carry properties beyond the name. There is no upper limit; unused properties cost almost nothing. Over-capture is fine, under-capture is not.

**Always include where applicable:**
- Object IDs — `policy_id`, `eval_run_id`, `model_id`
- Counts and sizes — `selected_policy_count`, `dataset_size`, `total_steps`
- Categorical context — `evaluation_type`, `attack_severity`, `trigger: 'manual' | 'scheduled'`
- Outcome metadata — `duration_seconds`, `error_code`, `latency_ms`

**Never include:**
- PII — emails, names, free-text input, prompt content, dataset rows
- Secrets — API keys, tokens, password fields
- Long blobs — log lengths and counts instead (`prompt_length: 1245` not `prompt: "..."`)

**Code template:**

```ts
posthog.capture('model_evaluation_started', {
  model_type: 'llm',
  dataset_size: 5000,
  evaluation_type: 'safety',
  trigger: 'manual',
})
```

## 3. Funnels — map every flow

Every multi-step feature flow should map cleanly to a PostHog funnel. Define the funnel events as part of the design handoff so the developer instruments them in the right order.

Example — Unified Eval Creation funnel:
1. `eval_creation_opened` (entry)
2. `policy_selected` (key action)
3. `eval_step_continued` (transition)
4. `attack_toggled` (key action, optional)
5. `eval_run_submitted` (success precursor)
6. `eval_run_created` (success)

The handoff PostHog Tracking table MUST include a `Funnel Step` column when the events form a funnel — number the steps so the developer can wire the funnel directly in PostHog without translation.

## 4. Time-to-complete

PostHog funnels include a built-in time-to-convert view — use it for step-to-step latency with no extra instrumentation.

Capture explicit `duration_seconds` ONLY when:
- The action spans multiple sessions (server-side tracking needed)
- Sub-step granularity matters more than what PostHog can infer
- Backend latency is the metric you care about (use `api_latency_ms`)

```ts
posthog.capture('evaluation_completed', {
  duration_seconds: (Date.now() - startTime) / 1000,
  steps_completed: 4,
})
```

## 5. Session Replay & Retention

- **Session replay** — enabled at project level. Filter recordings by users who dropped at a specific funnel step to watch the "why" behind drop-off.
- **Trends** — weekly unique users on key actions = adoption.
- **Stickiness** — days/week or days/month a user returns = engagement.
- **Retention** — D7 / D14 / D30 cohorts of first-use users.

These don't require per-event instrumentation, but they DO require the Entry and Success events from §1 to be wired correctly.

## 6. Identification (B2B)

This is a B2B product — every event should be tied to a person AND a company.

```ts
posthog.identify(userId, {
  email,
  plan,        // 'free' | 'pro' | 'enterprise'
  role,        // 'admin' | 'reviewer' | 'viewer'
})

posthog.group('company', companyId, {
  name: companyName,
  tier: 'enterprise',
})
```

Wire `identify` on login (post-auth). Wire `group` on the first event after login or whenever company context is known. This unlocks segment-level filters across every funnel and insight (e.g. "which enterprise companies are struggling at step 3?").

## 7. Anti-patterns

- **Don't** track DOM-level events. Track the *intent* (`policy_selected`), not the input (`button_clicked`).
- **Don't** include free-text fields, email addresses, or prompt content in properties.
- **Don't** create one event per UI variant. The variant is a property: `posthog.capture('eval_run_submitted', { variant: 'v2' })`.
- **Don't** ship a feature without an error/exit event — drop-off becomes invisible.
- **Don't** namespace events with file paths or component names — namespace by domain object.
- **Don't** track every keystroke or hover. Track meaningful intent only.

## Checklist for a New Feature

Use this when designing tracking for a feature (and when filling the PostHog Tracking section of a handoff doc):

- [ ] Defined all four event categories (entry, key action, success, exit/error)
- [ ] All event names are `[object]_[verb]` snake_case
- [ ] Each event has 3+ properties beyond name (IDs, counts, categorical context)
- [ ] No PII / free-text / secrets in any property
- [ ] Funnel sequence written out with `Funnel Step` numbering
- [ ] `identify()` is called on login with email/plan/role
- [ ] `group('company', ...)` is called for company-scoped sessions
- [ ] Error/failure event includes `error_code` and `latency_ms`
- [ ] Status column tracked per event: `To be added` → `Implemented`

## Handoff Tracking Table Schema

When this skill is invoked from a handoff doc, the tracking table for each task should use this schema:

| Funnel Step | Event Name | Trigger | Properties | Status |
|---|---|---|---|---|
| 1 | `eval_creation_opened` | User lands on Step 1 | `{ entry_source: 'sidebar' \| 'cta' }` | To be added |
| 2 | `policy_selected` | User checks a policy | `{ policy_id, policy_name, total_selected }` | To be added |
| ... | ... | ... | ... | ... |

If the events don't form a single funnel (e.g. ambient tracking), drop the `Funnel Step` column.

## Updating This Skill

This skill is plain markdown at `.claude/skills/posthog/SKILL.md` and is meant to evolve.

- Edit `SKILL.md` directly to add/refine standards. The `description` field in YAML frontmatter controls auto-trigger surface.
- Slash command at `.claude/commands/posthog.md` invokes this skill on demand.
- The `handoff-doc` skill defers to this skill for its PostHog Tracking section — changes here propagate automatically to all future handoffs.
- Memory pointer at `~/.claude/projects/-Users-pratheepkumarc-Documents-Development-DynamoPrototypePublic/memory/feedback_posthog_skill.md` ensures auto-trigger on tracking-related prompts.
