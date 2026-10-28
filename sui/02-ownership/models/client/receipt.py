import argparse
import json
from pathlib import Path

parser = argparse.ArgumentParser()
parser.add_argument("receipt")
parser.add_argument("selector", nargs="?", default="status")
parser.add_argument("index", nargs="?", type=int, default=0)
args = parser.parse_args()
data = json.loads(Path(args.receipt).read_text())
if args.selector == "status":
    print("Status:", data["effects"]["status"]["status"])
    print("Digest:", data["digest"])
elif args.selector == "package":
    print(next(x["packageId"] for x in data["objectChanges"] if x["type"] == "published"))
else:
    matches = [x["objectId"] for x in data["objectChanges"]
               if x["type"] == "created"
               and x.get("objectType", "").endswith(args.selector)]
    print(matches[args.index])
