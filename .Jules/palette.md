
## 2024-05-15 - [Dynamic Canvas HUD Accessibility]
**Learning:** Pure Canvas/WebGL games are opaque to screen readers. We discovered that important game states (like upcoming structures or building tiers) should be synced to overlay DOM elements using `aria-live="polite"` and `aria-atomic="true"`. This guarantees that screen reader users are actively notified of critical state changes without interrupting their general flow.
**Action:** When working on Canvas/WebGL projects, always extract critical "HUD" state out of the canvas and synchronize it into visually-hidden or stylized DOM overlays with `aria-live` attributes.
