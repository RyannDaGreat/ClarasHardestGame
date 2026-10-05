# Undertow

Movement playground: ride four original directional push pads through icy channels around three diamond-shaped laser islands, or follow the wide muddy shore. The course offers readable route choices and room to recover between boosts.

- Catalog type: `Movement / route choice`.
- Catalog description: `Surf icy currents between laser islands, or take the slower muddy shore.`
- Build: `node tooling/reforged/create_undertow.mjs`.
- Output: `web/reforged/levels/Undertow.json`.

## Intended play

Spawn at (-78,-70). For the fast inner route, steer east through the first arrows, turn north around (-2,-42), then east through the open pool at y=4, and north along x=68. The final small muck tile at (68,70) helps shed speed before approaching gold at (76,72). The islands create alternate lines and shortcuts without requiring a single memorized sequence.

A slower route heads north along x=-78 and then east along y=74. The west and north muck strips reward controlled movement; this route has no push pads. Its broad spacing gives new players a fallback and a way to study the inner route. There are no moving enemies, firing cycles, portals, or unavoidable launch traps. Optional wins were permitted in the parent task; an achievable finish remains provided.

The three diamond islands deliberately break up a broad basin instead of making a maze. Four local arrow fields communicate force direction. Separate ice rectangles make the faster line legible; open water-colored background gaps provide braking room and let players change their minds.

## Authentic components

All 111 base objects remain. Original inactive projectile/player templates are retained. The level changes placement and geometry only; no movement constants, player logic, or runtime code change.

- `OBDown Push.006` supplies the original fixed `SpdX` property and east-pointing artwork; `OBUp Push.002` supplies `SpdY`. Their original logic and source rotation are cloned, with self-links remapped. Four instances use scale 0.65.
- `OBPlane.022` and `OBPlane.023` are the original stationary Ice/Muck surfaces, with original materials, properties, Z elevation, Z scale and empty logic. Their XY footprint is scaled to the authored rectangles. `OBIcey` and `OBMuck` are emitters, so they were intentionally not used as stationary floors.
- Sixteen walls use `OBGrid.014` plus the existing `wallGeometry` helper, preserving original visible and collision face attributes.

## Verification and remaining risks

Static verification passed: all 138 IDs are unique and <=23 bytes; every link, reference and parent resolves. All authored wall, floor and pad vertices fit within +/-98 XY. Rebuilding produces identical bytes (SHA256 `11f1191fa8ac8506dd892a081ee5d3f49756a18c3733602114ad158a6f2793b6`).

Sampled intended route centers against each generated wall collision polygon: minimum inner clearance 10.17 units and shore clearance 15.17 units, comfortably above ship radius 3. Inner sample route: (-78,-70),(-14,-62),(-2,-42),(-2,4),(68,4),(68,72),(76,72). Shore sample route: (-78,-70),(-78,74),(76,74).

Original-engine browser and visual validation are delegated to the parent agent. No gameplay completion is claimed here. Main remaining risk: ice momentum plus original push strength may require earlier braking than the drawn centerline suggests; the open intersections and pad-free shore provide alternatives. Check that the final muck patch visibly slows the player and that all surfaces render under the ship in the original engine.
