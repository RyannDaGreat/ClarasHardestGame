/** Build Switchyard from original switch/field bricks. Run from repository root. */
import {readFile, writeFile} from 'node:fs/promises';
import {wallGeometry} from '../../web/reforged/geometry.js';

const level = JSON.parse(
  await readFile('web/reforged/levels/LvGen-B.json', 'utf8'),
);
const late = JSON.parse(
  await readFile('web/reforged/levels/Lv10.json', 'utf8'),
);
const library = JSON.parse(await readFile('web/reforged/library.json', 'utf8'));
const templates = new Map(
  level.objects.map((object) => [object.id, structuredClone(object)]),
);
const switchTemplate = late.objects.find(
  (object) => object.id === 'OBPlane.012',
);
level.name = 'Switchyard';
level.description =
  'Touch the three glowing pads to shut down the spark gates. The first pad teaches the trick; collect the left and right pads in either order. Gates stay open. Let the last sparks clear, then take the central exit. WASD or arrows; Backspace restarts.';
level.grid = {spacing: 4, subdivisions: 1, snap: true, origin: [0, 0]};
for (const object of level.objects)
  object.active =
    /^OB(?:Lamp|Arial|MainCam|PanCam|PanPivot|Bounds|SpawnPoint|Finish)/.test(
      object.id,
    );
level.objects.find((object) => object.id === 'OBSpawnPoint.004').position = [
  0, -80, 0,
];
level.objects.find((object) => object.id === 'OBFinish.002').position = [
  0, 82, 0,
];

const boundary = 94,
  opening = 28,
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
    [-boundary, -40],
    [-opening, -40],
  ],
  [
    [opening, -40],
    [boundary, -40],
  ],
  [
    [-boundary, 30],
    [-opening, 30],
  ],
  [
    [opening, 30],
    [boundary, 30],
  ],
  [
    [-opening, 30],
    [-opening, boundary],
  ],
  [
    [opening, 30],
    [opening, boundary],
  ],
  // The pair of islands splits the approach into broad left/right circuits.
  [
    [-22, -12],
    [-22, 8],
  ],
  [
    [22, -12],
    [22, 8],
  ],
];
const source = 'OBGrid.014',
  mesh = library.meshes[library.objects[source].data];
for (const [index, [start, end]] of segments.entries())
  level.objects.push({
    id: 'OBSYWall' + index,
    source,
    label: 'Switchyard wall ' + (index + 1),
    position: [0, 0, 0],
    rotation: [0, 0, 0],
    scale: [1, 1, 1],
    parent: null,
    active: true,
    logic: {sensors: [], controllers: [], actuators: []},
    geometry: wallGeometry(mesh, start, end, wallWidth),
  });

const fieldIds = [
  'OBForcefield.003',
  'OBFRC Projector.005',
  'OBCube.053',
  'OBCube.054',
  'OBCube.055',
];
const gates = [
  {key: 'A', y: -40, pad: [-58, -64], label: 'First pad: entry gate'},
  {key: 'B', y: 30, pad: [-62, 0], label: 'Left pad: lower exit gate'},
  {key: 'C', y: 62, pad: [62, 0], label: 'Right pad: upper exit gate'},
];
for (const gate of gates) {
  const remap = new Map(
    fieldIds.map((id, index) => [id, 'OBSY' + gate.key + 'Field' + index]),
  );
  for (const id of fieldIds) {
    const object = structuredClone(templates.get(id));
    object.id = remap.get(id);
    object.label = 'Gate ' + gate.key;
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
    if (id === fieldIds[0]) {
      object.position = [0, gate.y, -0.1257534772157669];
      object.rotation = [0, 0, 0];
    }
    level.objects.push(object);
  }
  const pad = structuredClone(switchTemplate);
  const oldId = pad.id;
  pad.id = 'OBSY' + gate.key + 'Pad';
  pad.label = gate.label;
  pad.active = true;
  // This exact scale and height already has native collision evidence.
  const padScale = 0.15;
  pad.position = [...gate.pad, -1.4284655570983887];
  pad.scale = pad.scale.map((value) => value * padScale);
  for (const bricks of Object.values(pad.logic))
    for (const brick of bricks)
      if (brick.links)
        brick.links = brick.links
          .filter((link) => link.startsWith(oldId + '/'))
          .map((link) => link.replace(oldId + '/', pad.id + '/'));
  pad.logic.controllers.find((brick) => brick.name === 'Activator').links = [
    remap.get('OBCube.054') + '/actuators/act1',
    remap.get('OBFRC Projector.005') + '/actuators/act2',
  ];
  level.objects.push(pad);
}

// Replacement meshes live in the original Blender datablocks, not the palette mesh export.
const originalMeshReferences = new Set(
  [...templates.values(), ...late.objects].flatMap((object) =>
    Object.values(object.logic).flatMap((bricks) =>
      bricks.flatMap((brick) =>
        Object.values(brick.references || {}).filter((reference) =>
          reference?.startsWith('ME'),
        ),
      ),
    ),
  ),
);
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
      for (const reference of Object.values(brick.references || {})) {
        if (reference?.startsWith('OB') && !objects.has(reference))
          throw Error('Missing reference: ' + reference);
        if (
          reference?.startsWith('ME') &&
          !library.meshes[reference] &&
          !originalMeshReferences.has(reference)
        )
          throw Error('Missing mesh: ' + reference);
      }
    }
  for (const point of object.geometry?.vertices || [])
    if (Math.abs(point[0]) > 98 || Math.abs(point[1]) > 98)
      throw Error('Geometry exceeds arena: ' + object.id);
}
// Every switch only opens its gate. No authored link can activate field act2 (close).
for (const gate of gates) {
  const pad = objects.get('OBSY' + gate.key + 'Pad');
  const links = pad.logic.controllers.find(
    (brick) => brick.name === 'Activator',
  ).links;
  if (!links.includes('OBSY' + gate.key + 'Field3/actuators/act1'))
    throw Error('Gate missing permanent shutdown');
}
await writeFile(
  'web/reforged/levels/Switchyard.json',
  JSON.stringify(level, null, 2) + '\n',
);
console.log(
  'Switchyard:',
  segments.length,
  'walls, 3 persistent switch/field pairs;',
  level.objects.length,
  'objects. IDs, templates, links, references, parents and wall bounds validated.',
);
