# ElevenLabs "Ask" Panel — Slide-In Transition: Implementation Guide
> **Reference UI:** ElevenLabs `/app/speech-to-text` — the circular "Ask" button in the
> top-right header triggers a chat panel that slides in from the right while the main
> content area compresses horizontally.
---
## Overview
The animation is a **coordinated shared-layout transition** driven by
[Framer Motion](https://www.framer.com/motion/). When the Ask panel opens, two things
happen simultaneously:
1. A new chat panel **slides in from the right** (mount animation)
2. The main content area **compresses horizontally** to make room
On close, both reverse together. This coordination is the key challenge — it requires
Framer Motion's `LayoutGroup` + `layout` prop system, not plain CSS.
---
## Tech Stack Requirements
```bash
npm install framer-motion
# or
yarn add framer-motion
```
- **React** 16.8+  
- **Framer Motion** v6+ (v10+ recommended)  
- Works with Next.js, Vite, CRA, etc.
---
## Core Concepts Used
| Concept | Purpose |
|---|---|
| `<LayoutGroup>` | Groups elements so they coordinate layout animations together |
| `layout` prop | Tells Framer Motion to animate this element when its size/position changes |
| `<AnimatePresence>` | Manages mount/unmount lifecycle so exit animations play before DOM removal |
| `initial / animate / exit` | Keyframe states for the panel enter/exit animation |
| **FLIP technique** | Framer uses First-Last-Invert-Play internally to avoid CSS reflow |
---
## Implementation
### 1. Basic Structure
```tsx
import { motion, AnimatePresence, LayoutGroup } from "framer-motion";
import { useState } from "react";
export default function AppLayout() {
  const [isAskOpen, setIsAskOpen] = useState(false);
  return (
    <div style={{ display: "flex", height: "100vh", overflow: "hidden" }}>
      {/* Left Sidebar — static, does not animate */}
      <nav style={{ width: 220, flexShrink: 0 }}>
        {/* Navigation items */}
      </nav>
      {/* Right section: main content + ask panel side by side */}
      <LayoutGroup id="ask-panel-layout">
        <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
          {/* Main content — compresses when panel opens */}
          <motion.main
            layout
            style={{ flex: 1, overflowY: "auto" }}
            transition={layoutTransition}
          >
            {/* Your page content */}
            <h1>Speech to text</h1>
          </motion.main>
          {/* Ask panel — conditionally rendered */}
          <AnimatePresence>
            {isAskOpen && (
              <motion.aside
                key="ask-panel"
                layout
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: 360, opacity: 1 }}
                exit={{ width: 0, opacity: 0 }}
                transition={panelTransition}
                style={{
                  overflow: "hidden",
                  flexShrink: 0,
                  borderLeft: "1px solid #e5e7eb",
                }}
              >
                <AskPanel />
              </motion.aside>
            )}
          </AnimatePresence>
        </div>
      </LayoutGroup>
      {/* Ask trigger button */}
      <button
        onClick={() => setIsAskOpen((prev) => !prev)}
        aria-label="Ask"
      >
        Ask
      </button>
    </div>
  );
}
```
---
### 2. Transition Configurations
```ts
// For the main content area compressing/expanding (layout animation)
const layoutTransition = {
  type: "spring",
  stiffness: 280,
  damping: 28,
  // — OR use a tween for a more predictable, CSS-like feel:
  // type: "tween",
  // duration: 0.3,
  // ease: [0.4, 0, 0.2, 1],
};
// For the panel sliding in/out
const panelTransition = {
  type: "tween",
  duration: 0.3,
  ease: [0.4, 0, 0.2, 1], // Material Design "standard" easing
};
```
> **Tip:** Using `type: "spring"` on the layout animation gives a natural, slightly
> bouncy feel. Using `type: "tween"` gives a linear/predictable feel identical to CSS
> transitions.
---
### 3. The Ask Panel Component
```tsx
function AskPanel() {
  return (
    <div
      style={{
        width: 360,          // fixed — prevents content squishing during animation
        height: "100%",
        display: "flex",
        flexDirection: "column",
        padding: "24px 16px",
        backgroundColor: "#ffffff",
      }}
    >
      {/* Greeting at top */}
      <p style={{ fontSize: 16, fontWeight: 600 }}>
        Hi! How can I help you today?
      </p>
      <div style={{ flex: 1 }} />
      {/* Input pinned to bottom */}
      <input
        type="text"
        placeholder="Ask anything..."
        style={{
          padding: "10px 14px",
          borderRadius: 8,
          border: "1px solid #e5e7eb",
          fontSize: 14,
          outline: "none",
        }}
      />
    </div>
  );
}
```
---
### 4. The Ask Button (Top-Right)
ElevenLabs uses a circular light-blue button in the header:
```tsx
const askButtonStyle: React.CSSProperties = {
  width: 40,
  height: 40,
  borderRadius: "50%",
  backgroundColor: "#bfdbfe",   // Tailwind blue-200
  border: "none",
  cursor: "pointer",
  fontSize: 13,
  fontWeight: 600,
  color: "#1d4ed8",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  boxShadow: "0 1px 3px rgba(0,0,0,0.12)",
};
```
---
### 5. Full Self-Contained Working Example
```tsx
import { motion, AnimatePresence, LayoutGroup } from "framer-motion";
import { useState } from "react";
const PANEL_WIDTH = 360;
const panelTransition = {
  type: "tween" as const,
  duration: 0.3,
  ease: [0.4, 0, 0.2, 1],
};
const layoutTransition = {
  type: "spring" as const,
  stiffness: 280,
  damping: 28,
};
export default function ElevenLabsStyleLayout() {
  const [isAskOpen, setIsAskOpen] = useState(false);
  return (
    <div style={{ display: "flex", height: "100vh", fontFamily: "sans-serif" }}>
      {/* ── Left Sidebar ─────────────────────────────── */}
      <nav
        style={{
          width: 220,
          flexShrink: 0,
          background: "#f9fafb",
          borderRight: "1px solid #e5e7eb",
          padding: "16px 12px",
        }}
      >
        <strong style={{ fontSize: 13, color: "#6b7280" }}>Navigation</strong>
        {["Home", "Voices", "Studio", "Flows", "Files"].map((item) => (
          <div
            key={item}
            style={{
              padding: "8px 12px",
              borderRadius: 6,
              marginTop: 4,
              cursor: "pointer",
              fontSize: 14,
            }}
          >
            {item}
          </div>
        ))}
      </nav>
      {/* ── Content + Ask Panel ──────────────────────── */}
      <LayoutGroup id="ask-panel-layout">
        <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
          {/* Main content — shrinks when panel opens */}
          <motion.main
            layout
            transition={layoutTransition}
            style={{
              flex: 1,
              overflowY: "auto",
              padding: "32px 40px",
              background: "#ffffff",
            }}
          >
            {/* Header row */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 24,
              }}
            >
              <h1 style={{ fontSize: 22, fontWeight: 700, margin: 0 }}>
                Speech to text
              </h1>
              {/* Ask button */}
              <button
                onClick={() => setIsAskOpen((v) => !v)}
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: "50%",
                  background: isAskOpen ? "#93c5fd" : "#bfdbfe",
                  border: "none",
                  cursor: "pointer",
                  fontWeight: 700,
                  fontSize: 12,
                  color: "#1d4ed8",
                  transition: "background 0.2s",
                }}
              >
                Ask
              </button>
            </div>
            {/* Page body */}
            <p style={{ color: "#6b7280", marginBottom: 24 }}>
              Transcribe audio and video files with our industry-leading ASR model.
            </p>
            <div
              style={{
                background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                borderRadius: 12,
                padding: 20,
                color: "#fff",
                marginBottom: 24,
              }}
            >
              <strong>Try Scribe Realtime v2</strong>
              <p style={{ fontSize: 13, marginTop: 6, marginBottom: 0 }}>
                Experience lightning fast transcription with unmatched accuracy.
              </p>
            </div>
            <input
              placeholder="Search transcripts..."
              style={{
                width: "100%",
                padding: "10px 14px",
                border: "1px solid #e5e7eb",
                borderRadius: 8,
                fontSize: 14,
                boxSizing: "border-box",
              }}
            />
          </motion.main>
          {/* ── Ask Panel (slides in from right) ─────── */}
          <AnimatePresence>
            {isAskOpen && (
              <motion.aside
                key="ask-panel"
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: PANEL_WIDTH, opacity: 1 }}
                exit={{ width: 0, opacity: 0 }}
                transition={panelTransition}
                style={{
                  flexShrink: 0,
                  overflow: "hidden",
                  borderLeft: "1px solid #e5e7eb",
                  background: "#ffffff",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                {/* Inner wrapper: fixed width so content doesn't squish */}
                <div
                  style={{
                    width: PANEL_WIDTH,
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    padding: "24px 16px",
                  }}
                >
                  <p style={{ fontSize: 15, fontWeight: 600, margin: 0 }}>
                    Hi! How can I help you today?
                  </p>
                  <div style={{ flex: 1 }} />
                  <input
                    type="text"
                    placeholder="Ask anything..."
                    style={{
                      padding: "10px 14px",
                      borderRadius: 8,
                      border: "1px solid #e5e7eb",
                      fontSize: 14,
                      outline: "none",
                    }}
                  />
                </div>
              </motion.aside>
            )}
          </AnimatePresence>
        </div>
      </LayoutGroup>
    </div>
  );
}
```
---
## Animation Property Reference
| Property | Value | Notes |
|---|---|---|
| Panel enter duration | `300ms` | `transition.duration = 0.3` |
| Panel exit duration | `300ms` | Shorten to `0.2` for snappier feel |
| Panel width | `360px` | Adjust to taste (320–420px typical) |
| Easing (panel) | `cubic-bezier(0.4, 0, 0.2, 1)` | Material Design "standard" curve |
| Main layout transition | Spring: stiffness `280`, damping `28` | Slightly lags panel for natural feel |
| GPU acceleration | Automatic via Framer FLIP | No `width` CSS transition — uses `transform` |
| Layout reflow | None | FLIP avoids per-frame layout thrashing |
---
## How the FLIP Technique Works (Under the Hood)
Framer Motion avoids expensive CSS `width` transitions by using **FLIP**:
1. **First** — Snapshot element bounding box before state change
2. **Last** — Apply new state, snapshot bounding box again
3. **Invert** — Apply a `transform` to make the element *look* like its old size
4. **Play** — Animate `transform` from inverted → identity (`transform: none`)
The browser only animates `transform` (GPU composited layer) — zero layout
recalculation per frame.
---
## Variants Alternative (Cleaner Code)
```tsx
const panelVariants = {
  hidden: { width: 0, opacity: 0 },
  visible: { width: 360, opacity: 1 },
};
<AnimatePresence>
  {isAskOpen && (
    <motion.aside
      key="ask-panel"
      variants={panelVariants}
      initial="hidden"
      animate="visible"
      exit="hidden"
      transition={{ type: "tween", duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
      style={{ overflow: "hidden", flexShrink: 0 }}
    >
      <AskPanel />
    </motion.aside>
  )}
</AnimatePresence>
```
---
## Common Gotchas
1. **Don't put `overflow: hidden` on the `<LayoutGroup>` wrapper** — it clips the panel
   during its enter animation.
2. **The inner panel content needs a fixed width** — wrap content in a `div` with
   `width: 360px`. Without this, content squishes horizontally as the `aside` animates
   from `width: 0`.
3. **`layout` prop only works on `motion.*` components** — plain `<div>` elements ignore
   it.
4. **`AnimatePresence` must be a direct ancestor** of the conditionally rendered element.
   Don't put extra wrappers between them.
5. **Always add a `key` prop** to the child of `AnimatePresence` — required for lifecycle
   tracking.
6. **Tailwind users:** `flex-1` on the main content still works correctly. Framer
   overrides the *visual* position via `transform`, not the computed flex values.
---
## CSS-Only Alternative (No Framer Motion)
Simpler but causes layout reflow, which may produce jank on complex pages:
```css
.main-content {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  /* No transition needed — flex handles the resize automatically */
}
.ask-panel {
  width: 0;
  flex-shrink: 0;
  overflow: hidden;
  opacity: 0;
  transition:
    width 0.3s cubic-bezier(0.4, 0, 0.2, 1),
    opacity 0.3s ease;
}
.ask-panel.open {
  width: 360px;
  opacity: 1;
}
```
```tsx
// Toggle class instead of conditional render
<aside className={`ask-panel ${isOpen ? "open" : ""}`}>
  <div style={{ width: 360, padding: "24px 16px" }}>
    ...
  </div>
</aside>
```
> Use CSS-only for static sites or when Framer Motion's bundle size (~50 KB gzipped)
> is a concern. The Framer version is noticeably smoother on content-heavy pages.
---
*Analysis based on DOM inspection of `https://elevenlabs.io/app/speech-to-text`
on 2026-03-24.*