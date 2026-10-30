import json
import ssl
from decimal import Decimal
from pathlib import Path
from urllib.request import Request, urlopen

obj = json.loads(Path("evidence/object.json").read_text())["data"]["object"]
digest = obj["previousTransaction"]["digest"]
query = """
query StorageAccounting($digest: String!) {
  transaction(digest: $digest) {
    digest
    gasInput { gasBudget gasPrice }
    effects {
      status
      balanceChangesJson
      gasEffects {
        gasSummary {
          computationCost storageCost storageRebate nonRefundableStorageFee
        }
      }
    }
  }
}
"""
body = json.dumps({"query": query, "variables": {"digest": digest}}).encode()
request = Request(
    "https://graphql.testnet.sui.io/graphql",
    data=body,
    headers={"Content-Type": "application/json"},
)
ca_file = "/etc/ssl/cert.pem" if Path("/etc/ssl/cert.pem").is_file() else None
context = ssl.create_default_context(cafile=ca_file)
with urlopen(request, timeout=30, context=context) as response:
    result = json.load(response)
if result.get("errors"):
    raise RuntimeError(json.dumps(result["errors"]))
tx = result["data"]["transaction"]
if tx is None:
    raise RuntimeError("The producing transaction is not retained by this service")
Path("evidence/storage-costs.json").write_text(json.dumps(result, indent=2) + "\n")
cost = {key: int(value) for key, value in tx["effects"]["gasEffects"]["gasSummary"].items()}
net = cost["computationCost"] + cost["storageCost"] - cost["storageRebate"]
sui_type = f"0x{2:064x}::sui::SUI"
balance_change = sum(
    int(change["amount"])
    for change in tx["effects"]["balanceChangesJson"]
    if change["coinType"] == sui_type
)
print("Existing transaction:", tx["digest"])
print("Execution status:", tx["effects"]["status"])
print("Gas budget:", tx["gasInput"]["gasBudget"], "MIST")
for name, value in cost.items():
    print(f"{name}: {value} MIST")
print("Net gas charge:", net, "MIST =", Decimal(net) / Decimal(10**9), "SUI")
print("Non-refundable storage fee is reported separately, not added again")
print("Sum of SUI balance changes:", balance_change, "MIST")
assert tx["digest"] == digest
assert tx["effects"]["status"] == "SUCCESS"
assert net <= int(tx["gasInput"]["gasBudget"])
assert balance_change == -net
print("PASS: this transfer's balance changes match the calculated gas charge")
print("No transaction was constructed, signed, or submitted")
