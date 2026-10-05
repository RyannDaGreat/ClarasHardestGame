/** Rebuild Ricochet with the original wall-ray ball logic. Run from repository root. */
import {readFile, writeFile} from 'node:fs/promises';
import {wallGeometry} from '../../web/reforged/geometry.js';

const level = JSON.parse(
  await readFile('web/reforged/levels/LvGen-B.json', 'utf8'),
);
const library = JSON.parse(await readFile('web/reforged/library.json', 'utf8'));
const ballTemplate = structuredClone(
  level.objects.find((object) => object.id === 'OBDot.116'),
);
level.name = 'Ricochet';
level.description =
  'Three bouncing-ball courts. Sprint through the middle openings, or take the longer side refuges. Pause between courts, read the rebounds, then go. The last court has a pair! WASD or arrows; Backspace restarts.';
level.grid = {spacing: 4, subdivisions: 1, snap: true, origin: [0, 0]};
for (const object of level.objects)
  object.active =
    /^OB(?:Lamp|Arial|MainCam|PanCam|PanPivot|Bounds|SpawnPoint|Finish)/.test(
      object.id,
    );
level.objects.find((object) => object.id === 'OBSpawnPoint.004').position = [
  0, -82, 0,
];
level.objects.find((object) => object.id === 'OBFinish.002').position = [
  0, 82, 0,
];

const boundary = 94,
  wallWidth = 4,
  endpointX = 60,
  postHalfHeight = 9;
const rows = [-58, 0, 58];
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
  // Central openings reward timing; side openings alternate to prevent a free edge run.
  [
    [-94, -32],
    [-82, -32],
  ],
  [
    [-58, -32],
    [-12, -32],
  ],
  [
    [12, -32],
    [94, -32],
  ],
  [
    [-94, 32],
    [-12, 32],
  ],
  [
    [12, 32],
    [58, 32],
  ],
  [
    [82, 32],
    [94, 32],
  ],
];
for (const y of rows)
  for (const side of [-1, 1])
    segments.push([
      [side * endpointX, y - postHalfHeight],
      [side * endpointX, y + postHalfHeight],
    ]);
const source = 'OBGrid.014',
  mesh = library.meshes[library.objects[source].data];
for (const [index, [start, end]] of segments.entries())
  level.objects.push({
    id: 'OBRicWall' + index,
    source,
    label: 'Ricochet wall ' + (index + 1),
    position: [0, 0, 0],
    rotation: [0, 0, 0],
    scale: [1, 1, 1],
    parent: null,
    active: true,
    logic: {sensors: [], controllers: [], actuators: []},
    geometry: wallGeometry(mesh, start, end, wallWidth),
  });

// Native conversion divides stored degrees by this legacy Blender time factor.
const blenderRotationTimeFactor = 0.02;
const reboundDegrees = 180;
const patrols = [
  {
    position: [-38, -58, 0],
    angle: Math.PI,
    speed: 0.48,
    label: 'Warm-up rebound',
  },
  {position: [30, 0, 0], angle: 0, speed: 0.58, label: 'Middle rebound'},
  {position: [-40, 58, 0], angle: Math.PI, speed: 0.5, label: 'Final pair A'},
  {position: [12, 58, 0], angle: Math.PI, speed: 0.5, label: 'Final pair B'},
];
for (const [index, specification] of patrols.entries()) {
  const ball = structuredClone(ballTemplate);
  ball.id = 'OBRicBall' + index;
  ball.label = specification.label;
  ball.active = true;
  ball.position = specification.position;
  ball.rotation = [0, 0, specification.angle];
  // Authoring actuator values preserves the engine's original motor/ray/turn graph.
  ball.logic.actuators.find((actuator) => actuator.name === 'A').payload.dloc =
    [-specification.speed, 0, 0];
  ball.logic.actuators.find((actuator) => actuator.name === 'B').payload.drot =
    [0, 0, reboundDegrees * blenderRotationTimeFactor];
  for (const bricks of Object.values(ball.logic))
    for (const brick of bricks)
      if (brick.links)
        brick.links = brick.links.map((link) =>
          link.replace(ballTemplate.id + '/', ball.id + '/'),
        );
  level.objects.push(ball);
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
  for (const point of object.geometry?.vertices || [])
    if (Math.abs(point[0]) > 98 || Math.abs(point[1]) > 98)
      throw Error('Geometry exceeds arena: ' + object.id);
}
await writeFile(
  'web/reforged/levels/Ricochet.json',
  JSON.stringify(level, null, 2) + '\n',
);
console.log(
  'Authored Ricochet:',
  segments.length,
  'walls,',
  patrols.length,
  'balls;',
  level.objects.length,
  'objects. IDs, templates, links, parents, references and authored geometry bounds validated.',
);
