/** Rebuild a seven-chamber honeycomb using original walls and ball logic. */
import {readFile, writeFile} from 'node:fs/promises';
import {wallGeometry} from '../../web/reforged/geometry.js';

const level = JSON.parse(
  await readFile('web/reforged/levels/LvGen-B.json', 'utf8'),
);
const library = JSON.parse(await readFile('web/reforged/library.json', 'utf8'));
const ballTemplate = structuredClone(
  level.objects.find((object) => object.id === 'OBDot.116'),
);
level.name = 'Honeycomb';
level.description =
  'Explore seven hexagonal rooms. The outside loop offers two routes to gold; the middle room connects the branches. Read the slow bouncing balls, wait in a roomy corner, then slip through. WASD or arrows; Backspace restarts.';
level.grid = {spacing: 3, subdivisions: 1, snap: true, origin: [0, 0]};
for (const object of level.objects)
  object.active =
    /^OB(?:Lamp|Arial|MainCam|PanCam|PanPivot|Bounds|SpawnPoint|Finish)/.test(
      object.id,
    );

const radius = 30,
  halfHeight = (radius * Math.sqrt(3)) / 2;
const wallWidth = 4,
  doorway = 18,
  playerRadius = 3;
const centers = [
  [0, 0],
  [0, -2 * halfHeight],
  [-1.5 * radius, -halfHeight],
  [-1.5 * radius, halfHeight],
  [0, 2 * halfHeight],
  [1.5 * radius, halfHeight],
  [1.5 * radius, -halfHeight],
];
level.objects.find((object) => object.id === 'OBSpawnPoint.004').position = [
  ...centers[1],
  0,
];
level.objects.find((object) => object.id === 'OBFinish.002').position = [
  ...centers[4],
  0,
];
// Outer cycle: bottom, southwest, northwest, top, northeast, southeast.
// The center links southwest to northeast, letting players switch branches.
const connections = [
  [1, 2],
  [2, 3],
  [3, 4],
  [4, 5],
  [5, 6],
  [6, 1],
  [2, 0],
  [0, 5],
];
const openEdges = new Set(
  connections.map((pair) => pair.toSorted((a, b) => a - b).join(':')),
);
const edges = new Map();
for (const [cell, [cx, cy]] of centers.entries()) {
  const vertices = Array.from({length: 6}, (_, index) => [
    cx + radius * Math.cos((index * Math.PI) / 3),
    cy + radius * Math.sin((index * Math.PI) / 3),
  ]);
  for (let side = 0; side < vertices.length; side++) {
    const start = vertices[side],
      end = vertices[(side + 1) % vertices.length];
    const key = [start, end]
      .map((point) => point.map((value) => Math.round(value * 1e6)).join(','))
      .sort()
      .join(':');
    if (edges.has(key)) edges.get(key).cells.push(cell);
    else edges.set(key, {start, end, cells: [cell]});
  }
}
const segments = [];
for (const {start, end, cells} of edges.values()) {
  if (!openEdges.has(cells.toSorted((a, b) => a - b).join(':')))
    segments.push([start, end]);
  else {
    const fraction = (radius - doorway) / (2 * radius);
    const inset = start.map(
      (value, axis) => value + fraction * (end[axis] - value),
    );
    const outset = end.map(
      (value, axis) => value + fraction * (start[axis] - value),
    );
    segments.push([start, inset], [outset, end]);
  }
}
const wallSource = 'OBGrid.014',
  wallMesh = library.meshes[library.objects[wallSource].data];
for (const [index, [start, end]] of segments.entries())
  level.objects.push({
    id: 'OBHoneyWall' + index,
    source: wallSource,
    label: 'Honeycomb wall ' + (index + 1),
    position: [0, 0, 0],
    rotation: [0, 0, 0],
    scale: [1, 1, 1],
    parent: null,
    active: true,
    logic: {sensors: [], controllers: [], actuators: []},
    geometry: wallGeometry(wallMesh, start, end, wallWidth),
  });

// Slow horizontal patrols leave generous room above and below their tracks.
const patrols = [
  {position: [-8, 0, 0], speed: 0.28, label: 'Center crossing patrol'},
  {position: [-49, 20, 0], speed: 0.24, label: 'West loop patrol'},
];
// Native conversion divides drot by BLENDER_HACK_DTIME before degrees → radians.
const nativeScale = 0.02,
  reversalDegrees = 180;
for (const [index, patrol] of patrols.entries()) {
  const ball = structuredClone(ballTemplate);
  Object.assign(ball, {
    id: 'OBHoneyBall' + index,
    active: true,
    parent: null,
    position: patrol.position,
    rotation: [0, 0, 0],
    label: patrol.label,
  });
  ball.logic.actuators.find((actuator) => actuator.name === 'A').payload.dloc =
    [-patrol.speed, 0, 0];
  ball.logic.actuators.find((actuator) => actuator.name === 'B').payload.drot =
    [0, 0, nativeScale * reversalDegrees];
  for (const bricks of Object.values(ball.logic))
    for (const brick of bricks) {
      if (brick.links)
        brick.links = brick.links.map((link) =>
          link.replace(ballTemplate.id + '/', ball.id + '/'),
        );
      for (const key of Object.keys(brick.references || {}))
        if (brick.references[key] === ballTemplate.id)
          brick.references[key] = ball.id;
    }
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
  for (const vertex of object.geometry?.vertices || [])
    if (
      vertex
        .slice(0, 2)
        .some((value) => !Number.isFinite(value) || Math.abs(value) > 98)
    )
      throw Error('Wall exceeds arena: ' + object.id);
}

/** Distance from a point to a segment in XY space.
 * >>> distanceToSegment([3,4], [0,0], [6,0])
 * 4
 */
function distanceToSegment(point, start, end) {
  const delta = end.map((value, axis) => value - start[axis]);
  const fraction = Math.max(
    0,
    Math.min(
      1,
      delta.reduce(
        (sum, value, axis) => sum + value * (point[axis] - start[axis]),
        0,
      ) / delta.reduce((sum, value) => sum + value * value, 0),
    ),
  );
  return Math.hypot(
    ...point.map((value, axis) => value - start[axis] - fraction * delta[axis]),
  );
}
// Conservatively enlarge endpoint square caps by their diagonal radius.
const clearance = playerRadius + wallWidth / Math.sqrt(2);
for (const [from, to] of connections) {
  for (let step = 0; step <= 100; step++) {
    const point = centers[from].map(
      (value, axis) => value + (step / 100) * (centers[to][axis] - value),
    );
    if (
      segments.some(
        ([start, end]) => distanceToSegment(point, start, end) < clearance,
      )
    )
      throw Error('Player route blocked between cells ' + from + ' and ' + to);
  }
}
for (const index of [1, 4])
  if (
    segments.some(
      ([start, end]) =>
        distanceToSegment(centers[index], start, end) < clearance,
    )
  )
    throw Error('Spawn/finish wall overlap');
await writeFile(
  'web/reforged/levels/Honeycomb.json',
  JSON.stringify(level, null, 2) + '\n',
);
console.log(
  'Honeycomb:',
  segments.length,
  'walls;',
  patrols.length,
  'balls;',
  level.objects.length,
  'objects; 8 radius-3 connections, bounds, IDs, links, references and parents verified.',
);
