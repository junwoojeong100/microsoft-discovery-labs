import base64
import hashlib
import io
import json
import sys
import unittest
from pathlib import Path
from urllib.error import HTTPError

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "scripts"))
from private_blob_client import synchronize


class Reply(io.BytesIO):
    def __init__(self, body):
        super().__init__(body)
        self.headers = {"x-ms-request-id": "test-read-request"}


class BlobClientTests(unittest.TestCase):
    def setUp(self):
        self.data = b"synthetic data\n"
        self.manifest = {
            "storageAccount": "testaccount",
            "privateSubnet": "10.80.8.0/24",
            "files": [{
                "path": "discoveryinputs/compute/materials.csv",
                "contentBase64": base64.b64encode(self.data).decode(),
                "sha256": hashlib.sha256(self.data).hexdigest(),
                "contentType": "text/csv",
            }],
        }
        self.stored = None
        self.puts = 0

    def request(self, request, timeout):
        self.assertEqual(timeout, 30)
        if request.full_url.startswith("http://169.254.169.254/"):
            self.assertEqual(request.get_header("Metadata"), "true")
            return Reply(json.dumps({"access_token": "test-token"}).encode())
        if request.get_method() == "PUT":
            self.assertEqual(request.get_header("If-none-match"), "*")
            self.puts += 1
            self.stored = request.data
            return Reply(b"")
        if self.stored is None:
            raise HTTPError(request.full_url, 404, "missing", {}, None)
        return Reply(self.stored)

    def test_upload_is_verified_by_readback(self):
        result = synchronize(self.manifest, self.request, lambda _: ["10.80.8.4"])
        self.assertEqual(result["status"], "verified")
        self.assertEqual(result["files"][0]["action"], "uploaded")
        self.assertEqual(self.puts, 1)
        self.assertEqual(self.stored, self.data)

    def test_matching_existing_file_is_not_overwritten(self):
        self.stored = self.data
        result = synchronize(self.manifest, self.request, lambda _: ["10.80.8.4"])
        self.assertEqual(result["files"][0]["action"], "reused")
        self.assertEqual(self.puts, 0)

    def test_different_existing_content_fails_without_overwrite(self):
        self.stored = b"different"
        with self.assertRaisesRegex(RuntimeError, "refusing to overwrite"):
            synchronize(self.manifest, self.request, lambda _: ["10.80.8.4"])
        self.assertEqual(self.puts, 0)

    def test_public_dns_is_rejected_before_authentication(self):
        def no_request(*args, **kwargs):
            self.fail("Network request must not occur")
        with self.assertRaisesRegex(RuntimeError, "Blob DNS"):
            synchronize(self.manifest, no_request, lambda _: ["57.150.59.97"])

    def test_mixed_public_and_private_dns_is_rejected(self):
        with self.assertRaisesRegex(RuntimeError, "Blob DNS"):
            synchronize(self.manifest, self.request, lambda _: ["10.80.8.4", "57.150.59.97"])

    def test_permission_failure_is_not_treated_as_a_missing_blob(self):
        def denied(request, timeout):
            if request.full_url.startswith("http://169.254.169.254/"):
                return self.request(request, timeout)
            raise HTTPError(request.full_url, 403, "denied", {}, io.BytesIO())
        with self.assertRaises(HTTPError) as caught:
            synchronize(self.manifest, denied, lambda _: ["10.80.8.4"])
        self.assertEqual(caught.exception.code, 403)
        caught.exception.close()
        self.assertEqual(self.puts, 0)

    def test_manifest_hash_mismatch_is_rejected(self):
        self.manifest["files"][0]["sha256"] = "bad"
        with self.assertRaisesRegex(ValueError, "manifest hash"):
            synchronize(self.manifest, self.request, lambda _: ["10.80.8.4"])

    def test_non_input_paths_are_rejected(self):
        self.manifest["files"][0]["path"] = "discoveryoutputs/overwrite.json"
        with self.assertRaisesRegex(ValueError, "Only lab input"):
            synchronize(self.manifest, self.request, lambda _: ["10.80.8.4"])


if __name__ == "__main__":
    unittest.main()
