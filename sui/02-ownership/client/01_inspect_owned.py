import argparse
import json
from pathlib import Path
from rpc import rpc

parser = argparse.ArgumentParser()
parser.add_argument("notebook_id")
parser.add_argument("capability_id")
parser.add_argument("label")
args = parser.parse_args()
if not args.label.isidentifier():
    parser.error("Use a simple label such as baseline, partial, or complete")
responses = {
    name: rpc("GetObject", object_id=object_id, read_mask={"paths": ["*"]})
    for name, object_id in (("notebook", args.notebook_id), ("capability", args.capability_id))
}
note = responses["notebook"]["object"]
cap = responses["capability"]["object"]
bound_id = cap["json"]["notebook"]
assert bound_id == note["object_id"]
assert note["owner"]["kind"] == cap["owner"]["kind"] == "ADDRESS"
Path("evidence").mkdir(exist_ok=True)
path = Path("evidence") / f"{args.label}.json"
path.write_text(json.dumps(responses, indent=2) + "\n")
print("Snapshot:", args.label)
print("Notebook ID:", note["object_id"])
print("Notebook version:", note["version"])
print("Notebook owner:", note["owner"]["address"])
print("Notebook value:", note["json"]["value"])
print("Capability ID:", cap["object_id"])
print("Capability version:", cap["version"])
print("Capability owner:", cap["owner"]["address"])
print("Capability notebook:", bound_id)
print("Binding matches:", bound_id == note["object_id"])
print("Same address owns both:", note["owner"] == cap["owner"])
print("Saved:", path)
