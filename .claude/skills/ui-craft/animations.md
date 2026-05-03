# Animations

Interruptible animations, enter/exit transitions, and contextual icon animations.

## Interruptible Animations

Users change intent mid-interaction. If animations aren't interruptible, the interface feels broken.

### CSS Transitions vs. Keyframes

| | CSS Transitions | CSS Keyframe Animations |
| --- | --- | --- |
| **Behavior** | Interpolate toward latest state | Run on a fixed timeline |
| **Interruptible** | Yes — retargets mid-animation | No — restarts from beginning |
| **Use for** | Interactive state changes (hover, toggle, open/close) | Staged sequences that run once (enter animations, loading) |
| **Duration** | Adapts to remaining distance | Fixed regardless of state |

```css
/* Good — interruptible transition for a toggle */
.drawer {
  transform: translateX(-100%);
  transition: transform 200ms ease-out;
}
.drawer.open {
  transform: translateX(0);
}

/* Clicking again mid-animation smoothly reverses — no jank */
```

```css
/* Bad — keyframe animation for interactive element */
.drawer.open {
  animation: slideIn 200ms ease-out forwards;
}

/* Closing mid-animation snaps or restarts — feels broken */
```

**Rule:** Always prefer CSS transitions for interactive elements. Reserve keyframes for one-shot sequences.

## Enter Animations: Split and Stagger

Don't animate a single large container. Break content into semantic chunks and animate each individually.

### Step by Step

1. **Split** into logical groups (title, description, buttons)
2. **Stagger** with ~100ms delay between groups
3. **For titles**, consider splitting into individual words with ~80ms stagger
4. **Combine** `opacity`, `blur`, and `translateY` for the enter effect

### Code Example

```tsx
// Motion (Framer Motion) — staggered enter
function PageHeader() {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={{
        visible: { transition: { staggerChildren: 0.1 } },
      }}
    >
      <motion.h1
        variants={{
          hidden: { opacity: 0, y: 12, filter: "blur(4px)" },
          visible: { opacity: 1, y: 0, filter: "blur(0px)" },
        }}
      >
        Welcome
      </motion.h1>

      <motion.p
        variants={{
          hidden: { opacity: 0, y: 12, filter: "blur(4px)" },
          visible: { opacity: 1, y: 0, filter: "blur(0px)" },
        }}
      >
        A description of the page.
      </motion.p>

      <motion.div
        variants={{
          hidden: { opacity: 0, y: 12, filter: "blur(4px)" },
          visible: { opacity: 1, y: 0, filter: "blur(0px)" },
        }}
      >
        <Button>Get started</Button>
      </motion.div>
    </motion.div>
  );
}
```

### CSS-Only Stagger

```css
.stagger-item {
  opacity: 0;
  transform: translateY(12px);
  filter: blur(4px);
  animation: fadeInUp 400ms ease-out forwards;
}

.stagger-item:nth-child(1) { animation-delay: 0ms; }
.stagger-item:nth-child(2) { animation-delay: 100ms; }
.stagger-item:nth-child(3) { animation-delay: 200ms; }

@keyframes fadeInUp {
  to {
    opacity: 1;
    transform: translateY(0);
    filter: blur(0);
  }
}
```

## Exit Animations

Exit animations should be softer and less attention-grabbing than enter animations. The user's focus is moving to the next thing — don't fight for attention.

### Subtle Exit (Recommended)

```tsx
// Small fixed translateY — indicates direction without drama
<motion.div
  exit={{
    opacity: 0,
    y: -12,
    filter: "blur(4px)",
    transition: { duration: 0.15, ease: "easeIn" },
  }}
>
  {content}
</motion.div>
```

### Full Exit (When Context Matters)

```tsx
// Slide fully out — use when spatial context is important
// (e.g., a card returning to a list, a drawer closing)
<motion.div
  exit={{
    opacity: 0,
    x: "-100%",
    transition: { duration: 0.2, ease: "easeIn" },
  }}
>
  {content}
</motion.div>
```

### Good vs. Bad

```css
/* Good — subtle exit */
.item-exit {
  opacity: 0;
  transform: translateY(-12px);
  transition: opacity 150ms ease-in, transform 150ms ease-in;
}

/* Bad — dramatic exit that steals focus */
.item-exit {
  opacity: 0;
  transform: translateY(-100%) scale(0.5);
  transition: all 400ms ease-in;
}

/* Bad — no exit animation at all (element just vanishes) */
.item-exit {
  display: none;
}
```

**Key points:**
- Use a small fixed `translateY` (e.g., `-12px`) instead of the full container height
- Keep some directional movement to indicate where the element went
- Exit duration should be shorter than enter duration (150ms vs 300ms)
- Don't remove exit animations entirely — subtle motion preserves context

## Contextual Icon Animations

When icons appear or disappear contextually (on hover, on state change), animate them with `opacity`, `scale`, and `blur` rather than just toggling visibility.

### Motion Example

```tsx
import { AnimatePresence, motion } from "motion/react";

function IconButton({ isActive, icon: Icon }) {
  return (
    <button>
      <AnimatePresence mode="popLayout">
        <motion.span
          key={isActive ? "active" : "inactive"}
          initial={{ opacity: 0, scale: 0.25, filter: "blur(4px)" }}
          animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
          exit={{ opacity: 0, scale: 0.25, filter: "blur(4px)" }}
          transition={{ type: "spring", duration: 0.3, bounce: 0 }}
        >
          <Icon />
        </motion.span>
      </AnimatePresence>
    </button>
  );
}
```

### CSS Transition Approach (No Motion)

If the project doesn't use Motion (Framer Motion), keep both icons in the DOM and cross-fade them with CSS transitions. Because neither icon unmounts, both enter and exit animate smoothly.

The trick: one icon is absolutely positioned on top of the other. Toggling state cross-fades them — the entering icon scales up from `0.25` while the exiting icon scales down to `0.25`, both with opacity and blur.

```tsx
function IconButton({ isActive, ActiveIcon, InactiveIcon }) {
  return (
    <button>
      <div className="relative">
        <div
          className={cn(
            "absolute inset-0 flex items-center justify-center",
            "transition-[opacity,filter,scale] duration-300",
            "cubic-bezier(0.2, 0, 0, 1)",
            isActive
              ? "scale-100 opacity-100 blur-0"
              : "scale-[0.25] opacity-0 blur-[4px]"
          )}
        >
          <ActiveIcon />
        </div>
        <div
          className={cn(
            "transition-[opacity,filter,scale] duration-300",
            "cubic-bezier(0.2, 0, 0, 1)",
            isActive
              ? "scale-[0.25] opacity-0 blur-[4px]"
              : "scale-100 opacity-100 blur-0"
          )}
        >
          <InactiveIcon />
        </div>
      </div>
    </button>
  );
}
```

The non-absolute icon (InactiveIcon) defines the layout size. The absolute icon (ActiveIcon) overlays it without affecting flow.

### Choosing Between Motion and CSS

| | Motion (Framer Motion) | CSS transitions (both icons in DOM) |
| --- | --- | --- |
| **Enter animation** | Yes | Yes |
| **Exit animation** | Yes (via `AnimatePresence`) | Yes (cross-fade — icon never unmounts) |
| **Spring physics** | Yes | No — use `cubic-bezier(0.2, 0, 0, 1)` as approximation |
| **When to use** | Project already uses `motion/react` | No motion dependency, or keeping bundle small |

**Rule:** Check the project's `package.json` for `motion` or `framer-motion`. If present, use the Motion approach. If not, use the CSS cross-fade pattern — don't add a dependency just for icon transitions.

### When to Animate Icons

| Animate | Don't animate |
| --- | --- |
| Icons that appear on hover (action buttons) | Static navigation icons |
| State change icons (play → pause, like → liked) | Decorative icons |
| Icons in contextual toolbars | Icons that are always visible |
| Loading/success state indicators | Icon labels (text next to icon) |

**Important:** Always use exactly these values for contextual icon animations — do not deviate:
- `scale`: `0.25` → `1` (never use `0.5` or `0.6`)
- `opacity`: `0` → `1`
- `filter`: `"blur(4px)"` → `"blur(0px)"`
- `transition`: `{ type: "spring", duration: 0.3, bounce: 0 }` — **bounce must always be `0`**, never `0.1` or any other value

## Scale on Press

A subtle scale-down on click gives buttons tactile feedback. Always use `scale(0.96)`. Never use a value smaller than `0.95` — anything below feels exaggerated. Use CSS transitions for interruptibility — if the user releases mid-press, it should smoothly return.

Not every button needs this. Add a `static` prop to your button component that disables the scale effect when the motion would be distracting.

### CSS Example

```css
.button {
  transition-property: scale;
  transition-duration: 150ms;
  transition-timing-function: ease-out;
}

.button:active {
  scale: 0.96;
}
```

### Tailwind Example

```tsx
<button className="transition-transform duration-150 ease-out active:scale-[0.96]">
  Click me
</button>
```

### Motion Example

```tsx
<motion.button whileTap={{ scale: 0.96 }}>
  Click me
</motion.button>
```

### Static Prop Pattern

Extract the scale class into a variable and conditionally apply it based on a `static` prop:

```tsx
const tapScale = "active:not-disabled:scale-[0.96]";

function Button({ static: isStatic, className, children, ...props }) {
  return (
    <button
      className={cn(
        "transition-transform duration-150 ease-out",
        !isStatic && tapScale,
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}

// Usage
<Button>Click me</Button>           {/* scales on press */}
<Button static>Submit</Button>       {/* no scale */}
```

## Skip Animation on Page Load

Use `initial={false}` on `AnimatePresence` to prevent enter animations from firing on first render. Elements that are already in their default state shouldn't animate in on page load — only on subsequent state changes.

### When It Works

```tsx
// Good — icon doesn't animate in on mount, only on state change
<AnimatePresence initial={false} mode="popLayout">
  <motion.span
    key={isActive ? "active" : "inactive"}
    initial={{ opacity: 0, scale: 0.25, filter: "blur(4px)" }}
    animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
    exit={{ opacity: 0, scale: 0.25, filter: "blur(4px)" }}
  >
    <Icon />
  </motion.span>
</AnimatePresence>
```

Works well for: icon swaps, toggles, tabs, segmented controls — anything that has a default state on page load.

### When It Breaks

Don't use `initial={false}` when the component relies on its `initial` prop to set up a first-time enter animation, like a staggered page hero or a loading state. In those cases, removing the initial animation skips the entire entrance.

```tsx
// Bad — initial={false} would skip the staggered page enter entirely
<AnimatePresence initial={false}>
  <motion.div initial="hidden" animate="visible" variants={...}>
    ...
  </motion.div>
</AnimatePresence>
```

Verify the component still looks right on a full page refresh before applying this.

## Animation Decision Framework

Before writing any animation code, walk through these in order. The framework comes from Emil Kowalski's design-engineering skill.

### 1. Should this animate at all?

How often will the user see this animation?

| Frequency | Decision |
| --- | --- |
| 100+ times/day (keyboard shortcut, command-palette toggle) | **No animation. Ever.** Raycast has no open/close animation for this exact reason. |
| Tens of times/day (hover effects, list nav) | Remove or drastically reduce |
| Occasional (modals, drawers, toasts) | Standard animation |
| Rare / first-time (onboarding, celebrations) | Can add delight |

**Never animate keyboard-initiated actions.** Animation makes them feel slow, delayed, and disconnected from the keypress.

### 2. What is the purpose?

Every animation must answer "why does this animate?" Valid purposes:

- **Spatial consistency** — toast enters and exits from the same edge so swipe-to-dismiss feels intuitive
- **State indication** — a morphing icon shows that state has changed
- **Feedback** — a button scales down on press to confirm input
- **Preventing jarring change** — fading a popover prevents a hard pop
- **Explanation** — marketing animation that demonstrates how a feature works

If the answer is "looks cool" *and* the user sees it often, don't animate.

### 3. Which easing?

```
Is the element entering or exiting?
  Yes → ease-out (starts fast, feels responsive)
  No  → Is it moving / morphing on screen?
          Yes → ease-in-out (natural accel/decel)
        Is it a hover / color change?
          Yes → ease
        Is it constant motion (marquee, progress bar)?
          Yes → linear
        Default → ease-out
```

**Critical: use custom cubic-bezier curves — built-in CSS easings are too weak.**

```css
:root {
  --ease-out:    cubic-bezier(0.23, 1, 0.32, 1);    /* enter/exit */
  --ease-in-out: cubic-bezier(0.77, 0, 0.175, 1);   /* on-screen movement */
  --ease-drawer: cubic-bezier(0.32, 0.72, 0, 1);    /* iOS-style drawers */
}
```

**Never use `ease-in` for UI animations.** It starts slow, which makes the interface feel sluggish — a 300ms `ease-in` dropdown *feels* slower than a 300ms `ease-out` one because ease-in delays movement at the exact moment the user is watching most closely.

Find stronger custom curves at [easing.dev](https://easing.dev/) or [easings.co](https://easings.co/).

### 4. How fast?

| Element | Duration |
| --- | --- |
| Button press feedback | 100–160ms |
| Tooltips, small popovers | 125–200ms |
| Dropdowns, selects | 150–250ms |
| Modals, drawers | 200–500ms |
| Marketing / explanatory | Can be longer |

**Rule:** UI animations stay under 300ms. A 180ms dropdown feels more responsive than a 400ms one.

### 5. Perceived performance

Speed in animation directly affects how users perceive app performance, independent of actual load time.

- A faster-spinning spinner makes loading feel faster (same load time).
- An instant tooltip after the first one is open (skip delay + skip animation) makes the whole toolbar feel faster.
- `ease-out` at 200ms feels faster than `ease-in` at 200ms because the user sees immediate movement.

## Never Animate from `scale(0)`

Nothing in the real world appears from nothing. Elements animating from `scale(0)` look like they pop out of the void.

```css
/* Bad */
.entering { transform: scale(0); opacity: 0; }

/* Good */
.entering { transform: scale(0.95); opacity: 0; }
```

Even a barely-visible initial scale (0.9–0.95) makes the entrance feel natural — like a balloon that has visible shape even when deflated. The single exception is the contextual icon-animation pattern in this file, which uses `scale(0.25)` paired with `blur(4px)` to bridge the visual gap.

## Origin-Aware Popovers

Popovers, dropdowns, and tooltips should scale in *from their trigger*, not from center. The browser default `transform-origin: center` is wrong for almost every popover.

```css
/* Radix UI */
.popover-content { transform-origin: var(--radix-popover-content-transform-origin); }

/* Base UI */
.popover-content { transform-origin: var(--transform-origin); }

/* Manual: anchor the popover at its trigger edge */
.popover-content[data-side="bottom"] { transform-origin: top; }
.popover-content[data-side="top"]    { transform-origin: bottom; }
```

**Modals are the exception.** They aren't anchored to a trigger — they appear centered in the viewport — so keep `transform-origin: center` on modals.

## Tooltips: Skip Delay on Subsequent Hovers

Tooltips should delay before the *first* one appears (to prevent accidental activation), but once one tooltip is open, hovering an adjacent tooltip should open it instantly with no animation. This makes a toolbar feel dramatically faster without weakening the initial guard.

```css
.tooltip {
  transition: transform 125ms var(--ease-out), opacity 125ms var(--ease-out);
  transform-origin: var(--transform-origin);
}

.tooltip[data-starting-style],
.tooltip[data-ending-style] {
  opacity: 0;
  transform: scale(0.97);
}

/* Subsequent tooltips while another is open: instant */
.tooltip[data-instant] { transition-duration: 0ms; }
```

## Blur to Mask Imperfect Crossfades

When a crossfade between two states feels off — you can see two distinct objects overlapping during the transition — add a brief `filter: blur(2px)` to the transitioning content. Blur bridges the visual gap so the eye perceives a single morph instead of two ghosts.

```css
.button-content { transition: filter 200ms ease, opacity 200ms ease; }
.button-content.transitioning {
  filter: blur(2px);
  opacity: 0.7;
}
```

Keep blur under 20px — heavy blur is expensive, especially in Safari.

## `@starting-style` for Modern Enter Animations

The modern CSS way to animate element entry without JavaScript or `useEffect(setMounted)` patterns:

```css
.toast {
  opacity: 1;
  transform: translateY(0);
  transition: opacity 400ms var(--ease-out), transform 400ms var(--ease-out);

  @starting-style {
    opacity: 0;
    transform: translateY(100%);
  }
}
```

Browser support is recent (Chromium 117+, Safari 17.5+, Firefox 129+). Fall back to the `data-mounted` attribute pattern when you need older browser support:

```jsx
useEffect(() => { setMounted(true); }, []);
// <div data-mounted={mounted}>
```

## Spring Animations

Springs feel more natural than duration-based animations because they simulate physics — they don't have a fixed duration; they settle based on stiffness and damping.

### When to use springs

- Drag interactions with momentum
- Elements that should feel "alive" (Apple's Dynamic Island)
- Gestures the user can interrupt mid-motion
- Decorative mouse-tracking interactions

### Spring config

**Apple-style (recommended — easier to reason about):**

```js
{ type: "spring", duration: 0.5, bounce: 0.2 }
```

**Traditional physics (more control):**

```js
{ type: "spring", mass: 1, stiffness: 100, damping: 10 }
```

Keep `bounce` subtle (`0.1–0.3`) when used at all. Avoid bounce in most UI contexts — reserve it for drag-to-dismiss and playful interactions. (The contextual icon-animation pattern in this file enforces `bounce: 0` specifically.)

### Spring-based mouse tracking

Tying visual changes directly to mouse position feels artificial because there's no inertia. `useSpring` interpolates smoothly:

```jsx
import { useSpring } from "framer-motion";

// Without: instant, feels artificial
const rotation = mouseX * 0.1;

// With: feels natural, has momentum
const springRotation = useSpring(mouseX * 0.1, { stiffness: 100, damping: 10 });
```

This is decorative — fine here. Don't add spring physics to a banking app's value graph; no animation is better than artificial motion for functional data.

### Interruptibility advantage

Springs maintain velocity when interrupted; CSS keyframes restart from zero. When the user clicks an expanded item then quickly hits Escape, a spring smoothly reverses from current position. This is the single biggest reason to use springs over keyframes for gesture-driven UI.

## Asymmetric Enter / Exit Timing

Exit animations should be **shorter and softer** than enters — the user's attention is moving on, don't fight for it. The same idea applies to deliberate-vs-responsive interactions:

```css
/* Press: deliberate, slow */
.button:active .overlay {
  transition: clip-path 2s linear;
}

/* Release: snappy */
.overlay {
  transition: clip-path 200ms var(--ease-out);
}
```

Slow where the user is *deciding*; fast where the system is *responding*.

## Accessibility

### `prefers-reduced-motion`

Reduced motion does not mean *no* motion. Animations can cause motion sickness, but opacity and color transitions usually aid comprehension and are safe to keep. **Remove transform-based motion; keep opacity/color fades.**

```css
.element {
  transition: transform 300ms var(--ease-out), opacity 300ms ease;
  transform: translateY(0);
}

@media (prefers-reduced-motion: reduce) {
  .element {
    transition: opacity 200ms ease;
    transform: none;
  }
}
```

```jsx
import { useReducedMotion } from "framer-motion";

const shouldReduceMotion = useReducedMotion();
const closedX = shouldReduceMotion ? 0 : "-100%";
```

### Touch device hover gating

Touch devices fire `:hover` on tap and leave the hover state stuck until another tap. Gate every hover-triggered animation behind a media query:

```css
@media (hover: hover) and (pointer: fine) {
  .button:hover { transform: scale(1.05); }
}
```

## Debugging Animations

- **Slow-motion testing.** Temporarily multiply duration by 3–5×, or use Chrome DevTools' Animations panel to slow playback. In slow motion, look for: ghost overlap during crossfades (need blur), wrong `transform-origin`, properties that aren't synced (e.g., `transform` finishing before `opacity`).
- **Frame-by-frame** in DevTools Animations panel — reveals timing mismatches between coordinated properties that are invisible at full speed.
- **Real devices for gestures.** USB-connect a phone, hit your dev server by IP, use Safari remote DevTools. Simulators are ok; physical hardware is better for swipe/drag.
- **Re-review the next day.** Fresh eyes catch imperfections you missed during development.
