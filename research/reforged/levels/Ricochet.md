# Ricochet

Three readable courts turn the original moving-ball hazard into a timing toy. Balls rebound horizontally between short posts; the player climbs toward gold. The safe strips between courts give room to stop and choose again. This is an authored design proposal, not a measured claim that everyone will find it fun.

- **Catalog type:** `timing`
- **Catalog description:** `Read the rebounds, pause in the refuges, and choose a central sprint or a longer side detour. Four balls, three courts, one gold finish.`
- **Generator:** `node tooling/reforged/create_ricochet.mjs`
- **Level:** `web/reforged/levels/Ricochet.json`

## Intended route and choices

Start at `(0,-82)`. Observe the first ball at `y=-58`, cross when it has passed, and pause near `(0,-44)` before entering the first central opening. Repeat at the middle court (`y=0`), then cross the final pair at `y=58` and reach `(0,82)`.

The first partition also has a side opening centered at `(-70,-32)`; the second has one at `(70,32)`. Traveling outside the ball endpoint posts at `x=±60` avoids a timed crossing in that court, at the cost of more travel and negotiating a side opening. The alternating side openings prevent one uninterrupted run up an edge. Mixing the middle and side routes is encouraged. The final pair creates a brief escalation without adding a new rule.

## Why this layout

The visible posts tell the player where rebounds happen. One ball teaches the pattern, a slightly faster second court asks for another read, and a pair finishes the idea. The player can stop between rows; mistakes should involve choosing when and where to cross, rather than steering through a forest of hazards. Unlike Switchback's long laser slalom and turning patrols, this is a short set of crossings with optional outside detours.

## Construction and checks

Original `OBDot.116` motor, ray, controllers, and linked actuators are cloned. Authored changes are starting transforms, motor displacement (`0.48`, `0.58`, or `0.5` units per logic tick), and the turn actuator's `180°` rebound (stored as `3.6`, accounting for the native converter's division by `0.02`). No runtime or physics changes. All inactive base instances remain available as templates.

The four-unit walls leave 20 units between capped opening edges, providing 14 units of player-center width for the radius-three player. Boundary centers are at `±94`, and generated vertices stay within `±98`. Spawn and goal are 12 units inward from boundary centers and 24 units from their nearest ball row. Short posts end nine units above and below each ball row; the waiting strips are beyond them.

The generator checks unique IDs, the 23-byte ID limit, source templates, parents, every logic link, object references, and wall bounds. Original-engine motion, turn stability, rendered readability, and completion remain central validation tasks; no browser was launched by this designer.

## Native correction

The first native observer run found all four balls escaping without reversing. Stored `drot=180` was incorrect: `KX_ConvertActuators.cpp:154–156` divides by `BLENDER_HACK_DTIME=0.02` before converting degrees to radians. That meant 9000 degrees, exactly 25 full turns. The corrected authored payload is `180 * 0.02 = 3.6`, with no engine changes. Native rerun must confirm rebounds.

## Risk

The original ray sensor is edge-triggered. The expected 180-degree reversal sends the ball away from its wall, but original-engine playback must confirm repeated rebounds instead of sticking or escaping. If central playback finds unstable reversal, retain the course geometry and repair authored patrol values only. Four balls is the intentional cap; adding density would dilute the clear timing decisions.
