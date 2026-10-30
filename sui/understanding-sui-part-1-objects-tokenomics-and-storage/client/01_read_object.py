import base64
import json
from decimal import Decimal
from pathlib import Path

from rpc import rpc

object_id = "0x846dbd2afd7d7531e7feea369cfecd2586359a7315324ccfffaeea649071362f"
info = rpc("GetServiceInfo")

if info["chain"] != "testnet":
    raise RuntimeError("The endpoint did not report Sui Testnet")

result = rpc("GetObject", object_id=object_id, read_mask={"paths": ["*"]})
obj = result["object"]
fields = obj["json"]
balance = int(fields["balance"])

assert obj["object_id"] == fields["id"] == object_id
assert balance == int(obj["balance"])

Path("evidence").mkdir(exist_ok=True)
Path("evidence/object.json").write_text(json.dumps(result, indent=2) + "\n")
Path("evidence/service-info.json").write_text(json.dumps(info, indent=2) + "\n")

print("Network: Sui Testnet")
print("Chain identifier:", info["chain_id"])
print("Service checkpoint:", info["checkpoint_height"])
print("Object ID:", obj["object_id"])
print("Version:", obj["version"])
print("Owner kind:", obj["owner"]["kind"])
print("Owner address:", obj["owner"]["address"])
print("Move type:", obj["object_type"])
print("Move fields:", json.dumps(fields, sort_keys=True))
print("Balance:", balance, "MIST =", Decimal(balance) / Decimal(10**9), "SUI")
print("Move value bytes:", len(base64.b64decode(obj["contents"]["value"], validate=True)))
print("Full object bytes:", len(base64.b64decode(obj["bcs"]["value"], validate=True)))
print("Object storage rebate:", obj["storage_rebate"], "MIST")
print("Producing transaction:", obj["previous_transaction"])
print("Saved the public response to evidence/object.json")