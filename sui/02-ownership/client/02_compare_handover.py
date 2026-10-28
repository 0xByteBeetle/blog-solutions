import argparse
import json
from pathlib import Path

parser = argparse.ArgumentParser()
parser.add_argument("snapshots", nargs=4, metavar="FILE")
args = parser.parse_args()
states = [json.loads(Path(path).read_text()) for path in args.snapshots]
assert states[1] == states[2]
states = [states[0], states[1], states[3]]
notes = [state["notebook"]["object"] for state in states]
caps = [state["capability"]["object"] for state in states]
assert len({note["object_id"] for note in notes}) == 1
assert len({cap["object_id"] for cap in caps}) == 1
assert all(cap["json"]["notebook"] == note["object_id"] for note, cap in zip(notes, caps))
assert notes[0]["owner"] == caps[0]["owner"]
assert notes[1]["owner"] != caps[1]["owner"]
assert notes[2]["owner"] == caps[2]["owner"]
assert caps[0]["owner"] == caps[1]["owner"]
assert notes[1]["owner"] == notes[2]["owner"]
assert notes[0]["json"]["value"] == notes[1]["json"]["value"]
assert notes[2]["json"]["value"] != notes[1]["json"]["value"]
for label, note, cap in zip(("baseline", "partial", "complete"), notes, caps):
    print(f"{label}: value={note['json']['value']}, same owner={note['owner'] == cap['owner']}")
print("PASS: notebook identity, capability identity, and their binding stayed unchanged")
print("PASS: only the notebook moved first, then the capability followed")
print("PASS: both object records stayed unchanged after the rejected attempts")
