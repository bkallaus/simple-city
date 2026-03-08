## 2024-05-15 - [Dynamic WebGL UI Accessibility]
**Learning:** Critical game state updates displayed in DOM overlays (like the upcoming building tier matching the placement cursor) within a Canvas/WebGL game should use `aria-live="polite"` and `aria-atomic="true"` to ensure screen readers announce changes dynamically without interrupting the user's flow.
**Action:** When synchronizing 3D cursor states to DOM elements, always wrap the changing text in an ARIA live region to keep assistive technologies informed of visually-conveyed game mechanics.
