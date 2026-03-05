## 2024-03-05 - Initialized
**Learning:** Started tracking UX/a11y insights.
**Action:** Keep adding critical learnings.
## 2024-03-05 - WebGL Accessible HUD Syncing
**Learning:** Pure WebGL UI elements (like a colored placement cursor) are inaccessible to screen readers. Relying solely on them hurts a11y.
**Action:** Always pair WebGL visual cues with DOM overlays (e.g., `#next-tier` span). Use `aria-live="polite"` and `aria-atomic="true"` on these overlays so screen readers announce critical game state changes (like upcoming building tiers) synchronously. Keep visual styles (colors) synchronized between the DOM overlay and WebGL elements for cohesive UX.
