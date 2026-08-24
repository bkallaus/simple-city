# Nova Architectural Paths: Ground Fog Implementation

## 1. Standard Approach
Modify `CloudSystem` in `main.js` to spawn clouds at `y = 0.5 + Math.random() * 1.5`.
- **Pros:** Directly achieves the visual target (fog instead of high clouds). Minimal code change.
- **Cons:** Repurposes "clouds" to "fog" without renaming the class (acceptable per minimalism).

## 2. Minimalist Approach
Hardcode `y = 0.5` in `CloudSystem` without random vertical variation.
- **Pros:** Absolute simplest code.
- **Cons:** Might look unnaturally flat, lacking the volumetric feel of `GOAL.png`.

## 3. Lateral/Creative Approach
Delete `CloudSystem` and implement a custom shader-based volumetric fog `THREE.FogExp2` on the scene.
- **Pros:** Potentially more performant and "realistic".
- **Cons:** Massively violates "Simplicity First" and "Surgical Changes" rules. Over-engineered for a low-poly project.

**Decision:** I am proceeding with the **Standard Approach**. It perfectly balances simplicity with the required visual target, modifying only one line in `main.js`.
