/** Rebuild Slingshot from original portal and directional-push components. */
import {readFile, writeFile} from 'node:fs/promises';
import {wallGeometry} from '../../web/reforged/geometry.js';

const level = JSON.parse(
  await readFile('web/reforged/levels/LvGen-B.json', 'utf8'),
);
const library = JSON.parse(await readFile('web/reforged/library.json', 'utf8'));
const originals = new Map(
  level.objects.map((object) => [object.id, structuredClone(object)]),
);
level.name = 'Slingshot';
level.description =
  'Hop three laser islands: launch east from the lower apron, climb the left island, then curve around the final bumper to gold. Blue boosts are optional; portal arrows point into roomy landings. WASD or arrows; Backspace restarts.';
level.grid = {spacing: 4, subdivisions: 1, snap: true, origin: [0, 0]};
for (const object of level.objects)
  object.active =
    /^OB(?:Lamp|Arial|MainCam|PanCam|PanPivot|Bounds|SpawnPoint|Finish)/.test(
      object.id,
    );
level.objects.find((object) => object.id === 'OBSpawnPoint.004').position = [
  -76, -58, 0,
];
level.objects.find((object) => object.id === 'OBFinish.002').position = [
  70, 62, 0,
];

// The wide launch apron and two upright hexagons make a triangular island circuit.
const islands = [
  [
    [-88, -80],
    [8, -80],
    [26, -56],
    [8, -30],
    [-88, -30],
    [-94, -55],
  ],
  [
    [-88, 0],
    [-56, -18],
    [-16, 0],
    [-16, 66],
    [-56, 84],
    [-88, 66],
  ],
  [
    [16, 0],
    [52, -18],
    [88, 0],
    [88, 66],
    [52, 84],
    [16, 66],
  ],
];
const segments = [];
for (const polygon of islands)
  for (let index = 0; index < polygon.length; index++)
    segments.push([polygon[index], polygon[(index + 1) % polygon.length]]);
// Both obstacles are free-standing, so either side is usable with a radius-3 ship.
segments.push(
  [
    [-74, 34],
    [-44, 34],
  ],
  [
    [44, 42],
    [54, 52],
  ],
);
const wallSource = 'OBGrid.014';
const wallMesh = library.meshes[library.objects[wallSource].data];
const wallWidth = 4;
for (const [index, [start, end]] of segments.entries())
  level.objects.push({
    id: 'OBSlingWall' + index,
    source: wallSource,
    label: 'Island edge / bumper ' + (index + 1),
    position: [0, 0, 0],
    rotation: [0, 0, 0],
    scale: [1, 1, 1],
    parent: null,
    active: true,
    logic: {sensors: [], controllers: [], actuators: []},
    geometry: wallGeometry(wallMesh, start, end, wallWidth),
  });

const portalTemplates = [
  'OBPortal1.004',
  'OBPortal1.005',
  'OBPortalOut2.003',
  'OBPortal2.004',
  'OBPortal2.005',
  'OBPortalOut1.003',
];
const pairs = [
  {
    name: 'A',
    entrance: [-4, -56],
    exit: [-66, 4],
    inAngle: Math.PI / 2,
    outAngle: 0,
    label: 'Lower apron to left island',
  },
  {
    name: 'B',
    entrance: [-34, 60],
    exit: [34, 8],
    inAngle: Math.PI,
    outAngle: 0,
    label: 'Left island to goal island',
  },
];
for (const pair of pairs) {
  const remap = new Map(
    portalTemplates.map((id, index) => [id, 'OBSling' + pair.name + index]),
  );
  for (const source of portalTemplates) {
    const object = structuredClone(originals.get(source));
    Object.assign(object, {
      id: remap.get(source),
      label: pair.label,
      active: true,
      parent: remap.get(object.parent) || null,
    });
    for (const bricks of Object.values(object.logic))
      for (const brick of bricks) {
        if (brick.links)
          brick.links = brick.links.map((link) => {
            const [target, ...path] = link.split('/');
            return [remap.get(target) || target, ...path].join('/');
          });
        for (const key of Object.keys(brick.references || {}))
          brick.references[key] =
            remap.get(brick.references[key]) || brick.references[key];
      }
    if (source === 'OBPortal1.004') {
      object.position = [...pair.entrance, 0];
      object.rotation = [0, 0, pair.inAngle];
    }
    if (source === 'OBPortal2.004') {
      object.position = [...pair.exit, 0];
      object.rotation = [0, 0, pair.outAngle];
    }
    level.objects.push(object);
  }
}

// Original SpdX and SpdY source properties determine force direction, not rotation.
const pads = [
  ['OBDown Push.006', [-48, -58], 'East across the launch apron'],
  ['OBUp Push.002', [-30, 12], 'North around the wide end of the shelf'],
  ['OBDown Push.006', [42, 26], 'East into the final landing'],
  ['OBUp Push.002', [70, 36], 'North toward gold'],
];
for (const [index, [source, position, label]] of pads.entries()) {
  const object = structuredClone(originals.get(source));
  Object.assign(object, {
    id: 'OBSlingPush' + index,
    position: [...position, 0],
    scale: [0.6, 0.6, 0.6],
    label,
    active: true,
  });
  for (const bricks of Object.values(object.logic))
    for (const brick of bricks) {
      if (brick.links)
        brick.links = brick.links.map((link) =>
          link.replace(source + '/', object.id + '/'),
        );
      for (const key of Object.keys(brick.references || {}))
        if (brick.references[key] === source) brick.references[key] = object.id;
    }
  level.objects.push(object);
}

const objects = new Map(level.objects.map((object) => [object.id, object]));
if (objects.size !== level.objects.length) throw Error('Duplicate object IDs');
for (const object of level.objects) {
  if (Buffer.byteLength(object.id) > 23)
    throw Error('ID exceeds BGE capacity: ' + object.id);
  if (!library.objects[object.source])
    throw Error('Unknown template: ' + object.source);
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
      throw Error('Wall outside arena: ' + object.id);
}
await writeFile(
  'web/reforged/levels/Slingshot.json',
  JSON.stringify(level, null, 2) + '\n',
);
console.log(
  'Slingshot:',
  segments.length,
  'walls, 2 original portal pairs, 4 boosts;',
  level.objects.length,
  'objects. IDs, templates, links, references, parents and bounds verified.',
);
