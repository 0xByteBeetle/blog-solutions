import base64
import json
from pathlib import Path

from rpc import rpc

obj = json.loads(Path("evidence/object.json").read_text())["object"]
object_id = obj["object_id"]
digest = obj["previous_transaction"]
result = rpc("GetTransaction", digest=digest, read_mask={"paths": ["*"]})
tx = result["transaction"]
Path("evidence/object-history.json").write_text(json.dumps(result, indent=2) + "\n")

change = next(item for item in tx["effects"]["changed_objects"]
              if item["object_id"] == object_id)
versions = {item["version"]: item
            for item in tx.get("objects", {}).get("objects", [])
            if item["object_id"] == object_id}
if not {change["input_version"], change["output_version"]} <= versions.keys():
    raise RuntimeError("This endpoint did not return both historical object versions")

before = versions[change["input_version"]]
after = versions[change["output_version"]]
assert after["version"] == obj["version"]
assert after["digest"] == obj["digest"]
assert after["owner"] == obj["owner"]


def move_bytes(record):
    return base64.b64decode(record["contents"]["value"], validate=True)


def object_bytes(record):
    return base64.b64decode(record["bcs"]["value"], validate=True)


print("Existing transaction:", tx["digest"])
print("Transaction checkpoint:", tx["checkpoint"])
print("Object ID:", object_id)
print("Stored version change:", before["version"], "->", after["version"])
print("Owner before:", before["owner"]["address"])
print("Owner after:", after["owner"]["address"])
for record in (before, after):
    print(f"Version {record['version']}: {len(move_bytes(record))} Move bytes, "
          f"{len(object_bytes(record))} full object bytes")
print("Move value unchanged:", move_bytes(before) == move_bytes(after))
print("Full object bytes unchanged:", object_bytes(before) == object_bytes(after))