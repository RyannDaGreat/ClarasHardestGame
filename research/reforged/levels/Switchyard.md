# Switchyard

A small switch puzzle with a safe first lesson and a choice of collection order. Touch the lower-left pad to enter the yard, visit both side pads in either order, then take the two-gate center exit. The reward is visibly switching off a whole spark curtain; gates remain open so exploration cannot create a lockout.

Catalog description: **Shut down three spark gates. Learn the first switch, choose your order through the yard, and open the central exit.** Suggested family: switches / routing. Suggested difficulty: approachable puzzle.

Rebuild from the repository root with `node tooling/reforged/create_switchyard.mjs`. Source: `web/reforged/levels/LvGen-B.json` for scene infrastructure, inactive spawn templates and the complete forcefield hierarchy; `web/reforged/levels/Lv10.json` for the original `OBPlane.012` switch. The generator preserves the original engine mechanics and edits only authored placements, original brick connections and geometry.

## Route and native checks

| Item | Position XY | Instance | Effect |
|---|---|---|---|
| Spawn | 0, -80 | OBSpawnPoint.004 | Safe lower room |
| First pad | -58, -64 | OBSYAPad | Opens entry at y=-40 |
| Left pad | -62, 0 | OBSYBPad | Opens exit gate at y=30 |
| Right pad | 62, 0 | OBSYCPad | Opens exit gate at y=62 |
| Finish | 0, 82 | OBFinish.002 | Clear upper pocket |

Test route, allowing braking at corners: `(0,-80) → (-58,-80) → (-58,-64) → (0,-64) → (0,-24) → (-62,-24) → (-62,0) → (-62,18) → (62,18) → (62,0) → (62,18) → (0,18) → (0,82)`. These points are guidance, not a measured winning input script. The loop around the two islands is wide; a radius-three ship has ample clearance. Wait for existing particles to clear after each pad. There is no timed switch expiration.

Inspect `scene.objects['OBSYAField3']['On']`, `OBSYBField3` and `OBSYCField3`: all start at **0**, which means particle production is enabled; touching the associated pad sets the matching value to **1**, stopping production permanently. Check each value stays 1 after leaving its pad, and try left/right in the opposite order. The switch's own `On` resets on exit, so it is not a reliable persistent gate-state readout. The original controller also pulses its visible pad animation.

Each field is cloned as five objects: root `OBSY{A|B|C}Field0`, visible projector `Field1`, opposite component `Field2`, emitting component `Field3`, receiver collision `Field4`. Root rotation zero aligns the field across X. The native root scale 4.55656623840332 places endpoints at about x=±27.34. Adjacent wall ends at x=±28 overlap the projectors; the central opening remains generous after shutdown. The top tunnel is 52 world units clear between wall faces. Lower/middle walls stay within ±96 including caps, inside the ±98 budget.

## Why the connection is authentic

`validation/reforged/connections-motion.mjs` establishes that `OBPlane.012`'s `Activator` can drive a forcefield emitter's `act1`, changing `On` from 0 to 1 during native play. The authored switches use that original collision sensor/controller and its verified 0.15 scale and Z=-1.4284655570983887. The generator additionally connects the original projector's `act2` to switch the projector to `MEFRC Off`. That mesh is resolved from the original Blender database by `runtime/reforged.cpp`; it is not a new asset. The switch's inherited links to unrelated Lv10 killers are removed. There are no authored close-gate links.

The first pad is isolated from the later choice; the pair of short islands frames the yard without forcing precision steering. There are no patrols or turrets competing with the connection lesson. The remaining hazard is the original spark field while active and briefly while its last particles travel to the receiver.

## Validation and limits

The deterministic generator checks duplicate/23-byte IDs, source templates, all controller/sensor links, object and original mesh references, parent presence, and authored wall bounds. All pass. All inactive LvGen-B templates remain available, including `OBFF Particle`.

Native review is pending with the parent task. A static graph pass cannot prove switch collision, sparkle visibility, collision-through-gate behavior, or fun. The key risk is original field particles persisting briefly after shutdown; the description tells the player to let the last sparks clear. Confirm gate projectors visibly change and do not leave invisible collision across the opening. No winning route has been claimed.
