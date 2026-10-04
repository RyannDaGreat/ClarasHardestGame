"""Package untouched Blender2.49 data for static browser delivery (Python3.10+)."""
import hashlib
import importlib.util
import json
import posixpath
from pathlib import Path

import fire

CHUNK_BYTES = 16 * 1024 * 1024  # Below GitHub's per-file limit; moderate download retries.
MAX_EXTERNAL_BYTES = 100 * 1024 * 1024  # GitHub rejects larger individual Git files.
PARSER_SHA256 = '8d57232e05267fd9318a231324d0cd2040fb2e701bef4bafedd07fdccca67369'
SUPPORTED_VERSION = 249
IMAGE_SEQUENCE = 2  # Blender2.49 BKE_image.h IMA_SRC_SEQUENCE.


def digest_file(path):
    """
    Read a file and return its SHA256 and size without loading it all in memory.

    >>> # digest_file(Path('game.blend')) -> {'sha256': '...', 'bytes': 351865072}
    """
    digest = hashlib.sha256()
    size = 0
    with path.open('rb') as stream:
        for chunk in iter(lambda: stream.read(CHUNK_BYTES), b''):
            digest.update(chunk)
            size += len(chunk)
    return {'sha256': digest.hexdigest(), 'bytes': size}


def virtual_path(path):
    """
    Pure function. Map Blender paths into the engine's POSIX browser filesystem.

    >>> virtual_path('//textures/ice.png')
    '/game/textures/ice.png'
    >>> virtual_path(r'Z:\\textures\\ice.png')
    '/z/textures/ice.png'
    >>> virtual_path('//../other/music.wav')
    '/other/music.wav'
    """
    path = path.replace('\\', '/')
    if path.startswith('//'):
        path = '/game/' + path[2:]
    elif len(path) > 1 and path[1] == ':':
        if len(path) < 3 or path[2] != '/':
            raise ValueError(f'Drive-relative path requires an explicit absolute path: {path}')
        path = '/' + path[0].lower() + path[2:]
    elif not path.startswith('/'):
        path = '/game/' + path
    return posixpath.normpath(path)


def load_parser():
    """
    Import the vendored parser only after verifying its immutable source hash.

    >>> # load_parser().open_blend('game.blend', access='rb')
    """
    path = Path(__file__).parent / 'vendor/blendfile.py'
    if digest_file(path)['sha256'] != PARSER_SHA256:
        raise ValueError('Vendored blendfile parser hash mismatch')
    spec = importlib.util.spec_from_file_location('asset_pack_blendfile', path)
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


def discover_assets(blend):
    """
    Read Blender2.49 DNA; return external references and packed asset inventory.

    Unsupported transitive dependencies fail visibly rather than being omitted.
    >>> # discover_assets(Path('game.blend')) -> (references, packed_inventory)
    """
    references, packed_assets, unsupported = [], [], []
    parser = load_parser()
    with parser.open_blend(str(blend), access='rb') as game:
        if game.header.version != SUPPORTED_VERSION:
            raise ValueError(f'Expected Blender249; received {game.header.version}')
        for code, packed_fields in ((b'IM', (b'packedfile',)),
                                    (b'SO', (b'newpackedfile', b'packedfile')),
                                    (b'VF', (b'packedfile',))):
            for block in game.find_blocks_from_code(code):
                reference = {'id': block.get((b'id', b'name')), 'path': block.get(b'name')}
                packed = next((block.get_pointer(field) for field in packed_fields
                               if block.get(field)), None)
                if packed:
                    packed_assets.append({**reference, 'bytes': packed.get(b'size')})
                elif reference['path'] and reference['path'] != '<builtin>':
                    references.append(reference)
                if code == b'IM' and block.get(b'source') == IMAGE_SEQUENCE:
                    unsupported.append(f"image sequence: {reference['id']}")
        for block in game.find_blocks_from_code(b'LI'):
            unsupported.append(f"linked library: {block.get(b'name')}")
        for block in game.blocks:
            if block.code in (b'ENDB', b'DNA1'):
                continue
            if block.dna_type_name == 'Sequence':
                unsupported.append('video sequencer media')
            if block.dna_type_name == 'bGameActuator' and block.get(b'filename'):
                unsupported.append(f"external game actuator: {block.get(b'filename')}")
    if unsupported:
        raise ValueError('Dependency discovery not implemented for: ' + '; '.join(sorted(set(unsupported))))
    return references, packed_assets


def resolve_source(path, blend, config, config_dir):
    """
    Resolve exact paths and configured relocations; never guess by basename.

    >>> # resolve_source('//textures/a.png', blend, {}, base) -> blend.parent/'textures/a.png'
    """
    virtual = virtual_path(path)
    if virtual in config.get('overrides', {}):
        return (config_dir / config['overrides'][virtual]).resolve()
    normalized = path.replace('\\', '/')
    prefixes = sorted(config.get('prefixes', {}), key=len, reverse=True)
    for prefix in prefixes:
        if normalized.startswith(prefix):
            return (config_dir / config['prefixes'][prefix] / normalized[len(prefix):]).resolve()
    if normalized.startswith('//'):
        return (blend.parent / normalized[2:]).resolve()
    if len(normalized) > 1 and normalized[1] == ':':
        return None  # Old Windows paths require an explicit portable mapping.
    return (blend.parent / normalized).resolve()


def write_payload(data, output):
    """
    Write a content-addressed payload, verifying any pre-existing object.

    >>> # write_payload(b'bytes', Path('build/assets')) -> {'url': 'objects/...', ...}
    """
    digest = hashlib.sha256(data).hexdigest()
    relative = f'objects/{digest}.bin'
    target = output / relative
    expected = {'sha256': digest, 'bytes': len(data)}
    if target.exists():
        if digest_file(target) != expected:
            raise ValueError(f'Existing payload is corrupt: {target}')
    else:
        target.parent.mkdir(parents=True, exist_ok=True)
        temporary = target.with_suffix('.tmp')
        temporary.write_bytes(data)
        temporary.replace(target)
    return {'url': relative, **expected}


def package(blend='assets/original/RyansHardestGame.blend', output='build/assets', config=None):
    """
    Package an untouched Blender2.49 file and discovered assets into static files.

    Args:
        blend: Original or edited .blend; it is opened read-only.
        output: Destination directory for assets.json and content-addressed objects.
        config: Optional JSON path mappings, allowed missing records and extra_files.

    >>> # package(config='tooling/asset-pack/project-paths.json')
    """
    blend = Path(blend).resolve()
    output = Path(output).resolve()
    if config:
        config_path = Path(config).resolve()
        settings = json.loads(config_path.read_text())
        config_dir = config_path.parent
    else:
        settings, config_dir = {}, Path.cwd()
    unknown = set(settings) - {'prefixes', 'overrides', 'allow_missing', 'extra_files'}
    if unknown:
        raise ValueError(f'Unknown configuration keys: {sorted(unknown)}')
    original = digest_file(blend)
    original_stat = blend.stat()
    references, packed = discover_assets(blend)
    files, missing = {}, []
    for reference in references:
        source = resolve_source(reference['path'], blend, settings, config_dir)
        if source is None or not source.is_file():
            missing.append(reference)
        else:
            virtual = virtual_path(reference['path'])
            if virtual in files and files[virtual] != source:
                raise ValueError(f'Conflicting sources for {virtual}: {files[virtual]}, {source}')
            files[virtual] = source
    for virtual, source in settings.get('extra_files', {}).items():
        if not virtual.startswith('/') or virtual != posixpath.normpath(virtual):
            raise ValueError(f'extra_files needs an absolute normalized virtual path: {virtual}')
        source = (config_dir / source).resolve()
        if virtual in files and files[virtual] != source:
            raise ValueError(f'extra_files conflicts with discovered source: {virtual}')
        files[virtual] = source
    unexpected_missing = [item for item in missing if item not in settings.get('allow_missing', [])]
    if unexpected_missing:
        raise FileNotFoundError('Unresolved external assets: ' + json.dumps(unexpected_missing))
    for virtual, source in files.items():
        if virtual == '/game/game.blend':
            raise ValueError('An external file cannot replace /game/game.blend')
        if source.stat().st_size > MAX_EXTERNAL_BYTES:
            raise ValueError(f'External file exceeds GitHub file limit; chunk support required: {source}')
    for reference in missing:
        print('Known original missing asset:', reference)
    output.mkdir(parents=True, exist_ok=True)
    chunks = []
    emitted_digest = hashlib.sha256()
    with blend.open('rb') as stream:
        for index, chunk in enumerate(iter(lambda: stream.read(CHUNK_BYTES), b'')):
            emitted_digest.update(chunk)
            chunks.append(write_payload(chunk, output))
            print(f'Game chunk {index + 1}: {len(chunk)} bytes')
    if emitted_digest.hexdigest() != original['sha256']:
        raise RuntimeError('Emitted game chunks differ from original .blend hash')
    delivered_files = []
    for virtual, source in sorted(files.items()):
        payload = write_payload(source.read_bytes(), output)
        delivered_files.append({'virtual': virtual, **payload})
        print(f'External {virtual}: {payload["bytes"]} bytes')
    final_stat = blend.stat()
    if (original_stat.st_mtime_ns, original_stat.st_size) != (final_stat.st_mtime_ns, final_stat.st_size):
        raise RuntimeError('Input .blend changed while packaging; retry after saving finishes')
    if digest_file(blend) != original:
        raise RuntimeError('Input .blend hash changed while packaging')
    manifest = {'schema': 1, 'game': {**original, 'chunks': chunks},
                'files': delivered_files, 'missing': missing,
                'packed': packed, 'parser_sha256': PARSER_SHA256}
    temporary = output / 'assets.json.tmp'
    temporary.write_text(json.dumps(manifest, indent=2, sort_keys=True) + '\n')
    temporary.replace(output / 'assets.json')
    print(f'Packaged {len(chunks)} chunks, {len(delivered_files)} external paths, '
          f'{len(missing)} known missing assets: {output / "assets.json"}')
    return {'sha256': original['sha256'], 'manifest': str(output / 'assets.json')}


if __name__ == '__main__':
    fire.Fire(package)
