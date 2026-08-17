# Nova Architectural Paths

## Approach 1: Basic DOM Selection and Update inside animate()
- **Description:** Select the `#ui` div directly inside the `animate` loop and set its `innerHTML` with string interpolation for Score, Population, and Next Tier, including `aria-live` attributes.
- **Pros:** Simplest to implement, very few lines of code.
- **Cons:** Constantly re-evaluates the DOM and rewrites `innerHTML` every frame, which can be bad for performance.

## Approach 2: State-Guarded DOM Updates with InnerHTML (Chosen)
- **Description:** Maintain local variables tracking previous state (`lastScore`, `lastPop`, `lastTier`). Inside `animate()`, check if the current state differs from the last state. Only if it differs, update the `#ui` container's `innerHTML` directly.
- **Pros:** Performance optimized by avoiding redundant DOM writes. Keeps the update logic lightweight and localized. Accessible via ARIA tags. Minimalist and surgical code updates as required.
- **Cons:** Slightly more code than Approach 1 to track state.

## Approach 3: Dedicated UI Class / Framework
- **Description:** Implement a dedicated UI manager class that binds to state change events rather than checking inside the `animate()` loop.
- **Pros:** More scalable for complex UIs.
- **Cons:** Overkill for this simple task, violates the minimalist/surgical constraint of the Nova Agent.
