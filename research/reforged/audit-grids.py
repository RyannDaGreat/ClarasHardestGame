"""Read original grid geometry and modifier stacks without opening/resaving Blender."""
import importlib.util
import json
from collections import Counter
from pathlib import Path
spec = importlib.util.spec_from_file_location('blendfile', 'tooling/asset-pack/vendor/blendfile.py')
b = importlib.util.module_from_spec(spec)
spec.loader.exec_module(b)
report = {}
with b.open_blend('assets/original/RyansHardestGame.blend') as f:
    for sc in f.find_blocks_from_code(b'SC'):
        name = sc.get((b'id', b'name'))
        if not name.startswith('SCLv'): continue
        rows=[]
        base=sc.get_pointer((b'base',b'first'))
        while base:
            o=base.get_pointer(b'object');oname=o.get((b'id',b'name'))
            if oname.startswith('OBGrid'):
                mesh=o.get_pointer(b'data');vertex=mesh.get_pointer(b'mvert');face=mesh.get_pointer(b'mface');edge=mesh.get_pointer(b'medge')
                verts=[vertex.get(b'co',base_index=i) for i in range(vertex.count)]
                axes=[sorted(set(round(v[a],4)for v in verts))for a in range(3)]
                steps=[Counter(round(y-x,4)for x,y in zip(axis,axis[1:])).most_common()for axis in axes]
                mats=Counter(face.get(b'mat_nr',base_index=i)for i in range(face.count)) if face else {}
                modifiers=[];m=o.get_pointer((b'modifiers',b'first'))
                while m:
                    modifiers.append({'type':m.dna_type_name,'fields':{str(k):v for k,v in m.items_recursive_iter()}})
                    m=m.get_pointer((b'modifier',b'next')) if m.dna_type_name!='ModifierData' else m.get_pointer(b'next')
                rows.append({'object':oname,'mesh':mesh.get((b'id',b'name')),'object_layer':o.get(b'lay'),'base_layer':base.get(b'lay'),'active':bool(sc.get(b'lay')&o.get(b'lay')),'position':o.get(b'loc'),'scale':o.get(b'size'),'rotation':o.get(b'rot'),'vertices':len(verts),'faces':face.count if face else 0,'edges':edge.count if edge else 0,'axis_positions':axes,'axis_steps':steps,'face_materials':dict(mats),'modifiers':modifiers})
            base=base.get_pointer(b'next')
        report[name]={'scene_layers':sc.get(b'lay'),'grids':rows}
Path('research/reforged/grid-audit.json').write_text(json.dumps(report,indent=2)+'\n')
for name,scene in report.items():
    for r in scene['grids']:
        print(name,r['object'],'active',r['active'],'v/f/e',r['vertices'],r['faces'],r['edges'],'xyz-count',list(map(len,r['axis_positions'])),'scale',r['scale'],'steps',r['axis_steps'],'modifiers',r['modifiers'])
