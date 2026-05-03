---
name: ui-craft
description: Design engineering principles for making interfaces feel polished. Use when building UI components, reviewing frontend code, implementing animations, hover states, shadows, borders, typography, micro-interactions, enter/exit animations, or any visual detail work. Triggers on UI polish, design details, "make it feel better", "feels off", stagger animations, border radius, optical alignment, font smoothing, tabular numbers, image outlines, box shadows.
---

# UI Craft — details that make interfaces feel better

Great interfaces rarely come from a single thing. It's usually a collection of small details that compound into a great experience. Apply these principles when building or reviewing UI code.

> Adapted from [jakubkrehel/make-interfaces-feel-better](https://github.com/jakubkrehel/make-interfaces-feel-better) and [emilkowalski/skill](https://github.com/emilkowalski/skill).

## Intake — ALWAYS ask these before applying or reviewing

This skill covers six topic areas (surfaces, typography, animations, performance, gestures, project rules). Don't guess what the user wants — running every check on every file produces noisy, overwhelming output.

If the user already answered some of these in their message (e.g., "review animations on the create-eval-run page"), confirm what they gave you and ask only for the missing pieces. Otherwise, ask all four:

1. **Scope** — which file(s), component(s), route(s), branch diff, or PR? If they say "this file" with an IDE-opened file in context, confirm the path back to them.
2. **Aspect(s)** — which category should I focus on? Pick one or more, or "All":
   - **Surfaces** — border radius, optical alignment, shadows, image outlines, hit areas → see [surfaces.md](surfaces.md)
   - **Typography** — text wrapping, font smoothing, tabular numbers → see [typography.md](typography.md)
   - **Animations** — easing/duration, enter/exit, icon transitions, springs, blur masking, `prefers-reduced-motion` → see [animations.md](animations.md)
   - **Performance** — `transition: all`, `will-change`, GPU compositing, Framer Motion gotchas → see [performance.md](performance.md)
   - **Gestures** — drag, swipe, pointer capture, multi-touch → see [gestures.md](gestures.md)
   - **Project rules** — Tailwind palette (`gray`/`red`/`green`/`amber`), no `bg-white`, Title Case
   - **All** — full sweep across every aspect
3. **Mode** — `apply` (edit the code), `review` (Before/After tables only, no edits), or `both`?
4. **Constraints / exceptions** — anything that should be left alone? Common cases: colors deliberately outside the project palette, animation values copied from an external library spec, third-party component output that isn't safe to edit.

**Don't proceed without at minimum: scope and mode.** Aspect defaults to `All` if the user is brief; constraints defaults to "none" if they don't mention any.

If the user invoked the skill from the slash command (`/ui-craft`) and gave no other context, the slash command's intake table covers the same questions — answer there, then proceed.

## Philosophy

- **Taste is trained, not innate.** Reverse-engineer interfaces you admire. Ask *why* something feels good before copying it.
- **Unseen details compound.** Most polish is invisible individually; in aggregate it's the difference between "fine" and "loved."
- **Beauty is leverage.** Defaults and motion are real differentiators — they change which tool people pick, not just how it works.

## Quick Reference

| Category | When to Use |
| --- | --- |
| [Typography](typography.md) | Text wrapping, font smoothing, tabular numbers |
| [Surfaces](surfaces.md) | Border radius, optical alignment, shadows, image outlines, hit areas |
| [Animations](animations.md) | Decision framework, easing/duration, interruptible transitions, enter/exit, icon animations, springs, `@starting-style`, blur masking, accessibility |
| [Performance](performance.md) | Transition specificity, `will-change`, GPU compositing, Framer Motion gotchas, CSS-variable inheritance |
| [Gestures](gestures.md) | Drag interactions, momentum dismissal, boundary damping, pointer capture, multi-touch protection |

## Before You Animate (Decision Framework)

Run through these in order before adding any animation. See [animations.md](animations.md#animation-decision-framework) for the full version.

1. **Should it animate at all?** How often will users see it?
   - **100+ times/day** (keyboard shortcuts, command-palette toggle) → **no animation, ever.** Raycast has no open/close animation for exactly this reason.
   - **Tens of times/day** (hover, list nav) → drastically reduce or remove.
   - **Occasional** (modals, drawers, toasts) → standard animation.
   - **Rare/first-time** (onboarding, celebrations) → can add delight.
2. **What's the purpose?** Spatial consistency, state indication, feedback, or preventing jarring changes. If the answer is "looks cool" and the user sees it often, don't.
3. **What easing?** Enter/exit → `ease-out`. On-screen movement → `ease-in-out`. Hover/color → `ease`. Constant motion → `linear`. **Never `ease-in` for UI** — it delays the moment the user is watching most closely.
4. **How fast?** Buttons 100–160ms · tooltips 125–200ms · dropdowns 150–250ms · modals/drawers 200–500ms. **Keep UI under 300ms.**

## Core Principles

### 1. Concentric Border Radius

Outer radius = inner radius + padding. Mismatched radii on nested elements is the most common thing that makes interfaces feel off.

### 2. Optical Over Geometric Alignment

When geometric centering looks off, align optically. Buttons with icons, play triangles, and asymmetric icons all need manual adjustment.

### 3. Shadows Over Borders

Layer multiple transparent `box-shadow` values for natural depth. Shadows adapt to any background; solid borders don't.

### 4. Interruptible Animations

Use CSS transitions for interactive state changes — they can be interrupted mid-animation. Reserve keyframes for staged sequences that run once.

### 5. Split and Stagger Enter Animations

Don't animate a single container. Break content into semantic chunks and stagger each. **30–80ms** between items feels snappy and modern; **~100ms** is fine for larger hero-style page enters where each chunk is a distinct beat. Keep total stagger time short — long staggers make the interface feel slow, and stagger should never block interaction.

### 6. Subtle Exit Animations

Use a small fixed `translateY` instead of full height. Exits should be softer than enters.

### 7. Contextual Icon Animations

Animate icons with `opacity`, `scale`, and `blur` instead of toggling visibility. Use exactly these values: scale from `0.25` to `1`, opacity from `0` to `1`, blur from `4px` to `0px`. If the project has `motion` or `framer-motion` in `package.json`, use `transition: { type: "spring", duration: 0.3, bounce: 0 }` — bounce must always be `0`. If no motion library is installed, keep both icons in the DOM (one absolute-positioned) and cross-fade with CSS transitions using `cubic-bezier(0.2, 0, 0, 1)` — this gives both enter and exit animations without any dependency.

### 8. Font Smoothing

Apply `-webkit-font-smoothing: antialiased` to the root layout on macOS for crisper text.

### 9. Tabular Numbers

Use `font-variant-numeric: tabular-nums` for any dynamically updating numbers to prevent layout shift.

### 10. Text Wrapping

Use `text-wrap: balance` on headings. Use `text-wrap: pretty` for body text to avoid orphans.

### 11. Image Outlines

Add a subtle `1px` outline with low opacity to images for consistent depth. The color must be pure black in light mode (`rgba(0, 0, 0, 0.1)`) and pure white in dark mode (`rgba(255, 255, 255, 0.1)`) — never a near-black like slate, zinc, or any tinted neutral. A tinted outline picks up the surface color underneath it and reads as dirt on the image edge.

### 12. Scale on Press

A subtle scale-down on click gives buttons tactile feedback. Use `scale(0.96)` as the project default; anywhere in the `0.95–0.98` range is acceptable depending on button size (smaller buttons → closer to `0.97`, larger surfaces → closer to `0.95`). **Never go below `0.95`** — it feels exaggerated. Pair with `transition: transform 100–160ms ease-out` so a release mid-press reverses smoothly. Add a `static` prop to disable it when motion would be distracting (e.g., destructive confirms, dense toolbars).

### 13. Skip Animation on Page Load

Use `initial={false}` on `AnimatePresence` to prevent enter animations on first render. Verify it doesn't break intentional entrance animations.

### 14. Never Use `transition: all`

Always specify exact properties: `transition-property: scale, opacity`. Tailwind's `transition-transform` covers `transform, translate, scale, rotate`.

### 15. Use `will-change` Sparingly

Only for `transform`, `opacity`, `filter` — properties the GPU can composite. Never use `will-change: all`. Only add when you notice first-frame stutter.

### 16. Minimum Hit Area

Interactive elements need at least 40×40px hit area. Extend with a pseudo-element if the visible element is smaller. Never let hit areas of two elements overlap.

### 17. Never Animate from `scale(0)`

Nothing in the real world appears from nothing. Start enters from `scale(0.9)`–`scale(0.95)` combined with `opacity: 0`. The exception is the contextual icon-animation pattern (#7), which has its own enforced `0.25` value paired with blur to bridge the gap.

### 18. Origin-Aware Popovers (Modals Excepted)

Popovers, dropdowns, and tooltips should scale in from their trigger, not from center. The browser default `transform-origin: center` is wrong for almost every popover. Use the library's variable: `var(--radix-popover-content-transform-origin)` for Radix, `var(--transform-origin)` for Base UI. **Modals are the exception** — they're not anchored to a trigger, so keep `transform-origin: center`.

### 19. Custom Easing Curves — Never `ease-in` for UI

The built-in CSS easings are too weak. Use stronger custom curves so motion feels intentional:

```css
--ease-out:    cubic-bezier(0.23, 1, 0.32, 1);    /* enter/exit */
--ease-in-out: cubic-bezier(0.77, 0, 0.175, 1);   /* on-screen movement */
--ease-drawer: cubic-bezier(0.32, 0.72, 0, 1);    /* iOS-style drawers */
```

**Never use `ease-in` for UI** — it delays the initial movement, the exact moment the user is watching most closely. A 300ms `ease-in` dropdown *feels* slower than a 300ms `ease-out` one.

### 20. Asymmetric Enter/Exit Timing

Exit animations should be **shorter and softer** than enters. The user's attention is moving to the next thing — don't fight for it. Same idea applies to deliberate-vs-responsive: hold-to-delete can be 2s linear on press, but the release must snap back in ~200ms ease-out. Slow where the user is deciding, fast where the system is responding.

### 21. Honor `prefers-reduced-motion` and Gate Hover by Pointer Type

Reduced motion means **fewer and gentler** animations, not zero — keep opacity/color transitions that aid comprehension; remove transform-based motion. Gate every hover-triggered animation behind `@media (hover: hover) and (pointer: fine)` so touch devices don't trigger phantom hover states on tap.

```css
@media (prefers-reduced-motion: reduce) {
  .element { transition: opacity 200ms ease; transform: none; }
}
@media (hover: hover) and (pointer: fine) {
  .button:hover { transform: scale(1.05); }
}
```

## Project Tailwind Constraints

This project's `.claude/CLAUDE.md` enforces these on top of the principles above — apply them whenever the snippets below would otherwise reach for a forbidden token:

- Use Tailwind classes for all UI components.
- Color palette is restricted to `gray`, `red`, `green`, `amber`. Don't introduce slate, zinc, neutral, blue, etc.
- Use Title Case for headings, titles, and labels.
- Don't use `bg-white` — use `bg-gray-0` when a white surface is required.

## Common Mistakes

| Mistake | Fix |
| --- | --- |
| Same border radius on parent and child | Calculate `outerRadius = innerRadius + padding` |
| Icons look off-center | Adjust optically with padding or fix SVG directly |
| Hard borders between sections | Use layered `box-shadow` with transparency |
| Jarring enter/exit animations | Split, stagger, and keep exits subtle |
| Numbers cause layout shift | Apply `tabular-nums` |
| Heavy text on macOS | Apply `antialiased` to root |
| Animation plays on page load | Add `initial={false}` to `AnimatePresence` |
| `transition: all` on elements | Specify exact properties |
| First-frame animation stutter | Add `will-change: transform` (sparingly) |
| Tiny hit areas on small controls | Extend with pseudo-element to 40×40px |
| Animation on a keyboard-shortcut action | Remove the animation entirely |
| `ease-in` on a UI transition | Switch to `ease-out` (or a custom cubic-bezier) |
| Element animates in from `scale(0)` | Start from `scale(0.95)` with `opacity: 0` |
| Popover/dropdown scales from center | Use `transform-origin: var(--radix-popover-content-transform-origin)` (modals stay centered) |
| Hover transform without media gating | Wrap in `@media (hover: hover) and (pointer: fine)` |
| Same duration for enter and exit | Make exit ~50% shorter than enter |
| Crossfade between two states looks like overlapping ghosts | Add a brief `filter: blur(2–4px)` to bridge them |
| Framer Motion `animate={{ x }}` drops frames under load | Animate `transform: "translateX()"` string instead |
| Updating a CSS variable on a parent to drive a child animation | Set `transform` directly on the target element |

## Review Output Format

Always present changes as a markdown table with **Before** and **After** columns. Include every change you made — not just a subset. Never list findings as separate "Before:" / "After:" lines outside of a table. Group changes by principle using a heading above each table, and keep each row focused on a single diff so the reader can scan the whole list quickly.

### Example

#### Concentric border radius
| Before | After |
| --- | --- |
| `rounded-xl` on card + `rounded-xl` on inner button (`p-2`) | `rounded-2xl` on card (`12 + 8`), `rounded-lg` on inner button |
| `border-radius: 16px` on both nested surfaces | Outer `24px`, inner `16px` with `8px` padding |

#### Tabular numbers
| Before | After |
| --- | --- |
| `<span>{count}</span>` on animated counter | `<span className="tabular-nums">{count}</span>` |
| Default numerals on timer | Added `font-variant-numeric: tabular-nums` to root |

#### Scale on press
| Before | After |
| --- | --- |
| `<button className="...">` | Added `active:scale-[0.96] transition-transform` |
| `scale(0.9)` on press | Raised to `scale(0.96)` — anything below `0.95` feels exaggerated |

Rows should cite the specific file and the specific property that changed when it isn't obvious from the snippet. If a principle was reviewed but nothing needed to change, omit that table entirely — empty tables add noise.

## Review Checklist

- [ ] Nested rounded elements use concentric border radius
- [ ] Icons are optically centered, not just geometrically
- [ ] Shadows used instead of borders where appropriate
- [ ] Enter animations are split and staggered
- [ ] Exit animations are subtle
- [ ] Dynamic numbers use tabular-nums
- [ ] Font smoothing is applied
- [ ] Headings use text-wrap: balance
- [ ] Images have subtle outlines
- [ ] Buttons use scale on press where appropriate
- [ ] AnimatePresence uses `initial={false}` for default-state elements
- [ ] No `transition: all` — only specific properties
- [ ] `will-change` only on transform/opacity/filter, never `all`
- [ ] Interactive elements have at least 40×40px hit area
- [ ] No animations on keyboard-shortcut actions or 100+/day interactions
- [ ] No `ease-in` on UI transitions; custom cubic-beziers used for `ease-out`/`ease-in-out`
- [ ] UI animation durations stay under 300ms (modals/drawers up to 500ms)
- [ ] No element animates in from `scale(0)` — start from `scale(0.9–0.95)`
- [ ] Popovers/dropdowns use trigger-relative `transform-origin` (modals stay centered)
- [ ] Exit timing is shorter than enter timing
- [ ] `prefers-reduced-motion` is honored (transforms removed, opacity kept)
- [ ] Hover transforms gated by `@media (hover: hover) and (pointer: fine)`
- [ ] Framer Motion uses `transform: "translateX()"` strings under load — not `x`/`y` props
- [ ] No CSS-variable-on-parent driving child animations (mutate `transform` directly)
- [ ] Colors use only `gray`, `red`, `green`, `amber` (project rule)
- [ ] No `bg-white` — use `bg-gray-0` (project rule)
- [ ] Headings, titles, and labels use Title Case (project rule)

## Reference Files

- [typography.md](typography.md) — Text wrapping, font smoothing, tabular numbers
- [surfaces.md](surfaces.md) — Border radius, optical alignment, shadows, image outlines, hit areas
- [animations.md](animations.md) — Decision framework, easing/duration tables, interruptible transitions, enter/exit, icon animations, springs, `@starting-style`, blur masking, `prefers-reduced-motion`
- [performance.md](performance.md) — Transition specificity, `will-change`, GPU compositing, Framer Motion gotchas, CSS-variable inheritance, WAAPI
- [gestures.md](gestures.md) — Drag interactions, momentum dismissal, boundary damping, pointer capture, multi-touch protection
