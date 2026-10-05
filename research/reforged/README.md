# Reforged construction research

Status: original-data audit complete for the listed observations; editor coverage and reconstruction are **not yet verified**. A screenshot or an imported opaque scene is not sufficient to claim authoring coverage.

## Grid and wall construction

`audit-grids.py` reads the authoritative, unchanged Blender file through its saved SDNA schema. `grid-audit.json` records positions, scales, vertex coordinates, face counts, layers and modifier stacks. Run from the repository root with Python 3; it requires no Blender installation. `audit-components.py` additionally exports mesh faces/UVs/materials, object hierarchies and actual sensor/controller/actuator connections to ignored `output/components-audit.json`.

The active-layer test follows original `BL_BlenderDataConversion.cpp`: object layer AND scene layer. Base-layer membership alone is not the engine criterion.

| Levels | Measured mesh lattice | Typical world spacing | Qualification |
|---|---|---|---|
| 2 | 21 × 21 vertex coordinates, local step 0.1 | 10.38774948 | Object scale 103.8774948 |
| 3–4 | Local step 0.1 | 10 | Level 3 also has 0.3 gaps; multiple meshes |
| 5 | Main wall lattice 15 × 15 coordinates, local step about 0.36515 | About 14.97 | Other wall meshes have offsets and different extents |
| 6–7, 9–10, 2A | 32 × 32 coordinates (31 intervals) spanning local −5 to +5 | 200/31 = 6.4516129 | Object scale 20; shapes remove cells and add height layers |
| 8 | Base late-level lattice plus additional coordinates | Mixed | 38 × 34 distinct XY coordinates; off-grid edits |
| 1A | Partial late-level lattice | 6.4516129 | 24 × 32 distinct XY coordinates |

Level 1's objects named Grid are inactive. Their unit-scale meshes cannot establish the geometry of the active level. A vertex-coordinate count is not automatically a playable tile count.

The inspected grids have no saved modifiers. This establishes stored mesh geometry, **not** the sequence of modeling operations originally used to create it.

The glowing wall is textured geometry: `Guide.png` is an orange/white stripe. Grid faces use UV orientation to run that stripe along the wall. Chrome-textured raised geometry supplies junctions. Example Level 10: 128 visible Guide faces, 85 visible chrome faces, 718 invisible faces, 931 total. `MTFace.mode` 517 includes collision and texture flags; 1541 adds `TF_INVISIBLE` (1024). Original `DNA_meshdata_types.h` defines `TF_DYNAMIC=1`, `TF_TEX=4`. Invisible faces must remain part of collision geometry; rendering only the apparent line would lose them. Level 8 also offsets the grid object in Z, with corresponding local mesh heights.

VLM review of original-engine Level 7–10 captures agrees with these data: glowing boundaries and metallic junctions, movable/rotating hazards, portal devices, switches and different floor regions. The image establishes appearance; the mesh/logic audit establishes structure. A static picture does not establish timing or collision behavior.

## Components and connections

| Scene | Active objects | Active roots | Sensor/controller links | Cross-object links |
|---|---:|---:|---:|---:|
| Lv7 | 86 | 52 | 158 | 18 |
| Lv8 | 102 | 50 | 183 | 17 |
| Lv9 | 96 | 50 | 156 | 10 |
| Lv10 | 101 | 57 | 213 | 23 |

Counts include cameras, lights and infrastructure; they are **not** an editor coverage score. Inactive objects include runtime spawn templates and cannot simply be discarded.

Verified examples from LvGen B:

- `SpawnPoint.004` adds inactive `Walrus.013` on its initial sensor and on the `Respawn` message.
- `Portal1.005` has a collision sensor for property `Wh`. Its `cont` links both its local Fwoosh spawn actuator and `PortalOut1.003/act`, under the other portal. The ship's `WH1` collision controller activates its end-object actuator. The destination spawns a new Walrus. Preserve this mechanism and exit orientation; do not substitute a position-only teleport.
- `Forcefield.003` is a hierarchy, not a single sprite. Its `Cube.054` child controls particle spawning through `On`; its projector children have mesh-switch actuators. A switch connection may address several children and must be modeled as a component connection.
- `Killer.002` has animated children; `Cylinder.002` uses an IPO actuator, looping frames 2–361. Moving the root must retain animation coordinates relative to that root.
- The ship has collision/ray branches for `Ball`, `Wall`, `Ice`, `Muck`, `Power` and directional speed properties. Floor painting must preserve the relevant collision/ray surfaces and properties.

## Required authoring coverage gates

The target is at least 95% of late-level authoring needs. Verify both (a) the proportion of meaningful placed component instances supported and (b) the distinct structural/mechanical features below. Report exceptions explicitly. Do not inflate a score with sixteen lamps, repeated easy objects, or an opaque imported level that cannot be edited.

| Feature family | Required editor operation | Verification still required |
|---|---|---|
| Grid | Per-level spacing, subdivisions, origin; optional snap | Multiple original resolutions and JSON round-trip |
| Walls | Carve/paint sections, junctions, editable off-grid vertices | Visible surfaces and hidden collisions rebuilt in engine |
| Placement | Move, rotate, scale; duplicate/remove; hierarchy | Child transforms and animations stay attached |
| Portals | Visible directed links, paired option, exit direction | Real ship destruction/spawn at selected destination |
| Switches/forcefields | Connect switch to field; configure initial state | All targeted child actuators behave correctly |
| Projectiles/turrets | Place original component; timing/direction settings | Original sensors, spawn templates and collisions |
| Moving hazards/lasers | Original animation plus placement/orientation | IPO, parent transforms and frame timing |
| Floor regions | Ice, muck, power and directional push regions | Original ray/collision-driven ship responses |
| Spawn/finish | Place start and goal, restart, win reporting | Actual keyboard-driven winning route |
| Scene presentation | Camera, bounds, lighting, backgrounds | VLM comparison at the same view |
| Persistence | Versioned JSON; import/export; undo/redo | Saved and reloaded level plays identically |

## Existing editor research applied

- [Tiled objects](https://doc.mapeditor.org/en/stable/manual/objects/) and [templates](https://doc.mapeditor.org/en/stable/manual/using-templates/): independent floating-point object positions, reusable templates with per-instance overrides, polygons and visible object-reference arrows.
- [Tiled source, mapobject.h](https://github.com/mapeditor/tiled/blob/master/src/libtiled/mapobject.h) and [JSON converter](https://github.com/mapeditor/tiled/blob/master/src/libtiled/maptovariantconverter.cpp): separate object IDs, transforms, polygons, templates and map tile dimensions. This supports separating placement from snapping instead of encoding all positions as tile indices.
- [LDtk layer JSON](https://ldtk.io/docs/game-dev/json-overview/levels-section/) and [schema](https://ldtk.io/json/): layers carry grid sizes and entity instances separately. This supports variable grid resolutions without changing gameplay units.
- [Usability heuristics](https://www.nngroup.com/articles/ten-usability-heuristics/): visible selection, immediate feedback, undo, understandable errors and a clear save/play state. Use a visible component palette and property inspector, not a command-only interface.

These sources guide authoring interaction. The original Blender data and engine remain the authority for gameplay.
