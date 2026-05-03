# Gestures

Drag, swipe, and pointer interactions that feel right. Distilled from building Sonner and Vaul (Emil Kowalski).

## Momentum-Based Dismissal

Don't require dragging past a fixed threshold to dismiss. Calculate **velocity** — a quick flick should be enough even if the swipe distance is small. Real-world gestures have momentum, and copying that intuition is what makes drag-to-dismiss feel "right."

```js
const elapsed = Date.now() - dragStartTime.current;
const velocity = Math.abs(swipeAmount) / elapsed;

if (Math.abs(swipeAmount) >= SWIPE_THRESHOLD || velocity > 0.11) {
  dismiss();
}
```

The `0.11` constant is empirically tuned (Sonner uses it). Tweak per component, but always use a velocity-OR-distance check, not distance alone.

## Damping at Boundaries

When the user drags past a natural boundary — pulling a drawer up when it's already at the top, or scrolling past the end of a list — apply increasing **damping** instead of stopping the motion. Real objects don't slam into invisible walls; they slow down first.

```js
// Drag distance beyond the boundary
const overshoot = Math.max(0, dragY - maxDragY);

// Apply rubber-band damping (matches iOS overscroll feel)
const dampedY = maxDragY + overshoot * 0.5;
```

The damping factor (`0.5` here) controls how stiff the rubber band feels. Lower = stiffer; higher = stretchier.

## Friction Instead of Hard Stops

Same idea as damping but for any one-direction constraint. Instead of `if (drag > 0) drag = 0;`, allow the drag with progressively less response:

```js
const friction = 0.4;
const constrainedY = drag > 0 ? drag * friction : drag;
```

Hard stops feel like the interface is fighting the user. Friction feels like the interface is *resisting* — much more natural.

## Pointer Capture for Drag

Once a drag starts, capture all pointer events on the element so the gesture continues even if the pointer leaves the element bounds. Without this, fast horizontal swipes that briefly move outside the element will cancel mid-gesture.

```jsx
function onPointerDown(e) {
  e.currentTarget.setPointerCapture(e.pointerId);
  // start drag…
}

function onPointerUp(e) {
  e.currentTarget.releasePointerCapture(e.pointerId);
  // end drag…
}
```

`setPointerCapture` works for mouse, touch, and pen — that's why it's preferred over the older mouse-only patterns.

## Multi-Touch Protection

Once a drag has started, ignore subsequent touch points. Without this, switching fingers mid-drag (lifting one finger and pressing with another) makes the element jump to the new finger's position.

```js
function onPointerDown(e) {
  if (isDragging) return;            // already dragging — ignore extra fingers
  isDragging = true;
  // start drag…
}
```

For touch-specific patterns, you can also gate on `e.pointerType === "touch"` and `e.isPrimary === true`.

## Skip Animation When Drag Returns Item Into Place

When a swipe doesn't cross the dismissal threshold and the element snaps back, animate the snap with `ease-out` and a short duration (~200ms). Don't animate the live drag — that lags behind the finger and feels broken. Live drag = direct `transform` set; release = transition kicks in.

```js
// During drag — no transition, instant follow
el.style.transition = 'none';
el.style.transform = `translateY(${dragDistance}px)`;

// On release — re-enable transition for the snap
el.style.transition = 'transform 200ms cubic-bezier(0.23, 1, 0.32, 1)';
el.style.transform = '';   // snap back
```

## Performance Notes for Drag

Drag is a per-frame `transform` update, often 60–120 times per second. Two perf rules from [performance.md](performance.md) matter doubly here:

- **Don't drive drag through a parent CSS variable.** Setting `--swipe-amount` on a container with many children re-cascades every frame. Update `transform` directly on the moving element.
- **Use the full `transform` string** in Framer Motion (`transform: "translateY(Xpx)"`), not the `y` shorthand — the shorthand is main-thread-only and stutters when other JS is running.

## Accessibility

Drag-to-dismiss should always have a non-drag fallback (close button, swipe alternative via keyboard, escape key). Touch-first patterns must still work for keyboard and screen-reader users.

For users with `prefers-reduced-motion`, skip the rubber-band overshoot and snap-back animations — set positions directly:

```js
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
el.style.transition = reduceMotion ? 'none' : 'transform 200ms ease-out';
```
