import base64
import json
from pathlib import Path

obj = json.loads(Path("evidence/object.json").read_text())["data"]["object"]
contents = obj["asMoveObject"]["contents"]
raw = base64.b64decode(contents["bcs"], validate=True)


def decode_coin(data):
    if len(data) != 40:
        raise ValueError(f"Expected 40 Move value bytes, received {len(data)}")
    return "0x" + data[:32].hex(), int.from_bytes(data[32:40], "little")


object_id, balance = decode_coin(raw)
assert object_id == obj["address"] == contents["json"]["id"]
assert balance == int(contents["json"]["balance"])
print("UID bytes [0:32]:", raw[:32].hex())
print("Balance bytes [32:40]:", raw[32:].hex())
print("Decoded object ID:", object_id)
print("Decoded balance:", balance, "MIST")
print("PASS: decoded values match both the object metadata and Move JSON")
try:
    decode_coin(raw[:-1])
except ValueError as error:
    print("Truncated input rejected locally:", error)
else:
    raise AssertionError("The decoder accepted a truncated value")
