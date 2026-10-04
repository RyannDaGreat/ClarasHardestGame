"""Package exact source inputs and port recipes beside the built WASM player."""
import json
from pathlib import Path
import subprocess
import tarfile

HERE = Path(__file__).resolve().parent
PINS = json.loads((HERE / "sources.json").read_text())
OUTPUT = HERE / "build/runtime-source.tar.gz"
OUTPUT.parent.mkdir(parents=True, exist_ok=True)

with tarfile.open(OUTPUT, "w:gz") as bundle:
    for path in sorted(HERE.rglob("*")):
        relative = path.relative_to(HERE)
        if any(part in {".cache", "build", "__pycache__"} for part in relative.parts):
            continue
        if path.is_file():
            bundle.add(path, arcname=str(Path("runtime") / relative))
    for item in PINS["archives"]:
        path = HERE / ".cache/downloads" / item["file"]
        bundle.add(path, arcname=f"runtime/.cache/downloads/{item['file']}")
        print(f"Bundled {item['name']}", flush=True)
    for item in PINS["repositories"]:
        source = HERE / ".cache/emsdk" if item["directory"] == "emsdk" else HERE / ".cache/upstream" / item["directory"]
        archive = HERE / "build" / f"{item['directory']}-source.tar"
        subprocess.run(["git", "-C", str(source), "archive", "--format=tar",
                        f"--prefix=upstream/{item['directory']}/", f"--output={archive}", item["revision"]], check=True)
        with tarfile.open(archive) as snapshot:
            for member in snapshot:
                # Captured GPU replay data is not part of the renderer sources.
                if member.name.startswith("upstream/gl4es/traces/"):
                    continue
                content = snapshot.extractfile(member) if member.isfile() else None
                bundle.addfile(member, content)
        print(f"Bundled {item['name']} {item['revision']}", flush=True)
    emscripten = HERE / ".cache/emsdk/upstream/emscripten"
    def without_bytecode(member):
        return None if "__pycache__" in Path(member.name).parts else member
    for name in ("system", "src", "tools", "LICENSE", "AUTHORS", "ChangeLog.md"):
        bundle.add(emscripten / name, arcname=f"toolchain/emscripten/{name}", filter=without_bytecode)
    ports = emscripten / "cache/ports"
    if not ports.exists():
        raise RuntimeError('Build the runtime first so all exact Emscripten port sources are cached.')
    bundle.add(ports, arcname="toolchain/emscripten/ports")
    print('Bundled Emscripten runtime, library sources and downloaded ports.', flush=True)
print(f"Source bundle: {OUTPUT} ({OUTPUT.stat().st_size:,} bytes)")
