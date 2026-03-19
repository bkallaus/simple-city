## 2024-03-19 - Critical Game State Updates in DOM Overlays
**Learning:** When adding critical game state updates (like the upcoming building tier) to a DOM overlay over a Canvas/WebGL element, it is essential to use `aria-live="polite"` and `aria-atomic="true"` to ensure screen readers announce changes dynamically without interrupting the user's flow.
**Action:** Always include ARIA live regions for key dynamic data points in non-HTML games like Canvas/WebGL.
