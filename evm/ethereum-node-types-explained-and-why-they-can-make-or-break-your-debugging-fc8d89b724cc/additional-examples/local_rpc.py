"""Supplemental complete local-only eth_call/debug_traceCall reproduction.
Not a reconstruction of the truncated author's target contract or calldata.
"""
import argparse
import json
import shutil
import socket
import subprocess
import time
import urllib.request


def request_body(method, caller):
    if method not in ("eth_call", "debug_traceCall"):
        raise ValueError("Only simulation methods are supported")
    # Supplemental deterministic fixture: identity precompile, not article target.
    call = {"from": caller, "to": "0x0000000000000000000000000000000000000004", "value": "0x1", "data": "0x1234", "gas": "0x186a0"}
    params = [call, "latest"]
    if method == "debug_traceCall":
        params.append({"tracer": "callTracer", "timeout": "30s"})
    return {"jsonrpc": "2.0", "method": method, "params": params, "id": 1}


def run(anvil="anvil", port=0):
    if not 0 <= port <= 65535:
        raise ValueError("Port out of range")
    binary = shutil.which(anvil)
    if not binary:
        raise RuntimeError("Anvil executable not found")
    if not port:
        with socket.socket() as sock:
            sock.bind(("127.0.0.1", 0))
            port = sock.getsockname()[1]
    endpoint = f"http://127.0.0.1:{port}"
    # No endpoint override, external URL, private key or public-network option.
    process = subprocess.Popen([binary, "--host", "127.0.0.1", "--port", str(port), "--chain-id", "31337", "--silent"], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    def rpc(body):
        req = urllib.request.Request(endpoint, data=json.dumps(body).encode(), headers={"Content-Type": "application/json"})
        with urllib.request.build_opener(urllib.request.ProxyHandler({})).open(req, timeout=5) as response:
            result = json.load(response)
        if "error" in result:
            raise RuntimeError(result["error"])
        return result["result"]
    def read(method, params):
        return rpc({"jsonrpc": "2.0", "id": 1, "method": method, "params": params})
    try:
        for _ in range(100):
            if process.poll() is not None:
                raise RuntimeError("Fresh local Anvil exited; possible port conflict")
            try:
                if read("eth_chainId", []) == "0x7a69":
                    break
            except (OSError, RuntimeError):
                pass
            time.sleep(0.05)
        else:
            raise RuntimeError("Fresh local Anvil did not become ready")
        caller = read("eth_accounts", [])[0]
        target = "0x0000000000000000000000000000000000000004"
        before = [read("eth_getBalance", [a, "latest"]) for a in (caller, target)]
        call_body = request_body("eth_call", caller)
        trace_body = request_body("debug_traceCall", caller)
        returned = rpc(call_body)
        trace = rpc(trace_body)
        after = [read("eth_getBalance", [a, "latest"]) for a in (caller, target)]
        assert returned == "0x1234", returned
        assert trace.get("output") == "0x1234", trace
        assert before == after, (before, after)
        return {"fixture": "supplemental local identity precompile", "ethCallRequest": call_body, "ethCallResult": returned, "traceCallRequest": trace_body, "traceCallResult": trace, "balancesBefore": before, "balancesAfter": after, "checks": ["complete JSON request round-trip", "eth_call returns supplied identity bytes", "debug_traceCall returns same bytes", "simulated value transfer does not persist balances"], "transactionsSubmitted": 0, "publicNetwork": False}
    finally:
        process.terminate()
        try:
            process.wait(timeout=5)
        except subprocess.TimeoutExpired:
            process.kill(); process.wait()


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--anvil", default="anvil", help="Explicit local executable path")
    parser.add_argument("--port", type=int, default=0, help="Loopback-only port; 0 chooses a free port")
    args = parser.parse_args()
    print(json.dumps(run(args.anvil, args.port), indent=2))
