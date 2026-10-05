# Pinwheel

An open turning playground with a central four-spoke sweeper, two smaller counter-rotating side bars, and four diagonal fins. The destination is visible across the arena. The player may circle either side, cut inward between the moving spokes, or explore the side pockets. The wide passages allow braking and recovery instead of demanding a memorized serpentine route.

- **Catalog type:** Rotating playground
- **Catalog description:** Circle a four-spoke pinwheel, slip between its arms, and choose your own route past the little side rotors.
- **Spawn / finish:** `(0,-76)` / `(0,72)`.
- **Build:** `node tooling/reforged/create_pinwheel.mjs`.

## Intended route

A conservative left route runs approximately through `(0,-46)`, `(-30,-30)`, `(-43,0)`, `(-30,30)`, `(0,46)`, and the finish. The right route mirrors it. These paths stay outside the central swept radius of about 30, inside the diagonal wall tips at radius 54, and away from the side rotor envelopes. Radius-3 ship clearance is reserved along these routes. A faster, voluntary central route crosses the rotating spokes and creates the timing challenge. Side pockets offer room for playful movement and a distinct smaller hazard rhythm.

## Components and physics

The original `OBKiller.002` parent and `OBCylinder.002` child form each rotor. The source rod extends along local Z; its mesh coordinates are remapped into XY, making its existing Z-rotation IPO sweep across the playfield. Two perpendicular source rods form the large four-spoke pinwheel. The original IPO reaches a complete revolution at frame 410; the authored actuator uses that endpoint. Side rotors negate the existing rotation curve values. The rod's original `Ball` collision property and original sensor/controller/actuator types remain intact. No player physics or runtime files change.

The base level and all inactive templates remain present. All cloned self-links are remapped. Walls use original textured geometry and collision faces. The octagonal rim fits inside ±95 including junctions; side sweeps stay inside ±81. No unsupported coin or collection mechanic is introduced.

## Validation and remaining risks

The generator validates unique IDs, the 23-byte ID limit, sources, parents, logic links, object references, and local wall geometry bounds. Regeneration is deterministic. Static geometry supports the conservative routes; this is not an engine win claim.

Original-engine browser validation is assigned to the parent agent. In particular, inspect that custom cylinder geometry updates the original collision shape, that the parent transform has no inherited tilt, and that animated rods remain in the XY plane. The rods are intentionally thin; enlarge their cross section only if the original renderer makes them hard to read. The open route may be easy, which is intentional for this exploratory level.

## Glossary

- **IPO:** Blender's original keyed object animation, executed by the original engine.
- **Swept radius:** Maximum distance reached by a rotating hazard from its center.
- **Template:** An inactive original component retained for spawned game effects and component references.
