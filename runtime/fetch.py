"""Download pinned sources into this runtime's disposable local cache."""
import hashlib
import json
from pathlib import Path
import subprocess
import tarfile

HERE = Path(__file__).resolve().parent
CACHE = HERE / ".cache"
UPSTREAM = CACHE / "upstream"
DOWNLOADS = CACHE / "downloads"
PINS = json.loads((HERE / "sources.json").read_text())
UPSTREAM.mkdir(parents=True, exist_ok=True)
DOWNLOADS.mkdir(parents=True, exist_ok=True)

for item in PINS["archives"]:
    archive = DOWNLOADS / item["file"]
    if not archive.exists():
        partial = archive.with_suffix(archive.suffix + ".partial")
        subprocess.run(["curl", "--fail", "--location", "--progress-bar",
                        item["url"], "--output", str(partial)], check=True)
        partial.rename(archive)
    digest = hashlib.sha256(archive.read_bytes()).hexdigest()
    if digest != item["sha256"]:
        raise RuntimeError(f"SHA-256 mismatch for {archive}: {digest}")
    print(f"Verified {item['name']}: {digest}", flush=True)
    destination = UPSTREAM / item["directory"]
    if not destination.exists():
        with tarfile.open(archive) as package:
            # Hashes above identify trusted upstream archives, not user uploads.
            package.extractall(UPSTREAM)
        print(f"Extracted {destination}", flush=True)

for item in PINS["repositories"]:
    destination = CACHE / "emsdk" if item["directory"] == "emsdk" else UPSTREAM / item["directory"]
    if not destination.exists():
        subprocess.run(["git", "clone", "--progress", item["url"], str(destination)], check=True)
        subprocess.run(["git", "-C", str(destination), "checkout", item["revision"]], check=True)
    revision = subprocess.check_output(["git", "-C", str(destination), "rev-parse", "HEAD"], text=True).strip()
    if revision != item["revision"]:
        raise RuntimeError(f"Wrong checkout in {destination}: {revision}")
    subprocess.run(["git", "-C", str(destination), "diff", "--exit-code", "HEAD"], check=True)
    print(f"Verified {item['name']}: {revision}", flush=True)
