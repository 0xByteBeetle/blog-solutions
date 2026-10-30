"""Reproduce the article's eth_getLogs filter and decode ERC-20 Transfer fields."""
import argparse
import json
from pathlib import Path
import re
import sys
import urllib.request

TRANSFER = "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef"
TOKEN = "0x0fd9e8d3af1aaee056eb9e802c3a762a667b1904"
SENDER = "0x7f8b1ca29f95274e06367b60fc4a539e4910fd0c"
BLOCK = "0x182e86c"


def hex_data(value, size):
    if not isinstance(value, str) or not re.fullmatch(r"0x[0-9a-fA-F]{" + str(size * 2) + "}", value):
        raise ValueError(f"Expected {size} hexadecimal bytes")
    return bytes.fromhex(value[2:])


def indexed_address(value):
    raw = hex_data(value, 32)
    if any(raw[:12]):
        raise ValueError("Indexed address must be left-padded with zero bytes")
    return "0x" + raw[12:].hex()


def request_body(token=TOKEN, sender=SENDER, block=BLOCK):
    if not re.fullmatch(r"0x[0-9a-fA-F]+", block):
        raise ValueError("Block must be a hexadecimal quantity")
    contract = "0x" + hex_data(token, 20).hex()
    topic = "0x" + "00" * 12 + hex_data(sender, 20).hex()
    return {"jsonrpc": "2.0", "id": 1, "method": "eth_getLogs", "params": [{
        "fromBlock": block, "toBlock": block, "address": contract, "topics": [TRANSFER, topic]}]}


def decode(document):
    if isinstance(document, dict):
        if document.get("error") is not None:
            raise ValueError("RPC error; logs unavailable")
        document = document.get("result")
    if not isinstance(document, list):
        raise ValueError("Expected a log array or JSON-RPC log result")
    records = []
    for log in document:
        if not isinstance(log, dict):
            raise ValueError("Log must be an object")
        if log.get("removed") is True:
            continue
        topics = log.get("topics")
        if not isinstance(topics, list) or len(topics) != 3:
            raise ValueError("Expected ERC-20 Transfer with two indexed addresses and one data word")
        if hex_data(topics[0], 32).hex() != TRANSFER[2:]:
            raise ValueError("Expected ERC-20 Transfer with two indexed addresses and one data word")
        records.append({"token": "0x" + hex_data(log.get("address"), 20).hex(),
                        "from": indexed_address(topics[1]), "to": indexed_address(topics[2]),
                        "raw_units": str(int.from_bytes(hex_data(log.get("data"), 32), "big")),
                        "block": log.get("blockNumber"), "logIndex": log.get("logIndex")})
    return records


def fetch_logs(url, body):
    if not url.startswith(("http://", "https://")):
        raise ValueError("RPC URL must use http or https")
    request = urllib.request.Request(url, json.dumps(body).encode(), {"Content-Type": "application/json"})
    with urllib.request.urlopen(request, timeout=30) as response:
        document = json.load(response)
    if not isinstance(document, dict) or document.get("jsonrpc") != "2.0" or document.get("id") != body["id"]:
        raise ValueError("Invalid JSON-RPC response")
    return decode(document)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("command", choices=["request", "decode", "fetch"])
    parser.add_argument("file", nargs="?", default="fixtures/transfer.json")
    parser.add_argument("--token", default=TOKEN)
    parser.add_argument("--sender", default=SENDER)
    parser.add_argument("--block", default=BLOCK)
    parser.add_argument("--rpc-url")
    args = parser.parse_args()
    try:
        if args.command == "decode":
            result = decode(json.load(sys.stdin) if args.file == "-" else json.loads(Path(args.file).read_text()))
        else:
            result = request_body(args.token, args.sender, args.block)
            if args.command == "fetch":
                if not args.rpc_url:
                    raise ValueError("fetch requires --rpc-url")
                result = fetch_logs(args.rpc_url, result)
        print(json.dumps(result, indent=2))
    except (ValueError, OSError) as error:
        parser.exit(1, str(error) + "\n")


if __name__ == "__main__":
    main()
