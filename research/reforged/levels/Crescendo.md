# Crescendo

Suggested catalog type: **Mixed-mechanic finale**.

Catalog description: **Choose a side of the patrol island, take the blue handoff, and weave across one laser volley. The narrow inside gap cuts the first corner; the broad final stretch lets you coast home.**

Crescendo builds a short sequence from three original mechanics. A single moving dot introduces a choice around a floating wall. A portal moves the player into a protected lower-right landing. One turret then supplies the peak: enter on the right of the lower cover, cross its horizontal firing line, and leave to the left of the upper cover. The remaining approach is open, so reaching the finish feels like release rather than another surprise. The design intentionally uses only one patrol and one turret. There are no collectibles, repeated laps, or extra mandatory stops.

## Intended route

- Spawn `(-72,-72)`. The broad route climbs through `(-74,-48)` and `(-74,44)`, then crosses above the island to `(-28,44)` and the portal at `(-28,66)`.
- The optional shorter route goes from spawn to `(-42,-52)` and straight up through `(-42,44)`. Its inside doorway at `y=0` has 16 units of physical width after wall caps, versus 40 units in the outer lane. This trades precision for distance; it avoids the patrol's initial lane but is less forgiving of momentum.
- Portal destination is `(72,-68)` with the original exit marker at `(72,-59)`, facing upward. The lower baffle shields this landing from the firing line at `y=0`.
- Move through `(76,-42)` to `(76,-16)`, observe the volley, cross diagonally toward `(48,16)`, and clear the upper baffle via `(48,48)`.
- Finish at `(48,74)` through a broad empty approach. Waiting before or after the firing line is possible, but the level does not require a full stop.

The patrol begins at `(-74,-4)`, 68 units above the starting region. Its original motion and wall-turn logic remain unchanged. It can move throughout the connected left room, so route points describe wall clearance rather than guaranteed hazard-free trajectories. The divider is continuous: the portal is the only intended room transfer.

## Construction and verification

Run `node tooling/reforged/create_crescendo.mjs`. The generator reads `web/reforged/levels/LvGen-B.json` and `web/reforged/library.json`. It preserves the original inactive objects, including the player and projectile spawn templates, and adds 11 walls, one dot, six objects forming one portal pair, and one original two-object turret assembly: 131 objects total.

The turret platform is `(16,0,-2.1)`, rotated `π/2` to fire right, using the same original local turret transform as Clockwork's east-facing assembly. Only its firing sensor frequency changes to `105`; projectile speed, lifetime, appearance, and collision logic stay original. Its shallow recess has top/bottom walls at `y=±10`, open toward the playable crossing. The final stretch above `y=32` is clear of that firing line.

Generator checks pass for unique IDs, the 23-byte native ID limit, known templates, parents, logic links, references, and wall vertices within ±98. Running `.frenzy/fun-crescendo/check.mjs` rebuilds and compares bytes, confirms inactive spawn templates, and samples 1,001 positions per straight route segment against all generated wall footprints. Minimum center-to-wall distances are 10 units on the outer route, 8 on the shortcut, and 14 in the finale; these leave 7, 5, and 11 units beyond the radius-3 ship respectively. These checks establish geometry, not dynamic playability or a win.

Repeated generation SHA-256: `2e3f117b58a4fb4c8d81aee4448e85be1bc4b273c471270077585bc5477e0658`.

## Remaining verification

Root owns native and visual checks. Confirm the portal triggers and lands cleanly, turret shots face right and cross the room, and the dot's turns remain readable. In particular, inspect the narrow inside option under momentum and ensure the transfer leaves enough time to brake before the lower baffle. No live win or visual inspection is claimed here. A confident player may cross the sole volley without waiting, which is consistent with the intended short finish.

The composition is original; there is no external inspiration claim. Assembly patterns come from `tooling/reforged/create_relay.mjs`, `tooling/reforged/create_clockwork.mjs`, `tooling/reforged/create_parallax.mjs`, and `tooling/reforged/create_crossfire.mjs`.

Terms: patrol means the original wall-turning dot; baffle means a wall extending partway across a room; volley means the turret's repeated shot; landing means the position where the portal creates the transferred player.
