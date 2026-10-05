/** Rebuild Undertow with original push properties, surface physics and wall faces. */
import {readFile, writeFile} from 'node:fs/promises';
import {wallGeometry} from '../../web/reforged/geometry.js';

const level = JSON.parse(
  await readFile('web/reforged/levels/LvGen-B.json', 'utf8'),
);
const library = JSON.parse(await readFile('web/reforged/library.json', 'utf8'));
const originals = new Map(
  level.objects.map((object) => [object.id, structuredClone(object)]),
);
level.name = 'Undertow';
level.description =
  'Ride blue arrows through icy channels between three laser islands, or take the wide muddy shore. Brake in the open pools and find your own line to gold.';
level.grid = {spacing: 8, subdivisions: 2, snap: true, origin: [0, 0]};
for (const object of level.objects)
  object.active =
    /^OB(?:Lamp|Arial|MainCam|PanCam|PanPivot|Bounds|SpawnPoint|Finish)/.test(
      object.id,
    );
level.objects.find((object) => object.id === 'OBSpawnPoint.004').position = [
  -78, -70, 0,
];
level.objects.find((object) => object.id === 'OBFinish.002').position = [
  76, 72, 0,
];

/** Append a placed original instance and remap its internal logic links. */
function place(source, id, position, scale, label) {
  const object = structuredClone(originals.get(source));
  if (!object) throw Error('Missing original template: ' + source);
  Object.assign(object, {id, position, scale, label, active: true});
  for (const bricks of Object.values(object.logic))
    for (const brick of bricks) {
      if (brick.links)
        brick.links = brick.links.map((link) =>
          link.replace(source + '/', id + '/'),
        );
      for (const key in brick.references)
        if (brick.references[key] === source) brick.references[key] = id;
    }
  level.objects.push(object);
  return object;
}

// These are stationary original property-bearing floors, not the similarly named emitters.
const floors = [
  ['Ice', -39, -62, 78, 24],
  ['Ice', -2, -24, 24, 64],
  ['Ice', 32, 4, 64, 24],
  ['Ice', 68, 36, 24, 56],
  ['Muck', -78, 4, 22, 120],
  ['Muck', -3, 74, 130, 20],
  ['Muck', 68, 70, 22, 12],
];
for (const [index, [kind, x, y, width, height]] of floors.entries()) {
  const source = kind === 'Ice' ? 'OBPlane.022' : 'OBPlane.023';
  const original = originals.get(source);
  const floor = place(
    source,
    'OBUnderFloor' + index,
    [x, y, original.position[2]],
    [width / 10, height / 10, original.scale[2]],
    kind + ' ' + (index + 1),
  );
  floor.rotation = [0, 0, 0];
}

// Each force direction is intrinsic to its original source property, not its visual rotation.
const pads = [
  ['OBDown Push.006', -49, -62, 'East into the basin'],
  ['OBUp Push.002', -2, -30, 'North past the first island'],
  ['OBDown Push.006', 25, 4, 'East across the open pool'],
  ['OBUp Push.002', 68, 30, 'North toward the landing'],
];
for (const [index, [source, x, y, label]] of pads.entries())
  place(source, 'OBUnderPush' + index, [x, y, 0], [0.65, 0.65, 0.65], label);

const wallSource = 'OBGrid.014';
const wallMesh = library.meshes[library.objects[wallSource].data];
const boundary = 96,
  wallWidth = 4;
const segments = [
  [
    [-boundary, -boundary],
    [boundary, -boundary],
  ],
  [
    [boundary, -boundary],
    [boundary, boundary],
  ],
  [
    [boundary, boundary],
    [-boundary, boundary],
  ],
  [
    [-boundary, boundary],
    [-boundary, -boundary],
  ],
];
// Separated diamond islands create a delta with multiple crossings, not a forced corridor.
for (const [x, y, radius] of [
  [-34, -8, 19],
  [30, 38, 18],
  [37, -50, 13],
]) {
  const points = [
    [x, y - radius],
    [x + radius, y],
    [x, y + radius],
    [x - radius, y],
  ];
  for (let index = 0; index < points.length; index++)
    segments.push([points[index], points[(index + 1) % points.length]]);
}
for (const [index, [start, end]] of segments.entries())
  level.objects.push({
    id: 'OBUnderWall' + index,
    source: wallSource,
    label: 'Island / shore ' + (index + 1),
    position: [0, 0, 0],
    rotation: [0, 0, 0],
    scale: [1, 1, 1],
    parent: null,
    active: true,
    logic: {sensors: [], controllers: [], actuators: []},
    geometry: wallGeometry(wallMesh, start, end, wallWidth),
  });

const objects = new Map(level.objects.map((object) => [object.id, object]));
if (objects.size !== level.objects.length) throw Error('Duplicate object IDs');
for (const object of level.objects) {
  if (Buffer.byteLength(object.id) > 23)
    throw Error('Object ID exceeds engine limit: ' + object.id);
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
      throw Error('Wall outside playable bounds');
}
await writeFile(
  'web/reforged/levels/Undertow.json',
  JSON.stringify(level, null, 2) + '\n',
);
console.log(
  'Undertow:',
  segments.length,
  'walls;',
  pads.length,
  'original push pads;',
  floors.length,
  'original surface tiles;',
  level.objects.length,
  'objects. IDs, links, references, parents and wall bounds verified.',
);
