import base64
import json
from pathlib import Path

obj = json.loads(Path("evidence/object.json").read_text())["object"]
raw = base64.b64decode(obj["contents"]["value"], validate=True)


def decode_coin(value):
    if len(value) != 40:
        raise ValueError(f"Expected 40 Move value bytes, received {len(value)}")
    object_id = "0x" + value[:32].hex()
    balance = int.from_bytes(value[32:40], "little")
    return object_id, balance


object_id, balance = decode_coin(raw)
assert object_id == obj["object_id"] == obj["json"]["id"]
assert balance == int(obj["json"]["balance"]) == int(obj["balance"])

print("UID bytes [0:32]:", raw[:32].hex())
print("Balance bytes [32:40]:", raw[32:40].hex())
print("Decoded object ID:", object_id)
print("Decoded balance:", balance, "MIST")
print("PASS: decoded values match both the object metadata and Move JSON")

try:
    decode_coin(raw[:-1])
except ValueError as error:
    print("Truncated input rejected locally:", error)
else:
    raise AssertionError("The truncated input was incorrectly accepted")