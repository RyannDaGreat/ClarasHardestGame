import {readFile,writeFile} from 'node:fs/promises';
import {wallGeometry} from '../../web/reforged/geometry.js';
const level=JSON.parse(await readFile('web/reforged/levels/LvGen-B.json','utf8'));
const library=JSON.parse(await readFile('web/reforged/library.json','utf8'));
const original=new Map(level.objects.map(o=>[o.id,structuredClone(o)]));
level.name='Parallax';
level.description='Four sealed chambers, three crossed portal pairs. Read the exit arrows, ride the push pads, and thread the laser corners to reach gold. WASD moves; Backspace restarts.';
level.grid={spacing:6,subdivisions:1,snap:true,origin:[0,0]};
for(const object of level.objects)object.active=/^OB(?:Lamp|Arial|MainCam|PanCam|PanPivot|Bounds|SpawnPoint|Finish)/.test(object.id);
level.objects.find(o=>o.id==='OBSpawnPoint.004').position=[-78,-78,0];
level.objects.find(o=>o.id==='OBFinish.002').position=[24,-24,0];
const source='OBGrid.014',mesh=library.meshes[library.objects[source].data];
const segments=[
 [[-96,-96],[96,-96]],[[96,-96],[96,96]],[[96,96],[-96,96]],[[-96,96],[-96,-96]],
 [[0,-96],[0,96]],[[-96,0],[96,0]],
 [[-96,-48],[-42,-48]],[[48,0],[48,54]],[[-96,48],[-42,48]],[[48,-54],[48,0]],
];
for(const [index,[start,end]]of segments.entries())level.objects.push({
 id:'OBParallaxWall'+index,source,position:[0,0,0],rotation:[0,0,0],scale:[1,1,1],parent:null,active:true,
 logic:{sensors:[],controllers:[],actuators:[]},geometry:wallGeometry(mesh,start,end,6),
});
const portalIds=['OBPortal1.004','OBPortal1.005','OBPortalOut2.003','OBPortal2.004','OBPortal2.005','OBPortalOut1.003'];
const pairs=[
 {name:'A',entrance:[-24,-24],exit:[72,72],entranceRotation:Math.PI,exitRotation:Math.PI/2},
 {name:'B',entrance:[24,24],exit:[-72,72],entranceRotation:0,exitRotation:Math.PI},
 {name:'C',entrance:[-24,24],exit:[72,-72],entranceRotation:0,exitRotation:Math.PI/2},
];
for(const pair of pairs){
 const remap=new Map(portalIds.map(id=>[id,'OBPx'+pair.name+id.slice(2).replace('.','_')]));
 for(const id of portalIds){
  const object=structuredClone(original.get(id));object.id=remap.get(id);object.active=true;
  object.parent=remap.get(object.parent)||null;
  for(const kind of ['sensors','controllers','actuators'])for(const brick of object.logic[kind]){
   if(brick.links)brick.links=brick.links.map(path=>{const [target,...rest]=path.split('/');return [remap.get(target)||target,...rest].join('/');});
   for(const key in brick.references)brick.references[key]=remap.get(brick.references[key])||brick.references[key];
  }
  if(id==='OBPortal1.004'){object.position=[...pair.entrance,0];object.rotation=[0,0,pair.entranceRotation];}
  if(id==='OBPortal2.004'){object.position=[...pair.exit,0];object.rotation=[0,0,pair.exitRotation];}
  level.objects.push(object);
 }
}
const pads=[['OBUp Push.002',[-24,-60]],['OBDown Push.008',[24,48]],['OBDown Push.006',[-48,72]],['OBUp Push.002',[24,-48]]];
for(const [index,[id,position]]of pads.entries()){
 const object=structuredClone(original.get(id)),newId='OBParallaxPush'+index;
 object.id=newId;object.active=true;object.position=[...position,0];object.scale=[.6,.6,.6];
 for(const kind of ['sensors','controllers'])for(const brick of object.logic[kind])brick.links=brick.links.map(path=>path.replace(id+'/',newId+'/'));
 level.objects.push(object);
}
await writeFile('web/reforged/levels/Parallax.json',JSON.stringify(level,null,2)+'\n');
console.log('Authored Parallax:',level.objects.length,'instances; three original portal pairs, four original push pads, ten laser wall segments.');
