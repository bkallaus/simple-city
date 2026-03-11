## 2024-03-11 - Sync Upcoming Tier Indicator with Cursor
**Learning:** In canvas/WebGL games, critical game state updates (like the upcoming placement item) aren't naturally exposed to screen readers. Relying solely on 3D visual cues like cursor colors completely excludes visually impaired users.
**Action:** Always mirror critical 3D state to an visually integrated DOM element using `aria-live="polite"` and `aria-atomic="true"` so that state changes are seamlessly announced without interrupting gameplay.
