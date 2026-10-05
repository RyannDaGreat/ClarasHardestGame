/** Build Pinwheel using original collision, IPO animation, and player physics. */
import {readFile, writeFile} from 'node:fs/promises';
import {wallGeometry} from '../../web/reforged/geometry.js';

const level = JSON.parse(
  await readFile('web/reforged/levels/LvGen-B.json', 'utf8'),
);
const library = JSON.parse(await readFile('web/reforged/library.json', 'utf8'));
const originals = new Map(
  level.objects.map((object) => [object.id, structuredClone(object)]),
);
level.name = 'Pinwheel';
level.description =
  'A turning playground: choose either side of the big pinwheel, duck through the wide inner lanes, or explore the little side rotors. Gold waits across the arena. WASD moves; Backspace restarts.';
level.grid = {spacing: 4, subdivisions: 1, snap: true, origin: [0, 0]};
for (const object of level.objects)
  object.active =
    /^OB(?:Lamp|Arial|MainCam|PanCam|PanPivot|Bounds|SpawnPoint|Finish)/.test(
      object.id,
    );
level.objects.find((object) => object.id === 'OBSpawnPoint.004').position = [
  0, -76, 0,
];
level.objects.find((object) => object.id === 'OBFinish.002').position = [
  0, 72, 0,
];

/** Append a clone to level.objects, remap its bricks and return the new object.
 * >>> cloneComponent('OBDot.116', 'OBExample').id
 * 'OBExample'
 */
function cloneComponent(source, id, parent = null) {
  const object = structuredClone(originals.get(source));
  if (!object) throw Error('Unknown original component: ' + source);
  object.id = id;
  object.parent = parent;
  object.active = true;
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

const wallSource = 'OBGrid.014';
const wallMesh = library.meshes[library.objects[wallSource].data];
const wallWidth = 4;
const rim = [
  [-58, -92],
  [58, -92],
  [92, -58],
  [92, 58],
  [58, 92],
  [-58, 92],
  [-92, 58],
  [-92, -58],
];
const segments = rim.map((start, index) => [
  start,
  rim[(index + 1) % rim.length],
]);
// Diagonal fins suggest a pinwheel without forcing a single corridor.
for (const x of [-1, 1])
  for (const y of [-1, 1])
    segments.push([
      [38 * x, 38 * y],
      [66 * x, 66 * y],
    ]);
for (const [index, [start, end]] of segments.entries())
  level.objects.push({
    id: 'OBPwWall' + index,
    source: wallSource,
    label: 'Pinwheel boundary ' + index,
    position: [0, 0, 0],
    rotation: [0, 0, 0],
    scale: [1, 1, 1],
    parent: null,
    active: true,
    logic: {sensors: [], controllers: [], actuators: []},
    geometry: wallGeometry(wallMesh, start, end, wallWidth),
  });

const rodSource = 'OBCylinder.002';
const rodMesh = library.meshes[library.objects[rodSource].data];
const sourceHalfLength = Math.max(
  ...rodMesh.vertices.map((vertex) => Math.abs(vertex[2])),
);
const rodThicknessScale = 5;
const rotors = [
  {name: 'Hub', position: [0, 0, 0], radius: 30, blades: 2, reverse: false},
  {name: 'West', position: [-66, 0, 0], radius: 14, blades: 1, reverse: true},
  {name: 'East', position: [66, 0, 0], radius: 14, blades: 1, reverse: true},
];
for (const rotor of rotors) {
  const pivot = cloneComponent('OBKiller.002', 'OBPw' + rotor.name);
  pivot.position = rotor.position;
  pivot.rotation = [0, 0, 0];
  for (let index = 0; index < rotor.blades; index++) {
    const blade = cloneComponent(
      rodSource,
      'OBPw' + rotor.name + 'Blade' + index,
      pivot.id,
    );
    const angle = (index * Math.PI) / 2;
    blade.geometry = {
      vertices: rodMesh.vertices.map(([x, y, z]) => {
        const along = (z / sourceHalfLength) * rotor.radius,
          across = x * rodThicknessScale;
        return [
          along * Math.cos(angle) - across * Math.sin(angle),
          along * Math.sin(angle) + across * Math.cos(angle),
          y * rodThicknessScale,
        ];
      }),
      faces: rodMesh.faces.map((face, templateFace) => ({
        vertices: face.vertices,
        templateFace,
      })),
    };
    blade.animation = structuredClone(library.objects[rodSource].animation);
    // Full original rotation reaches frame 410; the source actuator stops early.
    blade.logic.actuators[0].payload.end = 410;
    if (rotor.reverse)
      for (const curve of blade.animation.curves)
        if (curve.channel === 9)
          for (const point of curve.points)
            for (const offset of [1, 4, 7]) point[offset] *= -1;
  }
}

const objects = new Map(level.objects.map((object) => [object.id, object]));
if (objects.size !== level.objects.length) throw Error('Duplicate object IDs');
for (const object of level.objects) {
  if (Buffer.byteLength(object.id) > 23)
    throw Error('ID exceeds engine limit: ' + object.id);
  if (!library.objects[object.source])
    throw Error('Missing source: ' + object.source);
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
  if (object.geometry)
    for (const vertex of object.geometry.vertices)
      if (
        vertex
          .slice(0, 2)
          .some((value) => !Number.isFinite(value) || Math.abs(value) > 98)
      )
        throw Error('Geometry outside map: ' + object.id);
}
await writeFile(
  'web/reforged/levels/Pinwheel.json',
  JSON.stringify(level, null, 2) + '\n',
);
console.log(
  'Authored Pinwheel:',
  level.objects.length,
  'objects; 12 walls, 3 rotors, 4 animated blades; IDs, links, references and geometry validated.',
);
