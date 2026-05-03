# Handoff Doc

Create or update a developer-facing design handoff doc for a feature, following the project's standard structure.

Invoke the `handoff-doc` skill at `.claude/skills/handoff-doc/SKILL.md` and follow it end-to-end. The skill enumerates the required sections, the PostHog tracking table format, screenshot/video placeholder conventions, the workflow, and anti-patterns.

## Intake — ALWAYS ask these five questions before writing

Stop and wait for answers. Do not assume defaults beyond what's listed below. If the user already provided some answers in their message, confirm them and ask only for the missing ones.

1. **Output format** — Notion page or local Markdown file in the repo?
2. **Output location**
   - If Notion: target page URL (existing empty page) or parent page URL + new page title
   - If local `.md`: filepath (default `.claude/Feature Requirement Docs/<kebab-case-feature>.md`)
3. **Reference handoff** — URL or path of an existing handoff to match in tone/depth, if any
4. **Feature scope** — which screens / sub-features are in, and explicitly what is **out of scope**
5. **Code area** — directory under `src/` to explore for file paths and submit/API wiring state

## What to do after intake

1. Read `.claude/skills/handoff-doc/SKILL.md` to load the current spec.
2. Fetch the reference doc (if provided) and the target Notion page (if applicable).
3. Explore the code area with the Explore subagent to gather file paths, component names, and the current state of the submit/API wiring.
4. Confirm scope back to the user one more time before writing.
5. Write to the chosen destination using the format-specific syntax table in the skill (Notion HTML primitives vs. GitHub-flavored Markdown).
6. Leave placeholders for every video and screenshot — never fabricate URLs.
7. Always include the PostHog Tracking table on every task.
