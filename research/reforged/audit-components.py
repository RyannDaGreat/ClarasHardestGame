"""Export late-level structure, original logic links, and material geometry for investigation."""
import importlib.util
import json
import struct
from pathlib import Path
from collections import Counter
spec=importlib.util.spec_from_file_location('blendfile','tooling/asset-pack/vendor/blendfile.py')
b=importlib.util.module_from_spec(spec);spec.loader.exec_module(b)
scene_names={'SCLv6','SCLv7','SCLv8','SCLv9','SCLv10','SCLv1A','SCLv2A','SCLvGen B'}
with b.open_blend('assets/original/RyansHardestGame.blend') as game:
    addresses={block.addr_old:block for block in game.blocks}
    owners={}
    for obj in game.find_blocks_from_code(b'OB'):
        for kind in [b'sensors',b'controllers',b'actuators']:
            brick=obj.get_pointer((kind,b'first'))
            while brick:
                owners[brick.addr_old]=obj.get((b'id',b'name'))+'/'+kind.decode()+'/'+brick.get(b'name')
                brick=brick.get_pointer(b'next')
    report={'scenes':{},'meshes':{},'materials':{}}
    for sc in game.find_blocks_from_code(b'SC'):
        name=sc.get((b'id',b'name'))
        if name not in scene_names:continue
        scene={'layers':sc.get(b'lay'),'camera':sc.get_pointer(b'camera').get((b'id',b'name')),'objects':[]};base=sc.get_pointer((b'base',b'first'))
        while base:
            obj=base.get_pointer(b'object');oname=obj.get((b'id',b'name'));parent=obj.get_pointer(b'parent');data=obj.get_pointer(b'data')
            row={'name':oname,'type':obj.get(b'type'),'parent':parent.get((b'id',b'name'))if parent else None,'layer':obj.get(b'lay'),'active':bool(obj.get(b'lay')&sc.get(b'lay')),'loc':obj.get(b'loc'),'scale':obj.get(b'size'),'rotation':obj.get(b'rot'),'matrix':obj.get(b'obmat'),'gameflag':obj.get(b'gameflag'),'state':obj.get(b'state'),'data':data.get((b'id',b'name'))if data else None,'logic':{}}
            for kind in [b'sensors',b'controllers',b'actuators',b'prop']:
                brick=obj.get_pointer((kind,b'first'));rows=[]
                while brick:
                    item={'name':brick.get(b'name'),'dna':brick.dna_type_name,'fields':{str(k):v for k,v in brick.items_recursive_iter()}}
                    if kind in [b'sensors',b'actuators']:
                        payload=brick.get_pointer(b'data')
                        if payload:
                            item['payload_type']=payload.dna_type_name
                            item['payload']={str(k):v for k,v in payload.items_recursive_iter()}
                            item['references']={str(k):addresses[v].get((b'id',b'name'))for k,v in payload.items_recursive_iter()if isinstance(v,int)and v in addresses and addresses[v].code in [b'OB',b'SC',b'ME',b'SO']}
                    if kind in [b'sensors',b'controllers']:
                        count=brick.get(b'totlinks');links=brick.get_pointer(b'links')
                        if links and count:
                            game.handle.seek(links.file_offset)
                            item['links']=[owners[p]for p in struct.unpack('<%dI'%count,game.handle.read(count*4))]
                    rows.append(item);brick=brick.get_pointer(b'next')
                row['logic'][kind.decode()]=rows
            scene['objects'].append(row)
            if obj.get(b'type')==1 and row['data'] not in report['meshes']:
                mesh=data;v=mesh.get_pointer(b'mvert');fa=mesh.get_pointer(b'mface');uv=mesh.get_pointer(b'mtface');mat=mesh.get_pointer(b'mat');nmat=mesh.get(b'totcol')
                material_names=[]
                if mat and nmat:
                    game.handle.seek(mat.file_offset);ptrs=struct.unpack('<%dI'%nmat,game.handle.read(nmat*4))
                    material_names=[addresses[p].get((b'id',b'name'))if p else None for p in ptrs]
                faces=[]
                for i in range(fa.count if fa else 0):
                    verts=[fa.get(('v%d'%j).encode(),base_index=i)for j in range(1,5)]
                    if verts[-1]==0:verts.pop()
                    face={'vertices':verts,'material':fa.get(b'mat_nr',base_index=i)}
                    if uv:
                        ptr=uv.get(b'tpage',base_index=i)
                        face['image']=addresses[ptr].get((b'id',b'name'))if ptr else None
                        face['mode']=uv.get(b'mode',base_index=i);face['uv']=uv.get(b'uv',base_index=i)
                    faces.append(face)
                report['meshes'][row['data']]={'vertices':[v.get(b'co',base_index=i)for i in range(v.count if v else 0)],'faces':faces,'materials':material_names}
            base=base.get_pointer(b'next')
        report['scenes'][name]=scene
    for m in game.find_blocks_from_code(b'MA'):
        report['materials'][m.get((b'id',b'name'))]={key.decode():m.get(key)for key in [b'r',b'g',b'b',b'alpha',b'emit',b'mode']}
Path('research/reforged/output').mkdir(parents=True, exist_ok=True)
Path('research/reforged/output/components-audit.json').write_text(json.dumps(report,indent=2,default=lambda value: value.decode('utf-8'))+'\n')
for name,sc in report['scenes'].items():
    active=[o for o in sc['objects']if o['active']]
    print(name,'active',len(active),'roots',len([o for o in active if not o['parent']]),'inactive',len(sc['objects'])-len(active))
    print('sensor types',dict(Counter(br['payload_type']for o in active for br in o['logic']['sensors']if'payload_type'in br)))
    print('actuator types',dict(Counter(br['payload_type']for o in active for br in o['logic']['actuators']if'payload_type'in br)))
    print('active roots',', '.join(o['name']for o in active if not o['parent']))
