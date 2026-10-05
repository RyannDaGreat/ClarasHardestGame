# Slingshot

**Catalog type:** Portal islands / directional boosts.  
**Catalog description:** Hop a triangle of laser islands, ride optional blue boosts, and bend around the last bumper into gold.

Three closed, chamfered islands form a triangular circuit: a broad horizontal lower launch apron, an upper-left transfer island, and an upper-right goal island. This layout differs from the vertical strips in Relay and the quadrants in Parallax. The fun is a sequence of clear direction changes, with time to settle after each portal and optional boosts for confident runs. Two bidirectional portal pairs keep destinations readable. Each upper island has a freestanding obstacle with routes around both ends; no moving hazards obscure the movement lesson.

## Intended route

1. Spawn at (-76,-58). Travel east across the wide launch apron, optionally riding the pad at (-48,-58), to portal A at (-4,-56).
2. Arrive on the left island at (-66,13). Move right underneath the horizontal shelf to (-30,12), then climb its wide east side. The north pad is optional. Portal B is at (-34,60).
3. Arrive on the right island at (34,17). Head north to y=26, east toward x=70, then north to gold at (70,62). The two pads suggest this bend around the diagonal bumper. Players may also explore the bumper's west side.

Reverse transfers are safe: A returns to (-13,-56); B returns to (-34,51). Portal arrows face open space. Portal rings and landing points preserve the original six-object component, including cross-object collision-controller links and local y=9 output offsets. Inspection of LvGen-B and `research/reforged/README.md` confirmed that a portal destroys the old ship and spawns a new Walrus with zero configured spawn velocity. “Slingshot” refers to the directional route; it makes no momentum-conservation claim. Push directions use the source components' intrinsic SpdX/SpdY properties.

## Implementation and validation

Run `node tooling/reforged/create_slingshot.mjs` from repository root. Output has 147 objects including inactive runtime templates and infrastructure, 20 authored wall segments, two original portal pairs and four original push pads. IDs, original source availability, all links, references, parent objects and wall vertices within ±98 are checked by the generator. Two successive builds produced identical SHA-256 `3e19616cb46113b1dda76684e571430d5c5dc254403b891e6d7dcd3df8af2fb7`.

The scratch validator `.frenzy/fun-slingshot/validate.mjs` sampled the three intended paths against conservative per-box wall bounds, finding minimum ship-center clearance 7.79 units (player radius 3). It checked all four output positions and zero configured portal spawn velocities. The narrow optional west bypass of the left shelf has 10 units of physical width before subtracting the ship diameter; the main east bypass is wider.

## Remaining review

Native loading, play feel and visual review are delegated to the parent task; no winning run is claimed. Pad acceleration still requires native feel verification: all pads can be bypassed and landings leave steering space, but static clearance does not establish dynamic braking distance. No runtime, catalog or shared-file edits were made. No external design source was used.
