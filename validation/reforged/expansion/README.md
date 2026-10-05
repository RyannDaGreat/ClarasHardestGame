# Ten-level expansion validation

Ten separate designers authored one level each. All ten pass editor schema checks, original-engine startup at 1920×1080, actual keyboard movement, and screenshot review. Each retains the original runtime, physics, assets and component logic. The catalog now has thirteen entries; its existing three levels remain unchanged.

| Level | Visual review and additional evidence |
|---|---|
| Relay | Three portal-connected rooms, visible boosts, side pocket and final patrol; separate start/finish |
| Pinwheel | Central cross and two smaller rotating rods inside an octagonal rim; read-only orientation telemetry confirms continuous animation |
| Undertow | Three laser islands, original blue ice/brown muck and directional arrows; input shows substantial acceleration, so braking remains part of the challenge |
| Ricochet | Three separated ball courts with side refuges; all four balls reverse during a twelve-second original-engine observation |
| Switchyard | Three blue particle gates, three pads and upper finish; real WASD route turns all emitter `On` properties from 0 to 1, gates remain open, actual finish contact reports `won=true` |
| Slingshot | Three chamfered islands, portal landings and optional arrows; open areas and finish visible |
| Clockwork | U-shaped route around a peninsula, three outward firing turrets and waiting bays; live projectile streams visible |
| Honeycomb | Seven connected hexagonal rooms and two green patrols; both reverse during twelve-second observation and stay within their routes |
| Afterburn | Three sprint lanes, wide turns, optional chicane, ice and brown braking patches; original boosts visibly move the ship |
| Crescendo | Two rooms, patrol choice, portal pair, covered turret crossing and open finish; original ball and shots visible |

The first Ricochet/Honeycomb data used `drot=180`. Blender divides that saved value by `0.02`, causing 25 complete turns instead of a rebound. The corrected authored value is `3.6`. Both native reversal tests pass after the correction. The runtime was not changed. The causal history is retained in root `concerns.md` and the two design notes.

Run from the repository root after `npm ci --prefix validation`:

```sh
node validation/reforged/expansion-smoke.mjs
LEVEL_NAMES=Pinwheel,Ricochet,Honeycomb,Switchyard node validation/reforged/expansion-mechanics.mjs
SKIP_GAMES=1 node validation/reforged/catalog-smoke.mjs
```

`*-start.png` and `*-motion.png` are actual engine captures, not editor mockups. `*-mechanics.json` contains read-only telemetry; the observer never changes engine state. `summary.json` binds the local checks to level hashes. Set `SITE_URL=https://ryanndagreat.github.io/ClarasHardestGame/` for the startup/catalog runners to check deployment; live results use `live-*.json`.

Limits: only Switchyard was completed during this expansion's validation. The other nine have no complete-playthrough guarantee. Static clearance and original component links support their intended routes, but difficulty, optional shortcuts, portal sequences, and braking under every input pattern have not been exhaustively tested. Enjoyment is a design aim, not a measured test result.

Published release `1889d4e` passed GitHub Pages deployment run `37285245549`. A fresh browser then loaded all thirteen public level URLs, checked 1920×1080 startup and actual keyboard displacement, and reported zero page exceptions. All thirteen catalog previews decoded and Parallax opened correctly in the workshop. `live-hashes.json` confirms the deployed loader, catalog and ten new JSON files match local release bytes. The current start/motion captures are from this live sweep; the initial local captures remain in the release commit's history. Only evidence, documentation and generator comments changed after deployment.
