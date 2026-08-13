# Nova Architectural Paths: Obstacle Grid Removal

## Path 1: Surgical Call Removal (Recommended)
**Approach**: Remove or comment out the direct invocation of `spawnObstacles()` at the bottom of the initialization block in `main.js`.
**Pros**: Minimal lines of code changed. Retains the `spawnObstacles` function logic in case designers want to re-enable them in the future.
**Cons**: None.

## Path 2: Obstacle Count Zeroing
**Approach**: Modify `const obstacleCount = 8;` to `const obstacleCount = 0;` inside the `spawnObstacles()` function.
**Pros**: Retains the function call pipeline while naturally gracefully yielding 0 rocks.
**Cons**: Slightly obfuscates the intent compared to commenting out the system, as the loop evaluates but does nothing.

## Path 3: Render-Layer Exclusion
**Approach**: Modify `createBuildingMesh(tier)` so that `tier === -2` returns a dummy empty group instead of a generated dodecahedron.
**Pros**: Obstacles physically block grid placement in logic but are completely invisible, matching the visuals.
**Cons**: Causes a UX disconnect where players cannot click empty-looking tiles. Violates accessibility/clarity guidelines.

**Selected Path**: Path 1 - Surgical Call Removal to match target visuals while keeping codebase clean.
