"""Decode original properties, animation keys and vertex colors for authoring."""
import importlib.util
import json
import struct
from pathlib import Path

spec = importlib.util.spec_from_file_location('blendfile', 'tooling/asset-pack/vendor/blendfile.py')
blendfile = importlib.util.module_from_spec(spec)
spec.loader.exec_module(blendfile)
path = Path('web/reforged/library.json')
library = json.loads(path.read_text())
animations = 0
colored_faces = 0
with blendfile.open_blend('assets/original/RyansHardestGame.blend') as game:
    for mesh in game.find_blocks_from_code(b'ME'):
        name = mesh.get((b'id', b'name'))
        if name not in library['meshes']:
            continue
        colors = mesh.get_pointer(b'mcol')
        if not colors:
            continue
        faces = library['meshes'][name]['faces']
        assert len(faces) == mesh.get(b'totface'), name
        game.handle.seek(colors.file_offset)
        raw = game.handle.read(len(faces) * 16)
        assert len(raw) == len(faces) * 16, name
        for index, face in enumerate(faces):
            # DNA MCol is a,r,g,b; BGE KX_Mcol2uint_new reads bytes 3,2,1,0
            # as RGBA. Every face occupies four MCol values, even triangles.
            face['colors'] = [list(reversed(raw[index * 16 + corner * 4:
                                                   index * 16 + corner * 4 + 4]))
                              for corner in range(len(face['vertices']))]
            colored_faces += 1
    for ob in game.find_blocks_from_code(b'OB'):
        name = ob.get((b'id', b'name'))
        if name not in library['objects']:
            continue
        metadata = library['objects'][name]
        metadata['restrictflag'] = ob.get(b'restrictflag')
        values = {}
        prop = ob.get_pointer((b'prop', b'first'))
        while prop:
            kind, value = prop.get(b'type'), prop.get(b'data')
            if kind in (3, 5):
                value = struct.unpack('<f', struct.pack('<I', value & 0xffffffff))[0]
            elif kind == 4:
                data = prop.get_pointer(b'poin')
                if not data:
                    raise ValueError('String property has no data: ' + name)
                game.handle.seek(data.file_offset)
                value = game.handle.read(min(128, data.size)).split(b'\0')[0].decode('utf8')
            values[prop.get(b'name')] = {'type': kind, 'value': str(value)}
            prop = prop.get_pointer(b'next')
        metadata['propertyValues'] = values
        ipo = ob.get_pointer(b'ipo')
        curves = []
        curve = ipo.get_pointer((b'curve', b'first')) if ipo else None
        while curve:
            count = curve.get(b'totvert')
            points = curve.get_pointer(b'bezt')
            if points:
                curves.append({'channel': curve.get(b'adrcode'), 'interpolation': curve.get(b'ipo'),
                               'extrapolation': curve.get(b'extrap'),
                               'points': [points.get(b'vec', base_index=i) for i in range(count)]})
            curve = curve.get_pointer(b'next')
        if curves:
            metadata['animation'] = {'curves': curves}
            animations += 1
path.write_text(json.dumps(library, separators=(',', ':')) + '\n')
print('Decoded properties and original animation for', animations, 'object templates')
print('Decoded original BGE vertex colors for', colored_faces, 'faces')
