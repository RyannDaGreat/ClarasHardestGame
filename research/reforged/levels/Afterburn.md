# Afterburn

A three-straight sprint circuit with alternating wide hairpins, optional eastward boosts, short parallel ice lanes, and brown braking runoffs. A staggered central chicane lets confident players cut across the circuit. No timer or lap counter is required; find any route to gold.

- Catalog type: `Speed / braking`.
- Catalog description: `Sprint three straights, brake into wide hairpins, or cut through the central chicane.`
- Build: `node tooling/reforged/create_afterburn.mjs`.
- Output: `web/reforged/levels/Afterburn.json`.
- Static verification: `node .frenzy/fun-afterburn/validate.mjs`.

## Intended play

Spawn at (-80,-64), finish at (78,64). The long circuit heads east along the bottom straight, north through the wide right hairpin, west along the middle straight, north around the left hairpin, and east to gold. Pads at (-62,-64) and (-62,64) point east. Their lanes have more than 140 units of straight room before the boundary and 48-unit-wide muck recovery patches at the far end. The middle-left recovery patch helps set up the second hairpin.

The forgiving route avoids both pads and both ice strips: (-80,-64), (-80,-48), (72,-48), (72,0), (-72,0), (-72,48), (78,48), (78,64). It has at least 12 units of wall clearance for a radius-three ship. Players can move between the dry, boosted, and icy lanes before committing to a turn. The outer straight ice strips occupy x=-58..14 at y=-86..-74 and y=74..86. They stop 24 units before the recovery patches and do not overlap pads.

For the shorter central chicane, turn north at x=-8 through the lower divider cut, cross to x=8 in the central straight, and continue through the upper cut. The clear gap is 16 units after accounting for wall junctions, leaving eight units to either side of the centerline. This shortcut rewards lining up and braking, while the hairpins offer wider passages. It remains a route choice, not a locked progression requirement.

## Original components

All 111 base objects remain, including inactive projectile/player templates. Camera, scene, format, version, original object logic, and player physics are preserved. New objects comprise eight original-face wall segments, five stationary original Ice/Muck floors, and two original east-push instances. There are no moving enemies or invented mechanics.

`OBDown Push.006` provides the original eastward `SpdX` property, rotation, arrow-emitter logic, and artwork. Clones use scale 0.5 and remapped self-links. `OBPlane.022` and `OBPlane.023` supply Ice and Muck with original depth and Z scaling. `OBGrid.014` and `wallGeometry` supply visible rail faces, end junctions, and full original-depth collision walls.

## Validation and risks

All 126 IDs are unique and at most 23 bytes. Every source, parent, link, and object reference resolves. All authored transformed floor/pad vertices and generated wall vertices are within ±98 XY. Static sampled route clearance is 12 units on the forgiving route and eight units on the chicane. Spawn and finish are clear of walls. Regeneration produced identical bytes, SHA256 `1999e4cfdefd240e64f78d849d93f50e31130d1132121f39efbc4a3124b31958`.

Native gameplay and visual checks are delegated to the parent agent; no completion is claimed. The original ice-plus-boost combination can travel about 126 units in 0.65 seconds according to the parent's engine probe, which is why their footprints are separated here. A player can deliberately steer from a pad onto ice; this remains optional risk. Verify that the original muck actually provides enough braking during a high-speed approach, and assess whether the central shortcut feels rewarding relative to the longer circuit. The layout deliberately favors a safe finish over mandatory precision.
