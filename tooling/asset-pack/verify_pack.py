"""Verify the real original fixture plus discovery after editing a disposable copy."""
import hashlib
import json
import shutil
import tempfile
from pathlib import Path

import package_assets as packer


def verify():
    """
    Check actual delivery objects, source immutability and fresh dependency reads.

    >>> # Run from the repository root after packaging the original fixture.
    """
    original_path = Path('assets/original/RyansHardestGame.blend')
    original = packer.digest_file(original_path)
    output = Path('build/assets')
    manifest_path = output / 'assets.json'
    manifest_bytes = manifest_path.read_bytes()
    manifest = json.loads(manifest_bytes)
    fixture = json.loads(Path(__file__).with_name('fixtures').joinpath('original.json').read_text())
    combined = hashlib.sha256()
    game_size = 0
    for index, chunk in enumerate(manifest['game']['chunks']):
        data = (output / chunk['url']).read_bytes()
        assert hashlib.sha256(data).hexdigest() == chunk['sha256']
        assert len(data) == chunk['bytes']
        if index < len(manifest['game']['chunks']) - 1:
            assert len(data) == packer.CHUNK_BYTES
        combined.update(data)
        game_size += len(data)
    assert combined.hexdigest() == original['sha256'] == fixture['game']['sha256']
    assert game_size == original['bytes'] == fixture['game']['bytes']
    for entry in manifest['files']:
        assert packer.digest_file(output / entry['url']) == {key: entry[key] for key in ('sha256', 'bytes')}
    delivered = {(f['virtual'], f['sha256'], f['bytes']) for f in manifest['files']}
    expected = {(f['virtual'], f['sha256'], f['bytes']) for f in fixture['files']}
    assert delivered == expected
    assert manifest['missing'] == fixture['missing']
    packer.package(config='tooling/asset-pack/project-paths.json')
    assert manifest_path.read_bytes() == manifest_bytes, 'Packaging must be deterministic'
    print('PASS: object hashes, 21 chunks, exact reassembly, 17 virtual files, two original missing, deterministic rebuild')
    with tempfile.TemporaryDirectory(prefix='asset-pack-test-') as temporary:
        edited = Path(temporary) / 'edited.blend'
        shutil.copyfile(original_path, edited)
        parser = packer.load_parser()
        with parser.open_blend(str(edited), access='rb+') as game:
            block = next(block for block in game.find_blocks_from_code(b'SO')
                         if not block.get(b'newpackedfile') and not block.get(b'packedfile'))
            block.set(b'name', '//samples/newly-edited.wav')
        references, _ = packer.discover_assets(edited)
        assert any(r['path'] == '//samples/newly-edited.wav' for r in references)
        try:
            packer.package(str(edited), str(Path(temporary) / 'out'))
        except FileNotFoundError as error:
            assert 'newly-edited.wav' in str(error)
            print('PASS: dependency edited in temporary .blend rediscovered; unknown missing file rejected')
        else:
            raise AssertionError('New missing file was silently accepted')
    assert packer.digest_file(original_path) == original
    print('PASS: authoritative source unchanged')


if __name__ == '__main__':
    verify()
