"""Read-only trace requests and exact-wei ETH transfer extraction; Python standard library only."""
import argparse
import json
from pathlib import Path
import re
import sys
import urllib.request
from urllib.parse import urlparse


def quantity(value):
    if type(value) is int and value >= 0:
        return value
    if isinstance(value, str) and re.fullmatch(r"0x[0-9a-fA-F]+", value):
        return int(value, 16)
    raise ValueError("Value must be an unsigned integer or hexadecimal quantity")


def address(value):
    if not isinstance(value, str) or not re.fullmatch(r"0x[0-9a-fA-F]{40}", value):
        raise ValueError("Expected a 20-byte address")
    return value.lower()


def unwrap(document):
    if isinstance(document, dict) and "jsonrpc" in document:
        if document.get("error") is not None:
            raise ValueError("JSON-RPC returned an error; no transfer results available")
        if document.get("result") is None:
            raise ValueError("JSON-RPC result is missing or null")
        return document["result"]
    return document


def transfer(kind, sender, recipient, value, path):
    amount = quantity(value)
    if amount == 0:
        return None
    sender, recipient = address(sender), address(recipient)
    if sender == recipient:
        return None  # A self-call/self-refund does not move funds to another account.
    return {"type": kind, "from": sender, "to": recipient,
            "wei": str(amount), "traceAddress": list(path)}


def geth_transfers(root):
    records, stack = [], [(root, ())]
    while stack:
        frame, path = stack.pop()
        if not isinstance(frame, dict):
            raise ValueError("Call frame must be an object")
        if frame.get("error") or frame.get("revertReason"):
            continue  # Every descendant is rolled back too, even if it locally succeeded.
        kind = str(frame.get("type", "")).upper()
        if kind not in {"CALL", "CREATE", "CREATE2", "SELFDESTRUCT", "SUICIDE", "DELEGATECALL", "CALLCODE", "STATICCALL"}:
            raise ValueError("Unsupported callTracer frame type")
        if kind in {"CALL", "CREATE", "CREATE2", "SELFDESTRUCT", "SUICIDE"}:
            record = transfer("SELFDESTRUCT" if kind == "SUICIDE" else kind,
                              frame.get("from"), frame.get("to"), frame.get("value"), path)
            if record:
                records.append(record)
        # DELEGATECALL/CALLCODE may expose inherited msg.value: no new transfer.
        # Still visit their children, which can execute actual value-bearing CALLs.
        calls = frame.get("calls", [])
        if not isinstance(calls, list):
            raise ValueError("calls must be an array")
        stack.extend((calls[i], path + (i,)) for i in reversed(range(len(calls))))
    return records


def parity_transfers(traces):
    if not isinstance(traces, list) or not traces:
        raise ValueError("Expected a complete transaction trace array with a root frame")
    by_path = {}
    for frame in traces:
        if not isinstance(frame, dict):
            raise ValueError("Trace entry must be an object")
        path = frame.get("traceAddress")
        if not isinstance(path, list) or any(type(i) is not int or i < 0 for i in path):
            raise ValueError("Invalid traceAddress")
        path = tuple(path)
        if path in by_path:
            raise ValueError("Duplicate traceAddress")
        by_path[path] = frame
    if () not in by_path or any(path and path[:-1] not in by_path for path in by_path):
        raise ValueError("Incomplete trace: missing root or ancestor")
    for path, frame in by_path.items():
        children = sorted(p[-1] for p in by_path if len(p) == len(path) + 1 and p[:-1] == path)
        if children != list(range(len(children))):
            raise ValueError("Incomplete trace: missing child index")
        if "subtraces" in frame and (type(frame["subtraces"]) is not int or frame["subtraces"] != len(children)):
            raise ValueError("Incomplete trace: subtraces count mismatch")
    failed = {path for path, frame in by_path.items() if frame.get("error")}
    records = []
    for path, frame in sorted(by_path.items()):
        if any(path[:depth] in failed for depth in range(len(path) + 1)):
            continue
        action = frame.get("action")
        if not isinstance(action, dict):
            raise ValueError("Missing trace action")
        kind = str(frame.get("type", "")).lower()
        if kind == "call":
            call_type = str(action.get("callType", "")).lower()
            if call_type in {"delegatecall", "callcode", "staticcall"}:
                continue
            if call_type != "call":
                raise ValueError("Unsupported call action type")
            record = transfer("CALL", action.get("from"), action.get("to"), action.get("value"), path)
        elif kind == "create":
            result = frame.get("result") or {}
            if not isinstance(result, dict):
                raise ValueError("Creation result must be an object")
            creation = str(action.get("creationMethod", "create")).upper()
            if creation not in {"CREATE", "CREATE2"}:
                raise ValueError("Unsupported creation method")
            record = transfer(creation, action.get("from"), result.get("address"), action.get("value"), path)
        elif kind == "suicide":
            record = transfer("SELFDESTRUCT", action.get("address"), action.get("refundAddress"), action.get("balance"), path)
        else:
            raise ValueError("Unsupported transaction trace type")
        if record:
            records.append(record)
    return records


def collect(document):
    trace = unwrap(document)
    if isinstance(trace, dict) and "trace" in trace:
        return parity_transfers(trace["trace"])
    if isinstance(trace, list):
        return parity_transfers(trace)
    if isinstance(trace, dict) and "type" in trace:
        return geth_transfers(trace)
    raise ValueError("Expected trace_replayTransaction trace[] or a Geth callTracer tree")


def top_level(transaction, receipt):
    transaction, receipt = unwrap(transaction), unwrap(receipt)
    if not isinstance(transaction, dict) or not isinstance(receipt, dict):
        raise ValueError("Expected transaction and receipt objects")
    if not transaction.get("hash") or transaction["hash"] != receipt.get("transactionHash"):
        raise ValueError("Transaction and receipt hashes must match")
    status = quantity(receipt.get("status"))
    if status not in {0, 1}:
        raise ValueError("Receipt status must be 0 or 1")
    if status == 0:
        return []
    recipient = transaction.get("to") or receipt.get("contractAddress")
    record = transfer("CALL" if transaction.get("to") else "CREATE", transaction.get("from"), recipient, transaction.get("value"), ())
    return [record] if record else []


def request_body(tx_hash, schema="parity"):
    if not re.fullmatch(r"0x[0-9a-fA-F]{64}", tx_hash):
        raise ValueError("Expected a 32-byte transaction hash")
    if schema not in {"parity", "geth"}:
        raise ValueError("Unknown trace schema")
    method = "trace_replayTransaction" if schema == "parity" else "debug_traceTransaction"
    options = ["trace"] if schema == "parity" else {"tracer": "callTracer"}
    return {"jsonrpc": "2.0", "id": 1, "method": method, "params": [tx_hash, options]}


def fetch_trace(url, tx_hash, schema="parity"):
    if urlparse(url).scheme not in {"http", "https"}:
        raise ValueError("RPC URL must use http or https")
    request = urllib.request.Request(url, json.dumps(request_body(tx_hash, schema)).encode(), {"Content-Type": "application/json"})
    with urllib.request.urlopen(request, timeout=30) as response:
        document = json.load(response)
    if not isinstance(document, dict) or document.get("id") != 1 or document.get("jsonrpc") != "2.0":
        raise ValueError("Invalid JSON-RPC response envelope")
    return collect(document)


def main(argv=None):
    parser = argparse.ArgumentParser(description=__doc__)
    commands = parser.add_subparsers(dest="command", required=True)
    for name in ("request", "fetch"):
        command = commands.add_parser(name)
        command.add_argument("tx_hash")
        command.add_argument("--schema", choices=["parity", "geth"], default="parity")
        if name == "fetch":
            command.add_argument("--rpc-url", required=True)
    command = commands.add_parser("parse")
    command.add_argument("file", help="Trace response JSON; use - for stdin")
    command = commands.add_parser("top")
    command.add_argument("transaction")
    command.add_argument("receipt")
    args = parser.parse_args(argv)
    try:
        if args.command == "request":
            result = request_body(args.tx_hash, args.schema)
        elif args.command == "fetch":
            result = fetch_trace(args.rpc_url, args.tx_hash, args.schema)
        elif args.command == "top":
            result = top_level(json.loads(Path(args.transaction).read_text()), json.loads(Path(args.receipt).read_text()))
        else:
            result = collect(json.load(sys.stdin) if args.file == "-" else json.loads(Path(args.file).read_text()))
        print(json.dumps(result, indent=2))
    except (ValueError, OSError) as error:
        parser.exit(1, f"Cannot extract transfers: {error}\n")


if __name__ == "__main__":
    main()
