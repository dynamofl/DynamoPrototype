# Performance

Transition specificity and GPU compositing hints.

## Transition Only What Changes

Never use `transition: all` or Tailwind's `transition` shorthand (which maps to `transition-property: all`). Always specify the exact properties that change.

### Why

- `transition: all` forces the browser to watch every property for changes
- Causes unexpected transitions on properties you didn't intend to animate (colors, padding, shadows)
- Prevents browser optimizations

### CSS Example

```css
/* Good — only transition what changes */
.button {
  transition-property: scale, background-color;
  transition-duration: 150ms;
  transition-timing-function: ease-out;
}

/* Bad — transition everything */
.button {
  transition: all 150ms ease-out;
}
```

### Tailwind

```tsx
// Good — explicit properties
<button className="transition-[scale,background-color] duration-150 ease-out">

// Bad — transition all
<button className="transition duration-150 ease-out">
```

### Tailwind `transition-transform` Note

`transition-transform` in Tailwind maps to `transition-property: transform, translate, scale, rotate` — it covers all transform-related properties, not just `transform`. Use this when you're only animating transforms. For multiple non-transform properties, use the bracket syntax: `transition-[scale,opacity,filter]`.

## Use `will-change` Sparingly

`will-change` hints the browser to pre-promote an element to its own GPU compositing layer. Without it, the browser promotes the element only when the animation starts — that one-time layer promotion can cause a micro-stutter on the first frame.

This particularly helps when an element is changing `scale`, `rotation`, or moving around with `transform`. For other properties, it doesn't help much — the browser can't composite them on the GPU anyway.

### Rules

```css
/* Good — specific property that benefits from GPU compositing */
.animated-card {
  will-change: transform;
}

/* Good — multiple compositor-friendly properties */
.animated-card {
  will-change: transform, opacity;
}

/* Bad — never use will-change: all */
.animated-card {
  will-change: all;
}

/* Bad — properties that can't be GPU-composited anyway */
.animated-card {
  will-change: background-color, padding;
}
```

### Useful Properties

| Property | GPU-compositable | Worth using `will-change` |
| --- | --- | --- |
| `transform` | Yes | Yes |
| `opacity` | Yes | Yes |
| `filter` (blur, brightness) | Yes | Yes |
| `clip-path` | Yes | Yes |
| `top`, `left`, `width`, `height` | No | No |
| `background`, `border`, `color` | No | No |

### When to Skip

Modern browsers are already good at optimizing on their own. Only add `will-change` when you notice first-frame stutter — Safari in particular benefits from it. Don't add it preemptively to every animated element; each extra compositing layer costs memory.

## Only Animate `transform` and `opacity` (and Friends)

These properties skip layout *and* paint — they run on the GPU compositor. Animating `padding`, `margin`, `width`, `height`, `top`, `left`, `background-color`, etc. triggers all three rendering steps (layout → paint → composite) every frame and will jank under load.

| Property | Skips layout? | Skips paint? | OK to animate? |
| --- | --- | --- | --- |
| `transform`, `translate`, `scale`, `rotate` | Yes | Yes | Yes |
| `opacity` | Yes | Yes | Yes |
| `filter` (blur, brightness, …) | Yes | Yes | Yes |
| `clip-path` | Yes | Yes | Yes |
| `width`, `height`, `top`, `left`, `padding`, `margin` | No | No | Avoid |
| `background-color`, `color`, `border-color` | Yes | No | OK for hover (small repaint) |

If you need a size animation, prefer `transform: scale()` over `width`/`height`. If you need a position animation, prefer `transform: translate()` over `top`/`left`.

## CSS-Variable Inheritance Gotcha

Changing a CSS custom property on a parent recalculates styles for **every descendant** that reads (or could read) that variable. In a drawer with many items, updating `--swipe-amount` on the container during a drag triggers expensive style-recalc on every child every frame. The transform itself is GPU-cheap; the inherited cascade is what kills you.

```js
// Bad — triggers style recalc for every descendant
container.style.setProperty('--swipe-amount', `${distance}px`);

// Good — only the target element is affected
target.style.transform = `translateY(${distance}px)`;
```

Rule: for high-frequency updates (drag, scroll, mouse-track), set `transform` directly on the moving element rather than driving it through a parent CSS variable.

## Framer Motion: `x`/`y`/`scale` Are *Not* Hardware-Accelerated

Framer Motion's shorthand props (`x`, `y`, `scale`, `rotate`) update via `requestAnimationFrame` on the main thread — convenient but they drop frames when the main thread is busy (page load, large React render, expensive script). For hardware acceleration, animate the full `transform` string instead:

```jsx
// NOT hardware accelerated — drops frames under load
<motion.div animate={{ x: 100 }} />

// Hardware accelerated — stays smooth even when main thread is busy
<motion.div animate={{ transform: "translateX(100px)" }} />
```

This is exactly the regression Vercel hit on their dashboard tab animation: the Shared Layout Animation dropped frames during page loads. Switching to CSS animations (which run off the main thread) fixed it.

## CSS Animations Beat JS Under Load

CSS animations and transitions run on the compositor thread. Framer Motion / GSAP / `requestAnimationFrame` loops run on the main thread. When the main thread is doing other work — loading a new route, parsing a large JSON, hydrating React — CSS keeps animating smoothly while JS-driven animations stutter.

**Rule of thumb:** use CSS for predetermined animations (open/close, hover, enter); use JS only when you need dynamic interruptible motion (drag, gesture, programmatic chaining).

## WAAPI for Programmatic Control with CSS Performance

The Web Animations API gives JS-level control with compositor-thread performance. No library required, hardware-accelerated, and interruptible:

```js
element.animate(
  [
    { clipPath: 'inset(0 100% 0 0)' },
    { clipPath: 'inset(0 0 0 0)' },
  ],
  { duration: 1000, fill: 'forwards', easing: 'cubic-bezier(0.77, 0, 0.175, 1)' }
);
```

Useful when you need to start an animation from JavaScript (e.g., on click, on intersection-observer fire) but want CSS-grade performance and no Framer/GSAP dependency.
