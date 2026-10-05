import {readFile,writeFile} from 'node:fs/promises';
import {wallGeometry} from '../../web/reforged/geometry.js';

const level=JSON.parse(await readFile('web/reforged/levels/LvGen-B.json','utf8'));
const library=JSON.parse(await readFile('web/reforged/library.json','utf8'));
const template=id=>structuredClone(level.objects.find(object=>object.id===id));
level.name='Crossfire';
level.description='Six original laser turrets. Cross three firing lanes, using the sheltered bays between them. Reach the golden finish; WASD or arrow keys.';
level.grid={spacing:8,subdivisions:2,snap:true,origin:[0,0]};
for(const object of level.objects)object.active=/^OB(?:Lamp|Arial|MainCam|PanCam|PanPivot|Bounds|SpawnPoint|Finish)/.test(object.id);
level.objects.find(object=>object.id==='OBSpawnPoint.004').position=[-82,0,0];
level.objects.find(object=>object.id==='OBFinish.002').position=[82,0,0];

// Opposed pairs use original projectile/collision bricks with a readable firing cadence.
const firingColumns=[-48,0,48],turretDistance=40,platformHeight=-2.1;
const firingFrequency=100;
for(const [column,x]of firingColumns.entries())for(const side of [-1,1]){
  const suffix=column+(side>0?'N':'S');
  const platform=template('OBLaserPlatform.011'),turret=template('OBStill Turret.002');
  platform.id='OBCrossBase'+suffix;platform.parent=null;platform.active=true;
  platform.position=[x,side*turretDistance,platformHeight];platform.rotation=[0,0,side>0?0:Math.PI];
  turret.id='OBCrossTurret'+suffix;turret.parent=platform.id;turret.active=true;
  turret.logic.sensors.find(sensor=>sensor.name==='sensor2').settings.freq=firingFrequency;
  for(const bricks of Object.values(turret.logic))for(const brick of bricks){
    if(brick.links)brick.links=brick.links.map(link=>link.replace('OBStill Turret.002/',turret.id+'/'));
  }
  level.objects.push(platform,turret);
}

const source='OBGrid.014',mesh=library.meshes[library.objects[source].data];
const boundary=98,corridor=20,laneHalfWidth=10,wallWidth=4;
const chamberEnd=64;
const segments=[
 [[-boundary,-boundary],[boundary,-boundary]],[[boundary,-boundary],[boundary,boundary]],
 [[boundary,boundary],[-boundary,boundary]],[[-boundary,boundary],[-boundary,-boundary]],
];
// Openings align with barrels; chrome-ended cover walls form clear waiting bays.
const solidSpans=[[-boundary,firingColumns[0]-laneHalfWidth],
 [firingColumns[0]+laneHalfWidth,firingColumns[1]-laneHalfWidth],
 [firingColumns[1]+laneHalfWidth,firingColumns[2]-laneHalfWidth],
 [firingColumns[2]+laneHalfWidth,boundary]];
for(const y of [-corridor,corridor])for(const [left,right]of solidSpans)segments.push([[left,y],[right,y]]);
for(const x of firingColumns)for(const side of [-1,1]){
 const near=side*corridor,far=side*chamberEnd;
 segments.push([[x-laneHalfWidth,near],[x-laneHalfWidth,far]],[[x+laneHalfWidth,near],[x+laneHalfWidth,far]],[[x-laneHalfWidth,far],[x+laneHalfWidth,far]]);
}
for(const [index,[start,end]]of segments.entries())level.objects.push({
 id:'OBCrossWall'+index,source,position:[0,0,0],rotation:[0,0,0],scale:[1,1,1],parent:null,active:true,
 logic:{sensors:[],controllers:[],actuators:[]},geometry:wallGeometry(mesh,start,end,wallWidth),
});
const objects=new Map(level.objects.map(object=>[object.id,object]));
for(const object of level.objects){
 if(object.parent&&!objects.has(object.parent))throw Error('Missing parent: '+object.id);
 for(const bricks of Object.values(object.logic))for(const brick of bricks){
  for(const link of brick.links||[]){const[id,kind,name]=link.split('/');if(!objects.get(id)?.logic[kind]?.some(target=>target.name===name))throw Error('Broken link: '+link);}
  for(const reference of Object.values(brick.references||{}))if(reference?.startsWith('OB')&&!objects.has(reference))throw Error('Missing object reference: '+reference);
 }
}
await writeFile('web/reforged/levels/Crossfire.json',JSON.stringify(level,null,2)+'\n');
console.log('Authored Crossfire:',level.objects.length,'instances;',firingColumns.length*2,'original turrets;',segments.length,'wall segments. All links resolve.');
