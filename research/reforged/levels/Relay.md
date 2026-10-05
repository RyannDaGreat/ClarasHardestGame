# Relay

**Catalog type:** Portal routing / optional shortcut.  
**Catalog description:** Climb three roomy chambers, relay through original portals, and discover a precision doorway that skips the final ascent.

The central pleasure is recognizing the same climb-and-handoff pattern, then noticing a way to break it. The first room teaches a forgiving choice around a freestanding wall. The second presents a visible side pocket. Players can stay on the broad main route or enter its smaller doorway to earn an immediate skip. The final room introduces one original patrol so the full route has a small moving climax. Three optional push pads reward confident straight-line movement without forcing contact.

## Intended route

1. Spawn at (-76,-72), safely away from all hazards. Climb either side of the floating wall at x=-62. Enter portal A at (-62,66).
2. Arrive at (10,-59), nine units above the center-room portal. Climb the open right side to B at (10,66).
3. Arrive at (62,-59). Pick either side of the island at x=62, avoid the wall-following patrol, and reach gold at (72,74).
4. Optional: in room two, enter the side pocket through x=-6, y=0..20. The physical opening is 16 units after wall caps, roughly 10 units for the ship center after its radius. Portal C at (-20,10) arrives at (62,55), above the last island and near the goal.

Every pair is bidirectional, with original output arrows and exits facing usable open space. Top main-route portal arrows face back down their chamber, so revisiting them is also safe. Mandatory side passages are approximately 26 units wide before ship radius; the pocket is deliberately tighter and optional.

## Implementation and checks

Run `node tooling/reforged/create_relay.mjs` from repository root. The result contains 145 objects: original inactive templates and infrastructure, 12 authored laser wall segments, three authentic six-object portal pairs, three original push pads at 0.6 scale, and one original wall-following patrol. Outer walls are centered at ±94 with width 4, leaving geometry within ±96. No runtime, catalog, original logic payload, or physics changes.

The generator passed unique-ID and 23-byte-ID checks, original-source checks, all parent references, all brick links and object references, and generated wall bounds. Portal ownership and cross-links are remapped per pair. A direct source inspection confirmed original exits sit at local y=9. No external inspiration source was used; this design follows the original supplied portal and wall components.

## Remaining review risks

Browser visuals and startup/movement validation belong to the parent task. Win proof was explicitly not requested. The pocket has enough nominal ship clearance but needs visual review for portal ring overlap/readability. Original patrol timing can alter final-room difficulty. All portal rings share original styling, so the three-room arrangement and description carry the route explanation; connection labels are also present in editor objects.
