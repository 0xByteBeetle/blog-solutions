import json
from pathlib import Path

receipt = json.loads(Path("evidence/alice-update.json").read_text())
data = receipt["transaction"]["data"]
transaction = data["transaction"]
assert transaction["kind"] == "ProgrammableTransaction"
assert len(transaction["transactions"]) == 1
call = transaction["transactions"][0]["MoveCall"]
assert (call["module"], call["function"]) == ("notebook", "set_value")
assert call["arguments"] == [{"Input": 0}, {"Input": 1}, {"Input": 2}]
print("Recorded sender:", data["sender"])
print("Called function:", f"{call['package']}::{call['module']}::{call['function']}")
for position, role in enumerate(("notebook", "capability", "new value")):
    index = call["arguments"][position]["Input"]
    item = transaction["inputs"][index]
    print(f"Move argument {position} ({role}) -> Input {index}")
    if position < 2:
        assert (item["type"], item["objectType"]) == ("object", "immOrOwnedObject")
        print("  Object ID:", item["objectId"])
        print("  Input version:", item["version"])
    else:
        assert item["type"] == "pure"
        raw = bytes(item["value"])
        assert len(raw) == 8
        value = int.from_bytes(raw, "little")
        assert value == 9
        print("  Decoded u64:", value)
print("PASS: the receipt maps two object inputs and one value into set_value")
