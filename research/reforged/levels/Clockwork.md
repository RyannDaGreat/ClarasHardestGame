# Clockwork

Catalog description: **Follow a clockwise circuit through three timed laser crossings. Weave between cover, pause in the corners, and move after each pulse.**

The route climbs the left side, crosses the top, and descends the right side of a sealed central peninsula. Each crossing changes travel direction, so the player reads a fresh approach instead of repeating Crossfire's parallel corridor. Alternating cover asks the player to steer across a lane; the broad corners give time to brake and observe. There are three single turrets, with one shared slow cadence (`sensor2.settings.freq=110`), retaining the original projectile speed, lifetime, appearance, and collision logic.

## Rebuild and checks

Run `node tooling/reforged/create_clockwork.mjs` from the repository root. The generator clones `web/reforged/levels/LvGen-B.json` and uses the `OBGrid.014` mesh in `web/reforged/library.json`. It retains all original objects as templates, activating only the normal environment, spawn, finish, and authored objects. Each of the three assemblies clones `OBLaserPlatform.011` and its child `OBStill Turret.002`; own-brick links and parent IDs are remapped. Original `OBLaser`, `OBFast Laser`, and `OBWalrus.013` remain inactive until original logic spawns them.

Generator validation passes: 142 total objects, 25 authored walls, 3 turrets; IDs unique and at most 23 bytes; all parents, links, and object references resolve; all authored wall XY vertices lie within ±98. Repeated generation produced identical SHA-256 `a833320e9198cc7df0ddc146ae220027eb84532013abe73ccb7f144422242f95`.

A sampled path check in `.frenzy/fun-clockwork/check.mjs` verifies 1,001 positions per route segment against all authored wall footprints. Minimum center-to-wall distance is 8 units, leaving 5 units beyond the radius-3 player. Narrowest intentional passage has 20 units of clear width. This is a geometry check, not a live physics or win proof.

## Route and waiting positions

Start `(-68,-76)`; finish `(68,-76)`. Suggested center path:

1. `(-68,-76) → (-52,-52) → (-52,-26)`; wait before the westward projectile line at `y=-12`.
2. Cross toward `(-82,2)`, then turn past the cover to `(-82,30)` and `(-68,80)`.
3. `(-38,80) → (-14,80)`; watch the northward line at `x=0`. Cross diagonally to `(14,58)`, then `(38,58)`.
4. Take the broad corner to `(82,38)` and approach `(82,0)`; watch the eastward line at `y=-12`.
5. Cross to `(52,-26)`, leave through `(52,-52)`, and finish at `(68,-76)`.

Stationary waiting bays, all clear of the straight projectile lines and wall footprints: `(-52,-26)`, `(-82,30)`, `(-38,80)`, `(38,58)`, `(82,0)`, `(52,-52)`. The corners `(-68,80)` and `(82,38)` provide extra recovery space. No checkpoint is added; the entire circuit is short enough to learn as one sequence.

Turret platform placements are west `(-22,-12,-2.1)`, north `(0,20,-2.1)`, east `(22,-12,-2.1)`. Their platform Z rotations are `-π/2`, `π`, `π/2`; turret local orientation and transform remain original. Individually sealed firing recesses avoid shortcuts through the center.

## Remaining verification and risks

Root owns browser/VLM and live physics verification. Confirm all three barrels actually fire outward in the original transform hierarchy, all volleys reach the playable lanes, and their animation reads clearly from the standard camera. Wall ray collision and projectile lifetime remain original; no playtest is claimed here. A player moving at full momentum may overshoot the alternating baffles; broad corners and the 20-unit gaps are deliberate room to brake. A confident player may cross without stopping, which is acceptable: waiting is a tool rather than a forced delay.

## Source and terms

Design is original to this change, with no external inspiration claim. Turret construction follows `tooling/reforged/create_crossfire.mjs`; collision geometry follows `web/reforged/geometry.js`.

- Waiting bay: space clear of the firing line where the player can watch timing.
- Firing recess: sealed side chamber holding a turret and opening into one crossing.
- Cadence: time pattern of repeated projectile shots, controlled by the original sensor frequency.
