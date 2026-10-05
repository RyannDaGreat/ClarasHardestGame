# Honeycomb

Seven hexagonal chambers make a small maze with two loops and a middle crossing. The player starts in the bottom chamber; gold is in the top chamber. Choosing a branch and changing plans at the center is the intended pleasure. There are only two slow original bouncing balls, so the level also works as a relaxed exploration break.

## Reproduce

Run `node tooling/reforged/create_honeycomb.mjs` from the repository root. It reads the original `LvGen-B.json` blueprint and library, preserves inactive templates, and writes `web/reforged/levels/Honeycomb.json`. There is no random input or runtime change.

## Layout and routes

Chambers have radius 30. Their centers are bottom `(0,-51.96)`, southwest `(-45,-25.98)`, northwest `(-45,25.98)`, top `(0,51.96)`, northeast `(45,25.98)`, southeast `(45,-25.98)`, and center `(0,0)`.

- Easy route: bottom → southeast → northeast → top. This gives a spacious route without requiring a hazard crossing.
- Timing route: bottom → southwest → northwest → top. A slow horizontal ball patrols the northwest room at `y=20`; cross behind it or use the room's upper half.
- Connecting route: southwest → center → northeast. The middle ball patrols `y=0`; wait below its track, then cross. This connection makes it possible to switch branches and forms a second independent loop.

Eight shared edges have centered openings. Nominal opening length is 18; the original wall endpoint caps reduce actual clear width to 14, leaving eight extra units beyond the player's six-unit diameter. The upper and lower center walls stay closed, so the direct spawn-to-goal line is not available. Angular outer walls enclose the flower-shaped silhouette.

## Components and validation

The generator creates 38 wall segments with `wallGeometry` and two clones of original `OBDot.116`. Ball motors use original ray/controller/actuator graphs, with speeds 0.28 and 0.24 and intended 180-degree reversals. The authored turn payload is `0.02 * 180 = 3.6`: native `KX_ConvertActuators.cpp` divides it by `BLENDER_HACK_DTIME` (0.02) before degree-to-radian conversion. The earlier payload of 180 would produce 25 full turns and was corrected after root observed the same mistake in Ricochet. Source meshes and original player physics remain unchanged.

Generation checks unique IDs of at most 23 bytes, source existence, parent references, every brick link, object references, finite geometry inside ±98, safe spawn/finish wall clearance, and 101 samples of every center-to-center route with conservative radius-3 clearance including the square wall caps. All checks passed. There are 151 objects total, including inactive original templates.

Native animation and visual checks are parent-owned and were not performed by this designer. A gameplay win is optional for this exploratory level. Residual risk: original wall-ray behavior at acute junctions needs runtime observation; no claim of a completed native win is made.

## Suggested catalog entry

- Name: **Honeycomb**
- Subtitle: **Seven rooms, two loops, your route.**
- Description: **Explore a compact hexagonal maze. Take the quiet east loop, time the west patrol, or switch branches through the middle.**
- Difficulty: **Gentle / exploratory**
- Components: **Angled walls · original bouncing balls · route choices**

## Glossary

- Chamber: one hexagonal room.
- Wall-ray ball: an original hazard that detects a wall ahead and reverses direction.
- Independent loop: a route cycle that offers a genuinely different connection through the chamber network.
