"""Runs inside the private lab VM; uses no packages, storage keys, or SAS."""

import base64
import hashlib
import ipaddress
import json
import os
import re
import socket
from urllib.error import HTTPError
from urllib.request import ProxyHandler, Request, build_opener


def synchronize(manifest, request, resolve):
    account = manifest["storageAccount"]
    if not re.fullmatch(r"[a-z0-9]{3,24}", account):
        raise ValueError("Invalid storage account name")
    network = ipaddress.ip_network(manifest["privateSubnet"])
    if not network.is_private:
        raise ValueError("The expected Blob subnet must be private")
    hostname = f"{account}.blob.core.windows.net"
    addresses = resolve(hostname)
    if not addresses or any(ipaddress.ip_address(ip) not in network for ip in addresses):
        raise RuntimeError(f"Blob DNS does not resolve to {network}: {addresses}")
    files = manifest["files"]
    paths = [item["path"] for item in files]
    if not paths or len(paths) != len(set(paths)):
        raise ValueError("A nonempty, unique file manifest is required")
    contents = {}
    for item in files:
        if not re.fullmatch(r"discoveryinputs/(bookshelf|compute)/[A-Za-z0-9_.-]+", item["path"]):
            raise ValueError("Only lab input paths are allowed")
        data = base64.b64decode(item["contentBase64"], validate=True)
        if hashlib.sha256(data).hexdigest() != item["sha256"]:
            raise ValueError(f"Local manifest hash mismatch: {item['path']}")
        contents[item["path"]] = data

    token_url = (
        "http://169.254.169.254/metadata/identity/oauth2/token"
        "?api-version=2018-02-01&resource=https%3A%2F%2Fstorage.azure.com%2F"
    )
    with request(Request(token_url, headers={"Metadata": "true"}), timeout=30) as response:
        token = json.load(response)["access_token"]
    headers = {"Authorization": f"Bearer {token}", "x-ms-version": "2023-11-03"}
    results = []
    for item in files:
        path = item["path"]
        url = f"https://{hostname}/{path}"
        try:
            with request(Request(url, headers=headers), timeout=30) as response:
                actual = response.read()
                request_id = response.headers.get("x-ms-request-id")
            action = "reused"
        except HTTPError as error:
            if error.code != 404:
                raise
            error.close()
            upload_headers = {
                **headers, "x-ms-blob-type": "BlockBlob",
                "If-None-Match": "*", "Content-Type": item["contentType"],
            }
            with request(Request(url, data=contents[path], headers=upload_headers, method="PUT"), timeout=30):
                pass
            with request(Request(url, headers=headers), timeout=30) as response:
                actual = response.read()
                request_id = response.headers.get("x-ms-request-id")
            action = "uploaded"
        actual_hash = hashlib.sha256(actual).hexdigest()
        if actual_hash != item["sha256"]:
            raise RuntimeError(f"Blob differs from the source; refusing to overwrite: {path}")
        results.append({
            "path": path, "action": action, "bytes": len(actual),
            "sha256": actual_hash, "readRequestId": request_id,
        })
    return {"status": "verified", "resolvedAddresses": addresses, "files": results}


if __name__ == "__main__":
    manifest = json.loads(base64.b64decode(os.environ["DISCOVERY_BLOB_MANIFEST"], validate=True))
    opener = build_opener(ProxyHandler({}))
    result = synchronize(manifest, opener.open, lambda host: socket.gethostbyname_ex(host)[2])
    print("DISCOVERY_BLOB_RESULT=" + json.dumps(result, separators=(",", ":")))
