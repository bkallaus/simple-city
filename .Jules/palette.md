## 2026-03-20 - [aria-live for WebGL State Announcements]
**Learning:** In Canvas/WebGL games, critical game state updates displayed in DOM overlays (like the upcoming building tier) should use `aria-live="polite"` and `aria-atomic="true"`. This ensures screen readers announce changes dynamically without interrupting the user's flow, as canvas contents are generally inaccessible.
**Action:** When working with dynamically updated UI text over canvas or WebGL interfaces, apply appropriate `aria-live` attributes to sync the interface state gracefully with screen readers.
