/** Rebuild Crescendo's three short beats from the original logic assemblies. */
import {readFile, writeFile} from 'node:fs/promises';
import {wallGeometry} from '../../web/reforged/geometry.js';

const level = JSON.parse(
  await readFile('web/reforged/levels/LvGen-B.json', 'utf8'),
);
const library = JSON.parse(await readFile('web/reforged/library.json', 'utf8'));
const originals = new Map(
  level.objects.map((object) => [object.id, structuredClone(object)]),
);
level.name = 'Crescendo';
level.description =
  'Choose a side of the patrol island, take the blue handoff, and weave across one laser volley. The narrow inside gap cuts the first corner; the broad final stretch lets you coast home.';
level.grid = {spacing: 4, subdivisions: 1, snap: true, origin: [0, 0]};
for (const object of level.objects)
  object.active =
    /^OB(?:Lamp|Arial|MainCam|PanCam|PanPivot|Bounds|SpawnPoint|Finish)/.test(
      object.id,
    );
level.objects.find((object) => object.id === 'OBSpawnPoint.004').position = [
  -72, -72, 0,
];
level.objects.find((object) => object.id === 'OBFinish.002').position = [
  48, 74, 0,
];

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
  [
    [0, -boundary],
    [0, boundary],
  ],
  // A broad outer lane and shorter inner lane rejoin before the portal.
  [
    [-52, -36],
    [-52, 32],
  ],
  [
    [0, 0],
    [-32, 0],
  ],
  // Protected transfer landing, then a single diagonal crossing between cover.
  [
    [0, -30],
    [58, -30],
  ],
  [
    [64, 30],
    [boundary, 30],
  ],
  // A shallow recess contains the turret while its barrel faces right.
  [
    [0, -10],
    [28, -10],
  ],
  [
    [0, 10],
    [28, 10],
  ],
];
const source = 'OBGrid.014',
  mesh = library.meshes[library.objects[source].data];
for (const [index, [start, end]] of segments.entries())
  level.objects.push({
    id: 'OBCresWall' + index,
    source,
    label: 'Crescendo wall ' + (index + 1),
    position: [0, 0, 0],
    rotation: [0, 0, 0],
    scale: [1, 1, 1],
    parent: null,
    active: true,
    logic: {sensors: [], controllers: [], actuators: []},
    geometry: wallGeometry(mesh, start, end, wallWidth),
  });

/** Clone one original assembly, remapping internal links, references and parents.
 * >>> cloneAssembly(['OBDot.116'], ['OBCresPatrol'])[0].id
 * 'OBCresPatrol'
 */
function cloneAssembly(templateIds, ids) {
  const remap = new Map(templateIds.map((id, index) => [id, ids[index]]));
  return templateIds.map((id) => {
    const object = structuredClone(originals.get(id));
    object.id = remap.get(id);
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
    return object;
  });
}
const [patrol] = cloneAssembly(['OBDot.116'], ['OBCresPatrol']);
patrol.position = [-74, -4, 0];
patrol.label = 'Opening patrol';
level.objects.push(patrol);

const portalTemplates = [
  'OBPortal1.004',
  'OBPortal1.005',
  'OBPortalOut2.003',
  'OBPortal2.004',
  'OBPortal2.005',
  'OBPortalOut1.003',
];
const portals = cloneAssembly(
  portalTemplates,
  portalTemplates.map((id, index) => 'OBCresPortal' + index),
);
portals[0].position = [-28, 66, 0];
portals[0].rotation = [0, 0, Math.PI];
portals[3].position = [72, -68, 0];
portals[3].rotation = [0, 0, 0];
level.objects.push(...portals);

const [platform, turret] = cloneAssembly(
  ['OBLaserPlatform.011', 'OBStill Turret.002'],
  ['OBCresBase', 'OBCresTurret'],
);
const platformHeight = -2.1,
  firingFrequency = 105;
platform.position = [16, 0, platformHeight];
platform.rotation = [0, 0, Math.PI / 2];
turret.logic.sensors.find((sensor) => sensor.name === 'sensor2').settings.freq =
  firingFrequency;
level.objects.push(platform, turret);

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
  'web/reforged/levels/Crescendo.json',
  JSON.stringify(level, null, 2) + '\n',
);
console.log(
  'Crescendo:',
  segments.length,
  'walls, 1 patrol, 1 portal pair, 1 turret;',
  level.objects.length,
  'objects. IDs, sources, links, references, parents, and bounds validated.',
);
