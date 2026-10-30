import base64
import json
import ssl
from decimal import Decimal
from pathlib import Path
from urllib.request import Request, urlopen

endpoint = "https://graphql.testnet.sui.io/graphql"
object_id = "0x846dbd2afd7d7531e7feea369cfecd2586359a7315324ccfffaeea649071362f"
query = """
query ObjectFoundation($id: SuiAddress!) {
  chainIdentifier
  checkpoint { sequenceNumber }
  object(address: $id) {
    address version digest storageRebate objectBcs
    owner {
      __typename
      ... on AddressOwner { address { address } }
    }
    asMoveObject { contents { type { repr } json bcs } }
    previousTransaction { digest }
  }
}
"""
body = json.dumps({"query": query, "variables": {"id": object_id}}).encode()
request = Request(endpoint, data=body, headers={"Content-Type": "application/json"})
ca_file = "/etc/ssl/cert.pem" if Path("/etc/ssl/cert.pem").is_file() else None
context = ssl.create_default_context(cafile=ca_file)
with urlopen(request, timeout=30, context=context) as response:
    result = json.load(response)
if result.get("errors"):
    raise RuntimeError(json.dumps(result["errors"]))
data = result["data"]
obj = data["object"]
if obj is None:
    raise RuntimeError("The example object is not available from this service")
Path("evidence").mkdir(exist_ok=True)
Path("evidence/object.json").write_text(json.dumps(result, indent=2) + "\n")
contents = obj["asMoveObject"]["contents"]
balance = int(contents["json"]["balance"])
assert obj["address"] == contents["json"]["id"] == object_id
print("Network: Sui Testnet")
print("Chain identifier:", data["chainIdentifier"])
print("Checkpoint:", data["checkpoint"]["sequenceNumber"])
print("Object ID:", obj["address"])
print("Version:", obj["version"])
print("Owner kind:", obj["owner"]["__typename"])
print("Owner address:", obj["owner"]["address"]["address"])
print("Move type:", contents["type"]["repr"])
print("Move fields:", json.dumps(contents["json"], sort_keys=True))
print("Balance:", balance, "MIST =", Decimal(balance) / Decimal(10**9), "SUI")
print("Move value bytes:", len(base64.b64decode(contents["bcs"], validate=True)))
print("Full object bytes:", len(base64.b64decode(obj["objectBcs"], validate=True)))
print("Object storage rebate:", obj["storageRebate"], "MIST")
print("Producing transaction:", obj["previousTransaction"]["digest"])
print("Saved the public response to evidence/object.json")
