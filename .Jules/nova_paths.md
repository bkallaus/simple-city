- **Standard Approach:** React or similar framework for state management of UI.
- **Minimalist Approach (Chosen):** Vanilla JS injection directly into existing `#ui` div, using a simple state-tracking variable (`currentDisplayTier`) in `main.js` to avoid redundant DOM updates in the animation loop.
- **Lateral Approach:** Canvas-rendered text UI overlay in WebGL instead of DOM updates.

Chose the **Minimalist Approach** because Pop City has no build step and relies entirely on centralized vanilla JavaScript (`main.js`) and `index.html`. This avoids adding large external dependencies and aligns perfectly with the "Simplicity First" and "Surgical Changes" rules in NOVA_AGENT.md.

### PR Manifest
- PR Title: feat: Add Next Tier UI tracking
- The Problem Solved: The Next Tier UI indicator was missing from the screen despite being tracked in backend logic, making gameplay unpredictable. The Next Tier UI is now displayed in the top left, fulfilling the visual requirement of `GOAL.png`.
- Visuals: [Markdown links to screenshots would go here after frontend verification]
- Implementation Journey:
  - Added `<div id="next-tier" aria-live="polite" aria-atomic="true"></div>` to `#ui` in `index.html`.
  - Created `updateUX()` in `main.js` to update DOM conditionally based on `gameState.nextTier`.
  - Hooked `updateUX()` into the `animate()` loop.
- Tradeoffs & Assumptions: Assumed the text formatting string "Next Tier: X" shown in `GOAL.png` applies accurately, and chose a DOM approach instead of a Canvas WebGL approach for simplicity and screen-reader accessibility.
- Testing Instructions: Open `index.html` in a browser. Look for "Next Tier: 1" (or 2) in the top left. Clicking on valid grid tiles will advance the tier and the UI will immediately update.
- Action Item: `git checkout -b feature/next-tier-ui && git commit -m "feat: Add Next Tier UI tracking" && gh pr create --title "feat: Add Next Tier UI tracking" --body-file .Jules/nova_paths.md`
