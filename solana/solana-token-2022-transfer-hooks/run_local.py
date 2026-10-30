"""Article-local SPL CLI workflow on an owned disposable loopback validator."""
import argparse
import json
import os
from pathlib import Path
import socket
import subprocess
import tempfile
import time
import urllib.request

PROGRAM = "TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb"


def configuration(port, environment):
    if type(port) is not int or not 1024 <= port <= 64000:
        raise ValueError("Port must be an integer between 1024 and 64000")
    for name in ["SOLANA_URL", "SOLANA_RPC_URL", "ANCHOR_PROVIDER_URL", "WORKSHOP_RPC_URL"]:
        if environment.get(name):
            raise ValueError("URL overrides are forbidden; this runner owns a loopback validator")
    return f"http://127.0.0.1:{port}"


def run(*command, env=None):
    result = subprocess.run(command, capture_output=True, text=True, env=env, timeout=90)
    if result.returncode:
        raise RuntimeError(f"{command[0]} {command[1]} failed: {result.stderr[-3000:]}")
    return result.stdout.strip()


def preflight():
    for tool in ["solana", "solana-test-validator", "solana-keygen"]:
        expected = tool + ("-cli" if tool == "solana" else "")
        if run(tool, "--version").split()[:2] != [expected, "3.1.9"]:
            raise RuntimeError("This example was tested with Agave 3.1.9; no automatic installation")
    if run("spl-token", "--version") != "spl-token-cli 5.5.0":
        raise RuntimeError("This example was tested with spl-token-cli 5.5.0; no automatic installation")
    help_text = run("spl-token", "create-token", "--help")
    flags = ['--decimals', '--transfer-fee-basis-points', '--transfer-fee-maximum-fee']
    if any(flag not in help_text for flag in flags):
        raise RuntimeError("Installed SPL CLI lacks a required article flag")


def scenario(port):
    url = configuration(port, os.environ)  # Before any tool invocation, key or ledger creation.
    preflight()
    env = dict(os.environ)
    for name in ["HTTP_PROXY", "HTTPS_PROXY", "ALL_PROXY", "http_proxy", "https_proxy", "all_proxy"]:
        env.pop(name, None)
    env.update(NO_PROXY="127.0.0.1,localhost", no_proxy="127.0.0.1,localhost")
    # Never attach to a pre-existing validator. Reserve/check our whole port range first.
    sockets = []
    try:
        for kind in [socket.SOCK_STREAM, socket.SOCK_DGRAM]:
            for candidate in range(port, port + 105):
                sock = socket.socket(type=kind); sockets.append(sock); sock.bind(("127.0.0.1", candidate))
    finally:
        for sock in sockets: sock.close()
    with tempfile.TemporaryDirectory(prefix="spl-article-") as directory:
        local = Path(directory)
        keys = {name: local / (name + ".json") for name in ["alice", "bob", "mint"]}
        for key in keys.values():
            run("solana-keygen", "new", "--silent", "--no-bip39-passphrase", "-o", str(key), env=env)
        public = {name: run("solana-keygen", "pubkey", str(key), env=env) for name, key in keys.items()}
        config = str(local / "solana.yml")
        run("solana", "config", "set", "--config", config, "--url", url, "--keypair", str(keys["alice"]), "--commitment", "confirmed", env=env)
        with (local / "validator.log").open("w+") as log:
            validator = subprocess.Popen(["solana-test-validator", "-C", config, "--url", url,
                "--mint", public["alice"], "--ledger", str(local / "ledger"), "--bind-address", "127.0.0.1",
                "--rpc-port", str(port), "--gossip-port", str(port + 2), "--faucet-port", str(port + 3),
                "--dynamic-port-range", f"{port+4}-{port+104}"], env=env, stdout=log, stderr=log)
            try:
                def rpc(method, params):
                    if validator.poll() is not None:
                        log.seek(0); raise RuntimeError("Owned validator stopped: " + log.read()[-3000:])
                    body = json.dumps({"jsonrpc": "2.0", "id": 1, "method": method, "params": params}).encode()
                    request = urllib.request.Request(url, body, {"Content-Type": "application/json"})
                    opener = urllib.request.build_opener(urllib.request.ProxyHandler({}))
                    with opener.open(request, timeout=5) as response: result = json.load(response)
                    if "error" in result: raise RuntimeError(str(result["error"]))
                    return result["result"]
                for attempt in range(60):
                    try:
                        rpc("getHealth", []); break
                    except OSError:
                        time.sleep(1)
                else: raise RuntimeError("Owned validator readiness timed out")
                for name in ["alice", "bob"]:
                    run("solana", "--config", config, "--url", url, "airdrop", "5", public[name], env=env)
                def token(*args):
                    print("spl-token " + " ".join(args), flush=True)
                    return run("spl-token", "--url", url, "-C", config, "--program-id", PROGRAM, "--fee-payer", str(keys["alice"]), *map(str, args), env=env)
                token("create-token", "--decimals", "0", "--transfer-fee-basis-points", "100", "--transfer-fee-maximum-fee", "5", str(keys["mint"]))
                token("create-account", public["mint"])
                def account(owner):
                    values = rpc("getTokenAccountsByOwner", [owner, {"mint": public["mint"]}, {"encoding": "jsonParsed", "commitment": "confirmed"}])["value"]
                    assert len(values) == 1, "Expected one associated token account"
                    entry = values[0]
                    assert entry["account"]["owner"] == PROGRAM
                    info = entry["account"]["data"]["parsed"]["info"]
                    assert info["owner"] == owner and info["mint"] == public["mint"]
                    return entry["pubkey"], info
                alice_ata, _ = account(public["alice"])
                token("create-account", public["mint"], "--owner", public["bob"])
                token("mint", public["mint"], "1000", alice_ata)
                scale = 1
                assert int(account(public["alice"])[1]["tokenAmount"]["amount"]) == 1000 * scale
                assert token("balance", "--address", alice_ata) == "1000"
                token("transfer", public["mint"], "100", public["bob"], "--from", alice_ata, "--fund-recipient")
                _, alice = account(public["alice"]); bob_ata, bob = account(public["bob"])
                assert int(alice["tokenAmount"]["amount"]) == 900 * scale
                assert int(bob["tokenAmount"]["amount"]) == 99 * scale
                def withheld(info):
                    return int(next(x["state"]["withheldAmount"] for x in info["extensions"] if x["extension"] == "transferFeeAmount"))
                assert withheld(bob) == 1
                print("PASS article transfer: Alice=900, Bob=99 spendable, withheld=1", flush=True)
                token("transfer", public["mint"], "600", public["bob"], "--from", alice_ata, "--fund-recipient")
                _, alice = account(public["alice"]); _, bob = account(public["bob"])
                assert int(alice["tokenAmount"]["amount"]) == 300 and int(bob["tokenAmount"]["amount"]) == 694 and withheld(bob) == 6
                print("PASS cap boundary: second transfer=600, fee=5; 300+694+6=1000", flush=True)
            finally:
                validator.terminate()
                try: validator.wait(timeout=20)
                except subprocess.TimeoutExpired: validator.kill(); validator.wait()
    print("Cleaned owned validator, wallets, config and ledger", flush=True)


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--check", action="store_true", help="Check installed tool versions/flags without creating keys")
    parser.add_argument("--rpc-port", type=int, default=30200)
    args = parser.parse_args()
    try:
        if args.check:
            configuration(args.rpc_port, os.environ); preflight(); print("PASS installed tool versions and required CLI flags")
        else: scenario(args.rpc_port)
    except (ValueError, RuntimeError, OSError, AssertionError, subprocess.SubprocessError) as error:
        parser.exit(1, str(error) + "\n")
