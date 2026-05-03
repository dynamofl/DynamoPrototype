# UI Craft

Apply (or review against) the team's UI craft principles — the small details that make interfaces feel polished.

Invoke the `ui-craft` skill at `.claude/skills/ui-craft/SKILL.md` and follow it end-to-end. The skill covers:

- **Surfaces** — concentric border radius, optical alignment, shadows over borders, image outlines, minimum hit areas
- **Typography** — `text-wrap: balance` / `pretty`, `-webkit-font-smoothing: antialiased`, `tabular-nums`
- **Animations** — interruptible CSS transitions vs. keyframes, split + staggered enter animations, subtle exits, contextual icon animations (`scale 0.25→1`, `blur 4px→0`, `bounce: 0`), `scale(0.96)` on press, `initial={false}` on `AnimatePresence`
- **Performance** — never `transition: all`, `will-change` only on `transform`/`opacity`/`filter`
- **Project rules** — Tailwind only; palette restricted to `gray`, `red`, `green`, `amber`; no `bg-white` (use `bg-gray-0`); Title Case for headings/titles/labels
- A required Before/After review table format, plus a checklist

## Use this command when

- Polishing a component or screen ("make it feel better", "feels off")
- Reviewing a frontend PR or branch for UI craft issues
- Implementing animations, hover/press states, shadows, borders, typography details
- Auditing existing UI against the principles before a handoff or release

## Intake — ALWAYS ask these four before doing any work

Stop and wait for answers. If the user already provided some in their message (or via an IDE-opened file), confirm them and ask only for the missing ones. Don't proceed without at minimum **scope** and **mode**.

| # | Question | Notes / defaults |
| --- | --- | --- |
| 1 | **Scope** — which file(s), component(s), route(s), or branch diff? | If an IDE file is open, propose it as default and confirm. |
| 2 | **Aspect(s)** — which categories should I focus on? | Pick from: **Surfaces** · **Typography** · **Animations** · **Performance** · **Gestures** · **Project rules** · **All**. Default `All` if the user is brief. |
| 3 | **Mode** — `apply` (edit code), `review` (Before/After tables only), or `both`? | No default — must be explicit. |
| 4 | **Constraints / exceptions** — anything to leave alone? | E.g. colors deliberately outside the project palette, animation values from an external spec, third-party output. Default "none." |

After answers, follow `.claude/skills/ui-craft/SKILL.md` end-to-end — only loading the reference files matching the chosen aspects (don't read all of them every run).

## Output expectation

When reviewing, group findings by principle and present them as Before/After markdown tables (per the skill's "Review Output Format" section). Skip any principle where nothing needed to change — empty tables add noise. When applying, make the edits, then report a one-line-per-change summary at the end.
