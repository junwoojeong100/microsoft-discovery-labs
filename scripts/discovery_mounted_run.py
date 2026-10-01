"""Bounded synthetic data synchronization and ranking inside a Discovery tool."""

import argparse
import base64
import hashlib
import json
from pathlib import Path
import re
import subprocess
import sys


def digest(data):
    return hashlib.sha256(data).hexdigest()


def persist(path, content):
    path.parent.mkdir(parents=True, exist_ok=True)
    try:
        with path.open("xb") as stream:
            stream.write(content)
    except FileExistsError:
        pass
    actual = path.read_bytes()
    if actual != content:
        raise ValueError(f"Refusing to overwrite different existing data: {path}")
    return {"bytes": len(actual), "sha256": digest(actual)}


def run(manifest, input_root, output_root, verify_only=False, scorer="/app/score_materials.py"):
    files = manifest["files"]
    paths = [item["path"] for item in files]
    if len(files) != 5 or len(set(paths)) != len(files):
        raise ValueError("Exactly five unique synthetic input files are required")
    inputs = []
    for item in files:
        relative = item["path"]
        if not re.fullmatch(r"(bookshelf|compute)/[A-Za-z0-9_.-]+", relative):
            raise ValueError("Unexpected input path")
        content = base64.b64decode(item["contentBase64"], validate=True)
        if digest(content) != item["sha256"]:
            raise ValueError("Input manifest hash mismatch")
        path = input_root / relative
        if verify_only:
            actual = path.read_bytes()
            if actual != content:
                raise ValueError(f"Persisted input differs: {relative}")
            details = {"bytes": len(actual), "sha256": digest(actual)}
        else:
            details = persist(path, content)
        inputs.append({"path": relative, **details})

    outputs = []
    for case, name, extra in [
        ("baseline", "ranking.json", []),
        ("cost3", "ranking-cost3.json", ["--max-cost", "3"]),
    ]:
        path = output_root / name
        if verify_only:
            content = path.read_bytes()
            result = json.loads(content)
            details = {"bytes": len(content), "sha256": digest(content)}
        else:
            completed = subprocess.run(
                [sys.executable, scorer, "--input", str(input_root / "compute/materials.csv"), *extra],
                capture_output=True, text=True, check=True, timeout=60,
            )
            result = json.loads(completed.stdout)
            content = (json.dumps(result, indent=2, ensure_ascii=False) + "\n").encode()
            details = persist(path, content)
        outputs.append({"case": case, "path": name, "result": result, **details})
    return {"status": "verified", "verifyOnly": verify_only, "inputs": inputs, "outputs": outputs}


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--manifest", required=True)
    parser.add_argument("--verify-only", action="store_true")
    args = parser.parse_args()
    manifest = json.loads(Path(args.manifest).read_text())
    result = run(manifest, Path("/labinputs"), Path("/laboutputs"), args.verify_only)
    print("DISCOVERY_TOOL_RESULT=" + json.dumps(result, separators=(",", ":")))
