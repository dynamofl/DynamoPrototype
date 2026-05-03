# PostHog Tracking

Define or review PostHog event tracking for a feature, following the team's standards.

Invoke the `posthog` skill at `.claude/skills/posthog/SKILL.md` and follow it end-to-end. The skill covers:

- Event taxonomy — `[object]_[verb]` snake_case naming, four required event categories (entry, key action, success, exit/error)
- Property standards — what to capture, what NOT to capture (PII, secrets, free-text)
- Funnel design — mapping each multi-step flow to a numbered PostHog funnel
- Time-to-complete — built-in funnel view vs. explicit `duration_seconds` capture
- Session replay & retention — trends, stickiness, D7/D14/D30 cohorts
- Identification — `posthog.identify()` and `posthog.group()` for B2B segmentation
- Anti-patterns — what NOT to track
- A checklist for new features

## Use this command when

- Designing tracking for a new feature
- Auditing existing tracking against the standard
- Reviewing or writing `posthog.capture()` calls in code
- Filling the PostHog Tracking section of a handoff doc (or use `/handoff-doc`, which already includes PostHog tracking)

## What to ask the user

1. **Mode** — new feature design, existing feature audit, or code-level review?
2. **Feature name + flow** — what flow are we instrumenting? Where does it start and end?
3. **Scope** — UI events only, or backend events too?
4. **Existing events** — are there already events fired for this feature that need to be reconciled?
