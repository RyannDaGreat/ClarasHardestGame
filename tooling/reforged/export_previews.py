"""Extract original image pixels as editor previews without changing game inputs."""
import hashlib
import importlib.util
import io
import json
from pathlib import Path
from PIL import Image


def module(name, path):
    """Load the repository's existing read-only asset parser."""
    spec = importlib.util.spec_from_file_location(name, path)
    result = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(result)
    return result


packer = module('packer', 'tooling/asset-pack/package_assets.py')
parser = packer.load_parser()
manifest = json.loads(Path('assets/published/assets.json').read_text())
external = {f['virtual']: f for f in manifest['files']}
output = Path('web/reforged/textures')
output.mkdir(exist_ok=True)
images = {}
missing = []
with parser.open_blend('assets/original/RyansHardestGame.blend') as game:
    for image in game.find_blocks_from_code(b'IM'):
        name = image.get((b'id', b'name'))
        path = image.get(b'name')
        packed = image.get_pointer(b'packedfile')
        if packed:
            size = packed.get(b'size')
            data = packed.get_pointer(b'data')
            game.handle.seek(data.file_offset)
            content = game.handle.read(size)
        else:
            virtual = packer.virtual_path(path)
            if virtual not in external:
                missing.append({'id': name, 'path': path})
                print('Original image unavailable:', name, path)
                continue
            content = (Path('assets/published') / external[virtual]['url']).read_bytes()
        digest = hashlib.sha256(content).hexdigest()
        target = output / (digest + '.png')
        Image.open(io.BytesIO(content)).convert('RGBA').save(target)
        images[name] = 'textures/' + target.name
Path('web/reforged/textures.json').write_text(json.dumps({'images': images, 'missing': missing}, indent=2)+'\n')
print('Exported', len(images), 'original image previews;', len(missing), 'unavailable.')
