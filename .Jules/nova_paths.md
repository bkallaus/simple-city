# Nova Architectural Paths: HUD Implementation (Forced Variance)

## Approach 1: State-Guarded Template Literal Injection (The Recommended Minimalist Path)
**Concept:** Use a single state tracker variable to hold the last rendered values (score, population, nextTier). Inside the `animate()` loop, check if the current game state differs from the cached state. If so, update the `innerHTML` of the `<div id="ui">` with a single template literal containing the complete markup for Score, Population, and Next Tier.
**Pros:**
- Extremely simple (single DOM query, ~15 lines of code).
- State-guarded optimization prevents redundant DOM repaints every frame (60fps).
- Easily supports accessibility attributes (e.g., `aria-live`).
**Cons:** Re-renders the entire `#ui` block rather than targeting individual text nodes.

## Approach 2: Targeted DOM Node Initialization & Updates (Standard Path)
**Concept:** During game initialization, fetch `<div id="ui">` and programmatically create and append individual HTML elements for Score (`<span id="score">`), Population (`<span id="population">`), and Next Tier (`<span id="next-tier">`). Inside the `animate()` loop, directly update their `innerText` or `textContent` properties.
**Pros:** Highly targeted updates; doesn't wipe sibling DOM elements.
**Cons:** Requires slightly more boilerplate code (storing element references globally or in a scoped object) and takes up more lines of code.

## Approach 3: Lateral Canvas Overlay (Lateral/Creative Path)
**Concept:** Abandon the `<div id="ui">` DOM element entirely. Instead, create a transparent 2D Canvas positioned absolutely over the Three.js WebGL rendering context. Use the Canvas API (`ctx.fillText`, `ctx.fillStyle`) to render the text frame-by-frame inside the `animate()` loop.
**Pros:** Absolute alignment with the game's internal 60FPS tick, bypasses DOM rendering entirely.
**Cons:** Overkill for simple text. Breaks out-of-the-box accessibility (screen readers can't read canvas pixels) and contradicts the existing CSS setup in `index.html`.

**Decision:** I will proceed with **Approach 1** because it aligns with Pop City's constraints of absolute simplicity, avoids unnecessary abstractions, and implements the required optimization via a state-guard mechanism to prevent DOM thrashing inside the animation loop.
