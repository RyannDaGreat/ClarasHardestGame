"""Observe original BGE objects and collision sensors; never drive physics."""
import json
import GameLogic

with open('/game/level.json') as level_file:
    level = json.load(level_file)
finish_ids = set(o['id'] for o in level['objects'] if o['active'] and o['source'].startswith('OBFinish'))
ticks = 0
won = False
print('REFORGED_PLAY_READY', level['name'])


def reforged_contacts(scene):
    """Latch genuine finish contacts before BGE clears per-frame hit objects."""
    global won
    for obj in scene.objects:
        if obj.name not in finish_ids:
            continue
        for sensor in obj.sensors:
            if sensor.positive and hasattr(sensor, 'hitObject'):
                hit = sensor.hitObject
                if hit is not None and 'Walrus' in hit:
                    if not won:
                        print('REFORGED_WIN', ticks, obj.name, hit.name)
                    won = True


def reforged_tick():
    global ticks
    ticks += 1
    scene = GameLogic.getCurrentScene()
    ships = [o for o in scene.objects if 'Walrus' in o]
    if ticks % 6 == 0 or won:
        return json.dumps({'ticks': ticks, 'won': won,
                           'ships': [{'name': ship.name, 'position': list(ship.worldPosition)} for ship in ships]})
