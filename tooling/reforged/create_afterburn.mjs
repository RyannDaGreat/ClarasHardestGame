/** Rebuild Afterburn's sprint circuit from untouched original component templates. */
import {readFile, writeFile} from 'node:fs/promises';
import {wallGeometry} from '../../web/reforged/geometry.js';

const level = JSON.parse(
  await readFile('web/reforged/levels/LvGen-B.json', 'utf8'),
);
const library = JSON.parse(await readFile('web/reforged/library.json', 'utf8'));
const originals = new Map(
  level.objects.map((object) => [object.id, structuredClone(object)]),
);
level.name = 'Afterburn';
level.description =
  'Three sprint straights, wide hairpins, and a tight central chicane. Try the optional blue arrows or ice lanes; brown runoffs give you room to brake. Take any line to gold.';
level.grid = {spacing: 4, subdivisions: 1, snap: true, origin: [0, 0]};
for (const object of level.objects)
  object.active =
    /^OB(?:Lamp|Arial|MainCam|PanCam|PanPivot|Bounds|SpawnPoint|Finish)/.test(
      object.id,
    );
level.objects.find((object) => object.id === 'OBSpawnPoint.004').position = [
  -80, -64, 0,
];
level.objects.find((object) => object.id === 'OBFinish.002').position = [
  78, 64, 0,
];

/** Append a clone to level.objects, retaining forces and resolving self-links.
 * >>> place('OBPlane.022', 'OBExample', [0,0,0], [2,2,1], 'Ice').scale
 * [2,2,1]
 */
function place(source, id, position, scale, label) {
  if (!originals.has(source)) throw Error('Missing original: ' + source);
  const object = structuredClone(originals.get(source));
  Object.assign(object, {id, position, scale, label, active: true});
  for (const bricks of Object.values(object.logic))
    for (const brick of bricks) {
      if (brick.links)
        brick.links = brick.links.map((link) =>
          link.replace(source + '/', id + '/'),
        );
      for (const key of Object.keys(brick.references || {}))
        if (brick.references[key] === source) brick.references[key] = id;
    }
  level.objects.push(object);
  return object;
}

// Ice and push occupy separate lanes: stacking them causes extreme original-engine drift.
const floors = [
  ['Ice', -22, -80, 72, 12],
  ['Ice', -22, 80, 72, 12],
  ['Muck', 62, -64, 48, 44],
  ['Muck', -62, 0, 48, 36],
  ['Muck', 62, 64, 48, 44],
];
for (const [index, [kind, x, y, width, height]] of floors.entries()) {
  const source = kind === 'Ice' ? 'OBPlane.022' : 'OBPlane.023';
  const template = originals.get(source);
  const floor = place(
    source,
    'OBAfterFloor' + index,
    [x, y, template.position[2]],
    [width / 10, height / 10, template.scale[2]],
    kind + ' / ' + (index + 1),
  );
  floor.rotation = [0, 0, 0];
}
for (const [index, y] of [-64, 64].entries())
  place(
    'OBDown Push.006',
    'OBAfterPush' + index,
    [-62, y, 0],
    [0.5, 0.5, 0.5],
    'Optional east sprint',
  );

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
    [-94, -28],
    [-18, -28],
  ],
  [
    [2, -28],
    [48, -28],
  ],
  [
    [-48, 28],
    [-2, 28],
  ],
  [
    [18, 28],
    [94, 28],
  ],
];
const source = 'OBGrid.014',
  mesh = library.meshes[library.objects[source].data];
for (const [index, [start, end]] of segments.entries())
  level.objects.push({
    id: 'OBAfterWall' + index,
    source,
    label: 'Circuit rail ' + (index + 1),
    position: [0, 0, 0],
    rotation: [0, 0, 0],
    scale: [1, 1, 1],
    parent: null,
    active: true,
    logic: {sensors: [], controllers: [], actuators: []},
    geometry: wallGeometry(mesh, start, end, wallWidth),
  });

const objects = new Map(level.objects.map((object) => [object.id, object]));
if (objects.size !== level.objects.length) throw Error('Duplicate object IDs');
for (const object of level.objects) {
  if (Buffer.byteLength(object.id) > 23)
    throw Error('ID exceeds engine limit: ' + object.id);
  if (!library.objects[object.source])
    throw Error('Missing template: ' + object.source);
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
  'web/reforged/levels/Afterburn.json',
  JSON.stringify(level, null, 2) + '\n',
);
console.log(
  'Afterburn:',
  segments.length,
  'walls; 2 optional pads;',
  floors.length,
  'surfaces;',
  level.objects.length,
  'objects. IDs/templates/links/parents/references/wall bounds passed.',
);
