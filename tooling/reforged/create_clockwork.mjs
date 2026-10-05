/** Rebuild the Clockwork timing circuit from original exported parts. Run at repo root. */
import {readFile, writeFile} from 'node:fs/promises';
import {wallGeometry} from '../../web/reforged/geometry.js';

const level = JSON.parse(
  await readFile('web/reforged/levels/LvGen-B.json', 'utf8'),
);
const library = JSON.parse(await readFile('web/reforged/library.json', 'utf8'));
const originalObjects = new Map(
  level.objects.map((object) => [object.id, object]),
);
const source = 'OBGrid.014';
const mesh = library.meshes[library.objects[source].data];
const wallWidth = 4;
const firingFrequency = 110;
const platformHeight = -2.1;
level.name = 'Clockwork';
level.description =
  'Follow a clockwise circuit through three timed laser crossings. Weave between cover, pause in the corners, and move after each pulse.';
level.grid = {spacing: 8, subdivisions: 2, snap: true, origin: [0, 0]};
for (const object of level.objects)
  object.active =
    /^OB(?:Lamp|Arial|MainCam|PanCam|PanPivot|Bounds|SpawnPoint|Finish)/.test(
      object.id,
    );
originalObjects.get('OBSpawnPoint.004').position = [-68, -76, 0];
originalObjects.get('OBFinish.002').position = [68, -76, 0];

// The center peninsula closes the bottom shortcut. Narrow openings lead only
// into individually sealed turret recesses, never through the central block.
const segments = [
  [
    [-96, -96],
    [96, -96],
  ],
  [
    [96, -96],
    [96, 96],
  ],
  [
    [96, 96],
    [-96, 96],
  ],
  [
    [-96, 96],
    [-96, -96],
  ],
  [
    [-40, -96],
    [-40, -22],
  ],
  [
    [-40, -2],
    [-40, 40],
  ],
  [
    [40, -96],
    [40, -22],
  ],
  [
    [40, -2],
    [40, 40],
  ],
  [
    [-40, 40],
    [-10, 40],
  ],
  [
    [10, 40],
    [40, 40],
  ],
  [
    [-40, -22],
    [-12, -22],
  ],
  [
    [-12, -22],
    [-12, -2],
  ],
  [
    [-12, -2],
    [-40, -2],
  ],
  [
    [40, -22],
    [12, -22],
  ],
  [
    [12, -22],
    [12, -2],
  ],
  [
    [12, -2],
    [40, -2],
  ],
  [
    [-10, 40],
    [-10, 10],
  ],
  [
    [-10, 10],
    [10, 10],
  ],
  [
    [10, 10],
    [10, 40],
  ],
  // Alternate the open side of each crossing. These walls stop before the
  // opposite boundary, leaving 20 units of clear passage after wall thickness.
  [
    [-96, -38],
    [-64, -38],
  ],
  [
    [-40, 14],
    [-72, 14],
  ],
  [
    [-26, 40],
    [-26, 64],
  ],
  [
    [26, 96],
    [26, 72],
  ],
  [
    [40, 14],
    [72, 14],
  ],
  [
    [96, -38],
    [64, -38],
  ],
];
for (const [index, [start, end]] of segments.entries())
  level.objects.push({
    id: 'OBClockWall' + index,
    source,
    label: 'Clockwork wall ' + (index + 1),
    position: [0, 0, 0],
    rotation: [0, 0, 0],
    scale: [1, 1, 1],
    parent: null,
    active: true,
    logic: {sensors: [], controllers: [], actuators: []},
    geometry: wallGeometry(mesh, start, end, wallWidth),
  });

const turrets = [
  {name: 'West', position: [-22, -12, platformHeight], angle: -Math.PI / 2},
  {name: 'North', position: [0, 20, platformHeight], angle: Math.PI},
  {name: 'East', position: [22, -12, platformHeight], angle: Math.PI / 2},
];
for (const {name, position, angle} of turrets) {
  const platform = structuredClone(originalObjects.get('OBLaserPlatform.011'));
  const turret = structuredClone(originalObjects.get('OBStill Turret.002'));
  platform.id = 'OBClockBase' + name;
  platform.parent = null;
  platform.position = position;
  platform.rotation = [0, 0, angle];
  platform.active = true;
  turret.id = 'OBClockTurret' + name;
  turret.parent = platform.id;
  turret.active = true;
  turret.logic.sensors.find(
    (sensor) => sensor.name === 'sensor2',
  ).settings.freq = firingFrequency;
  for (const bricks of Object.values(turret.logic))
    for (const brick of bricks)
      if (brick.links)
        brick.links = brick.links.map((link) =>
          link.replace('OBStill Turret.002/', turret.id + '/'),
        );
  level.objects.push(platform, turret);
}

const objects = new Map(level.objects.map((object) => [object.id, object]));
if (objects.size !== level.objects.length) throw Error('Duplicate object IDs');
for (const object of level.objects) {
  if (Buffer.byteLength(object.id) > 23)
    throw Error('Object ID exceeds 23 bytes: ' + object.id);
  if (object.parent && !objects.has(object.parent))
    throw Error('Missing parent: ' + object.id);
  for (const bricks of Object.values(object.logic))
    for (const brick of bricks) {
      for (const link of brick.links || []) {
        const [id, kind, name] = link.split('/');
        if (
          !objects.get(id)?.logic[kind]?.some((target) => target.name === name)
        )
          throw Error('Broken link: ' + link);
      }
      for (const reference of Object.values(brick.references || {}))
        if (reference?.startsWith('OB') && !objects.has(reference))
          throw Error('Missing reference: ' + reference);
    }
  for (const vertex of object.geometry?.vertices || [])
    if (Math.abs(vertex[0]) > 98 || Math.abs(vertex[1]) > 98)
      throw Error('Wall outside board: ' + object.id);
}
await writeFile(
  'web/reforged/levels/Clockwork.json',
  JSON.stringify(level, null, 2) + '\n',
);
console.log(
  'Clockwork:',
  segments.length,
  'walls,',
  turrets.length,
  'original turrets;',
  level.objects.length,
  'objects; IDs, links, parents, references, and wall bounds valid.',
);
