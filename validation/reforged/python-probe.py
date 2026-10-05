import sys
import json
import GameLogic
import Mathutils
assert sys.version_info[:3] == (2, 6, 2), sys.version
configuration = json.loads('{"position":[10.0,12.0,3.0],"grid":{"cellSize":6.451612903225806},"links":[["entry","exit"]]}')
assert configuration['links'][0] == ['entry', 'exit']
scene = GameLogic.getCurrentScene()
assert scene.name == 'LvGen B', scene.name
original_count = len(scene.objects)
prototype = scene.objectsInactive['OBWalrus.013']
anchor = scene.objects['OBSpawnPoint.004']
probe = scene.addObject(prototype, anchor)
probe.position = configuration['position']
assert all(abs(a-b)<0.0001 for a,b in zip(probe.position, configuration['position']))
probe['reforged_probe'] = 73
assert probe['reforged_probe'] == 73
assert len(scene.objects) > original_count
print('REFORGED_PYTHON_STARTUP_PASS', sys.version, scene.name, original_count, len(scene.objects), list(probe.position))
probe.endObject()
probe_frames = 0
def reforged_tick():
    global probe_frames
    probe_frames += 1
    if probe_frames == 5:
        assert probe.invalid
        assert GameLogic.getCurrentScene().name == 'LvGen B'
        assert len(scene.objects) > 0
        print('REFORGED_PYTHON_TICK_PASS', probe_frames, len(scene.objects))
