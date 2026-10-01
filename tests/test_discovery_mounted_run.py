import base64
import hashlib
import importlib.util
import json
from pathlib import Path
import tempfile
import unittest

ROOT = Path(__file__).resolve().parents[1]
SPEC = importlib.util.spec_from_file_location("mounted_run", ROOT / "scripts/discovery_mounted_run.py")
MODULE = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(MODULE)


class MountedRunTests(unittest.TestCase):
    def manifest(self):
        pairs = [(path, f"bookshelf/{path.name}") for path in sorted((ROOT / "data/bookshelf").glob("*.txt"))]
        pairs.append((ROOT / "data/materials.csv", "compute/materials.csv"))
        return {"files": [
            {"path": target, "contentBase64": base64.b64encode(path.read_bytes()).decode(),
             "sha256": hashlib.sha256(path.read_bytes()).hexdigest()}
            for path, target in pairs
        ]}

    def test_sync_then_independent_readback_and_ranking(self):
        with tempfile.TemporaryDirectory() as directory:
            inputs, outputs = Path(directory) / "inputs", Path(directory) / "outputs"
            first = MODULE.run(self.manifest(), inputs, outputs, scorer=str(ROOT / "scripts/score_materials.py"))
            second = MODULE.run(self.manifest(), inputs, outputs, verify_only=True)
            self.assertEqual(first["inputs"], second["inputs"])
            self.assertEqual(first["outputs"], second["outputs"])
            self.assertEqual(len(second["inputs"]), 5)
            self.assertEqual(len(second["outputs"]), 2)
            self.assertEqual(second["outputs"][0]["result"]["candidate_count"], 8)

    def test_conflicting_file_is_not_overwritten(self):
        with tempfile.TemporaryDirectory() as directory:
            inputs = Path(directory) / "inputs"
            target = inputs / self.manifest()["files"][0]["path"]
            target.parent.mkdir(parents=True)
            target.write_text("preserve existing data")
            with self.assertRaisesRegex(ValueError, "Refusing to overwrite"):
                MODULE.run(self.manifest(), inputs, Path(directory) / "outputs")
            self.assertEqual(target.read_text(), "preserve existing data")

    def test_invalid_paths_and_hashes_fail_before_writing(self):
        with tempfile.TemporaryDirectory() as directory:
            manifest = self.manifest()
            manifest["files"][0]["path"] = "../outside"
            with self.assertRaisesRegex(ValueError, "Unexpected input path"):
                MODULE.run(manifest, Path(directory), Path(directory))
            manifest = self.manifest()
            manifest["files"][0]["sha256"] = "invalid"
            with self.assertRaisesRegex(ValueError, "hash mismatch"):
                MODULE.run(manifest, Path(directory), Path(directory))


if __name__ == "__main__":
    unittest.main()
