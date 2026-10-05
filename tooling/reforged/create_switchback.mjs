/** Rebuild the original-engine Switchback course. Run from repository root. */
import {readFile, writeFile} from 'node:fs/promises';
import {wallGeometry} from '../../web/reforged/geometry.js';

const level = JSON.parse(await readFile('web/reforged/levels/LvGen-B.json', 'utf8'));
const library = JSON.parse(await readFile('web/reforged/library.json', 'utf8'));
const wallSource = 'OBGrid.014';
const wallMesh = library.meshes[library.objects[wallSource].data];
const wallWidth = 200 / 31;
level.name = 'Switchback';
level.description = 'Four passes through a laser labyrinth. Weave around the teeth, watch the patrolling lights, and brake before each hairpin. Original Blender movement and hazards.';
level.grid = {...level.grid, spacing: 4, subdivisions: 1};
for (const object of level.objects) object.active = /^OB(?:Lamp|Arial|MainCam|PanCam|PanPivot|Bounds|SpawnPoint|Finish)/.test(object.id);
level.objects.find(object => object.id === 'OBSpawnPoint.004').position = [-84,-80,0];
level.objects.find(object => object.id === 'OBFinish.002').position = [-84,80,0];

// Four 48-unit lanes; a 28-unit pocket joins consecutive runs at opposite ends.
const segments = [
  [[-104,-104],[104,-104]], [[104,-104],[104,104]],
  [[104,104],[-104,104]], [[-104,104],[-104,-104]],
  [[-104,-52],[64,-52]], [[104,0],[-64,0]], [[-104,52],[64,52]],
];
for (const center of [-78,-26,26,78]) {
  segments.push([[-32,center-26],[-32,center]], [[32,center+26],[32,center]]);
}
for (const [index,[start,end]] of segments.entries()) level.objects.push({
  id:'OBSwitchbackWall'+index, source:wallSource, label:'Laser wall '+(index+1),
  position:[0,0,0], rotation:[0,0,0], scale:[1,1,1], parent:null, active:true,
  logic:{sensors:[],controllers:[],actuators:[]}, geometry:wallGeometry(wallMesh,start,end,wallWidth),
});

// Preserve the original 90-degree Wall-ray patrol logic; only place instances.
const dot = level.objects.find(object => object.id === 'OBDot.116');
for (const [index,position] of [[0,-26,0],[0,26,0],[0,78,0]].entries()) {
  const patrol = structuredClone(dot);
  patrol.id = 'OBSwitchbackPatrol'+index;
  patrol.label = 'Patrol '+(index+1);
  patrol.position = position;
  patrol.active = true;
  for (const bricks of Object.values(patrol.logic)) for (const brick of bricks) {
    if (brick.links) brick.links = brick.links.map(link => link.replace(dot.id+'/',patrol.id+'/'));
  }
  level.objects.push(patrol);
}
await writeFile('web/reforged/levels/Switchback.json', JSON.stringify(level,null,2)+'\n');
console.log('Switchback:', segments.length,'walls, 3 original patrols,',level.objects.length,'objects');
