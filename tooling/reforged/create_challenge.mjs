import {readFile,writeFile} from 'node:fs/promises';
import {wallGeometry} from '../../web/reforged/geometry.js';
const level=JSON.parse(await readFile('web/reforged/levels/LvGen-B.json','utf8'));
const library=JSON.parse(await readFile('web/reforged/library.json','utf8'));
level.name='Gauntlet';
level.description='Three chambers. Follow the winding passage from the red start to the golden finish.';
for(const o of level.objects)o.active=/^OB(?:Lamp|Arial|MainCam|PanCam|PanPivot|Bounds|SpawnPoint|Finish)/.test(o.id);
level.objects.find(o=>o.id==='OBSpawnPoint.004').position=[-78,-78,0];
level.objects.find(o=>o.id==='OBFinish.002').position=[78,78,0];
const source='OBGrid.014',mesh=library.meshes[library.objects[source].data];
const segments=[
 [[-98,-98],[98,-98]],[[98,-98],[98,98]],[[98,98],[-98,98]],[[-98,98],[-98,-98]],
 [[-35,-98],[-35,55]],[[35,98],[35,-55]],
];
for(const [i,[start,end]]of segments.entries())level.objects.push({
 id:'OBGauntletWall'+i,source,position:[0,0,0],rotation:[0,0,0],scale:[1,1,1],parent:null,active:true,
 logic:{sensors:[],controllers:[],actuators:[]},geometry:wallGeometry(mesh,start,end,200/31),
});
await writeFile('web/reforged/levels/Gauntlet.json',JSON.stringify(level,null,2)+'\n');
console.log('Authored Gauntlet:',level.objects.length,'instances,',segments.length,'new wall meshes');
