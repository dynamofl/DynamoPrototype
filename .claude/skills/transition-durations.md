# Transition Duration Variables

All animations and transitions must use these standardized duration variables. Never use hardcoded duration values.

## CSS Variables (defined in `src/index.css` `:root`)

| Variable | Value | Use Case |
|---|---|---|
| `--speed-highlightFadeIn` | `0s` | Instant highlight appearance |
| `--speed-highlightFadeOut` | `.15s` | Highlight fade out, step transitions |
| `--speed-quickTransition` | `.1s` | Micro-interactions (hover, focus) |
| `--speed-regularTransition` | `.25s` | Standard transitions (color, border, background) |
| `--speed-slowTransition` | `.35s` | Larger transitions (layout shifts, overlays) |

## Tailwind Utility Classes

Configured in `tailwind.config.js` under `transitionDuration`:

| Class | Maps To |
|---|---|
| `duration-highlight-in` | `var(--speed-highlightFadeIn)` |
| `duration-highlight-out` | `var(--speed-highlightFadeOut)` |
| `duration-quick` | `var(--speed-quickTransition)` |
| `duration-regular` | `var(--speed-regularTransition)` |
| `duration-slow` | `var(--speed-slowTransition)` |

## Usage Examples

```tsx
// Step/page transitions (fade + scale)
className="duration-highlight-out transition-[opacity,transform]"

// Standard hover/color transitions
className="duration-regular transition-colors"

// Quick micro-interactions
className="duration-quick transition-opacity"

// Overlay/modal entrance
className="duration-slow transition-all"
```

## Rules

- **Never** use hardcoded durations like `duration-150`, `duration-200`, `duration-300`
- **Always** use the Tailwind utility classes: `duration-highlight-in`, `duration-highlight-out`, `duration-quick`, `duration-regular`, `duration-slow`
- In JavaScript `setTimeout` for transitions, use the ms equivalent: `0`, `150`, `100`, `250`, `350`
