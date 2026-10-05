/** Rebuild Relay using original Blender logic components. Run from repository root. */
import {readFile, writeFile} from 'node:fs/promises';
import {wallGeometry} from '../../web/reforged/geometry.js';

const level = JSON.parse(
  await readFile('web/reforged/levels/LvGen-B.json', 'utf8'),
);
const library = JSON.parse(await readFile('web/reforged/library.json', 'utf8'));
const originals = new Map(
  level.objects.map((object) => [object.id, structuredClone(object)]),
);
level.name = 'Relay';
level.description =
  'Climb three rooms and hand yourself off through the portals. A tight side doorway in the middle room hides a shortcut to the finish. Portal arrows show safe exits. WASD or arrows; Backspace restarts.';
level.grid = {spacing: 4, subdivisions: 1, snap: true, origin: [0, 0]};
for (const object of level.objects)
  object.active =
    /^OB(?:Lamp|Arial|MainCam|PanCam|PanPivot|Bounds|SpawnPoint|Finish)/.test(
      object.id,
    );
level.objects.find((object) => object.id === 'OBSpawnPoint.004').position = [
  -76, -72, 0,
];
level.objects.find((object) => object.id === 'OBFinish.002').position = [
  72, 74, 0,
];

// Wide mandatory lanes let players choose either side of freestanding obstacles.
const boundary = 94,
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
  [
    [-32, -boundary],
    [-32, boundary],
  ],
  [
    [32, -boundary],
    [32, boundary],
  ],
  [
    [-62, -30],
    [-62, 18],
  ],
  // Shortcut pocket: a 20-unit mouth (16 clear after wall caps) in its right side.
  [
    [-32, -12],
    [-6, -12],
  ],
  [
    [-32, 34],
    [-6, 34],
  ],
  [
    [-6, -12],
    [-6, 0],
  ],
  [
    [-6, 20],
    [-6, 34],
  ],
  // A final floating island offers two routes; neither is a dead end.
  [
    [62, -22],
    [62, 22],
  ],
];
const source = 'OBGrid.014',
  mesh = library.meshes[library.objects[source].data];
for (const [index, [start, end]] of segments.entries())
  level.objects.push({
    id: 'OBRelayWall' + index,
    source,
    label: 'Relay laser wall ' + (index + 1),
    position: [0, 0, 0],
    rotation: [0, 0, 0],
    scale: [1, 1, 1],
    parent: null,
    active: true,
    logic: {sensors: [], controllers: [], actuators: []},
    geometry: wallGeometry(mesh, start, end, wallWidth),
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
    entrance: [-62, 66],
    exit: [10, -68],
    inAngle: Math.PI,
    outAngle: 0,
    label: 'First handoff',
  },
  {
    name: 'B',
    entrance: [10, 66],
    exit: [62, -68],
    inAngle: Math.PI,
    outAngle: 0,
    label: 'Second handoff',
  },
  {
    name: 'C',
    entrance: [-20, 10],
    exit: [62, 46],
    inAngle: 0,
    outAngle: 0,
    label: 'Pocket shortcut',
  },
];
for (const pair of pairs) {
  const remap = new Map(
    portalTemplates.map((id, index) => [id, 'OBRelay' + pair.name + index]),
  );
  for (const id of portalTemplates) {
    const object = structuredClone(originals.get(id));
    object.id = remap.get(id);
    object.label = pair.label;
    object.active = true;
    object.parent = remap.get(object.parent) || null;
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
    if (id === 'OBPortal1.004') {
      object.position = [...pair.entrance, 0];
      object.rotation = [0, 0, pair.inAngle];
    }
    if (id === 'OBPortal2.004') {
      object.position = [...pair.exit, 0];
      object.rotation = [0, 0, pair.outAngle];
    }
    level.objects.push(object);
  }
}

// Optional boosts sit on straight clear approaches, away from the precision doorway.
for (const [index, position] of [
  [-78, 34],
  [16, 40],
  [80, 44],
].entries()) {
  const object = structuredClone(originals.get('OBUp Push.002'));
  const oldId = object.id;
  object.id = 'OBRelayPush' + index;
  object.label = 'Straightaway boost';
  object.active = true;
  object.position = [...position, 0];
  object.scale = [0.6, 0.6, 0.6];
  for (const bricks of Object.values(object.logic))
    for (const brick of bricks)
      if (brick.links)
        brick.links = brick.links.map((link) =>
          link.replace(oldId + '/', object.id + '/'),
        );
  level.objects.push(object);
}

// One original wall-following hazard animates the final room; the first two teach routing.
const patrol = structuredClone(originals.get('OBDot.116'));
const patrolSourceId = patrol.id;
patrol.id = 'OBRelayPatrol';
patrol.label = 'Final-room patrol';
patrol.position = [80, 0, 0];
patrol.active = true;
for (const bricks of Object.values(patrol.logic))
  for (const brick of bricks)
    if (brick.links)
      brick.links = brick.links.map((link) =>
        link.replace(patrolSourceId + '/', patrol.id + '/'),
      );
level.objects.push(patrol);

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
  for (const point of object.geometry?.vertices || [])
    if (Math.abs(point[0]) > 98 || Math.abs(point[1]) > 98)
      throw Error('Geometry exceeds arena: ' + object.id);
}
await writeFile(
  'web/reforged/levels/Relay.json',
  JSON.stringify(level, null, 2) + '\n',
);
console.log(
  'Authored Relay:',
  segments.length,
  'walls, 3 portal pairs, 3 boosts, 1 patrol;',
  level.objects.length,
  'objects. IDs, templates, links, references, parents, and wall bounds validated.',
);
