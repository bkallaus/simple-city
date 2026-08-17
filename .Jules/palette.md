# UX and Accessibility Learnings (Palette Persona)

## State-Guarded DOM Updates
To ensure performance is not degraded during the `requestAnimationFrame` loop, UI updates in `main.js` are state-guarded. By keeping track of `lastScore`, `lastPop`, and `lastTier`, we only manipulate the DOM using `innerHTML` when the game state has actively changed.

## Screen Reader Accessibility with ARIA
Game state displays (Score, Population, Next Tier) dynamically change. To make this accessible, we wrapped the injected HTML in a `div` containing `aria-live="polite"` and `aria-atomic="true"`.
- `aria-live="polite"` ensures that screen readers announce these changes dynamically without abruptly interrupting the user's current flow.
- `aria-atomic="true"` ensures the entire block of text is read together so context (e.g., Score alongside Next Tier) is preserved.

## Constraints Adhered To
1. The DOM logic was implemented strictly in vanilla JS without adding extra CSS classes or external framework overhead.
2. The logic remains under the 50 lines constraint required for minimalism.
