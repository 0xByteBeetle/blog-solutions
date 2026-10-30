"""Reproduce the article's CREATE/CREATE2 arithmetic with local Forge/Cast tools."""
import argparse
import json
from pathlib import Path
import re
import subprocess

ROOT = Path(__file__).resolve().parent
DEFAULT_DEPLOYER = "0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266"
DEFAULT_SALT = "0x" + "00" * 31 + "42"


def hex_bytes(value, size=None):
    if not isinstance(value, str) or not re.fullmatch(r"0x(?:[0-9a-fA-F]{2})*", value):
        raise ValueError("Expected 0x-prefixed whole bytes")
    result = bytes.fromhex(value[2:])
    if size is not None and len(result) != size:
        raise ValueError(f"Expected {size} bytes")
    return result


def create_preimage(deployer, nonce):
    sender = hex_bytes(deployer, 20)
    if type(nonce) is not int or not 0 <= nonce < 2**64:
        raise ValueError("Nonce must be an unsigned 64-bit integer")
    number = nonce.to_bytes((nonce.bit_length() + 7) // 8, "big")
    # RLP integers use minimal big-endian bytes; zero is the empty string (0x80).
    encoded_nonce = number if len(number) == 1 and number[0] < 0x80 else bytes([0x80 + len(number)]) + number
    payload = b"\x94" + sender + encoded_nonce
    return bytes([0xc0 + len(payload)]) + payload


def create2_preimage(deployer, salt, init_code_hash):
    return b"\xff" + hex_bytes(deployer, 20) + hex_bytes(salt, 32) + hex_bytes(init_code_hash, 32)


def run(*command):
    return subprocess.check_output(command, cwd=ROOT, text=True, timeout=120).strip()


def keccak(data):
    # Ethereum Keccak-256, NOT Python hashlib.sha3_256 (different padding).
    return run("cast", "keccak", "0x" + data.hex())


def address_from_hash(digest):
    return "0x" + hex_bytes(digest, 32)[12:].hex()


def cast_address(*args):
    output = run("cast", "compute-address", *args)
    match = re.fullmatch(r"Computed Address: (0x[0-9a-fA-F]{40})", output)
    if not match:
        raise ValueError("Unexpected cast compute-address output")
    return match[1].lower()


def calculate(deployer=DEFAULT_DEPLOYER, nonce=1, salt=DEFAULT_SALT):
    first = create_preimage(deployer, nonce)
    # This Storage has no constructor arguments, so creation bytecode is init code.
    init_code = hex_bytes(run("forge", "inspect", "src/Storage.sol:Storage", "bytecode"))
    init_hash = keccak(init_code)
    second = create2_preimage(deployer, salt, init_hash)
    create_hash, create2_hash = keccak(first), keccak(second)
    create, create2 = address_from_hash(create_hash), address_from_hash(create2_hash)
    if create != cast_address(deployer, "--nonce", str(nonce)):
        raise AssertionError("Manual CREATE formula differs from Cast")
    if create2 != cast_address(deployer, "--salt", salt, "--init-code-hash", init_hash):
        raise AssertionError("Manual CREATE2 formula differs from Cast")
    return {
        "deployer": deployer.lower(), "nonce": nonce, "salt": salt.lower(),
        "create_rlp": "0x" + first.hex(), "create_hash": create_hash, "create_address": create,
        "init_code_bytes": len(init_code), "init_code_hash": init_hash,
        "create2_preimage": "0x" + second.hex(), "create2_hash": create2_hash,
        "create2_address": create2, "cast_cross_checks": "passed",
    }


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--deployer", default=DEFAULT_DEPLOYER)
    parser.add_argument("--nonce", type=int, default=1)
    parser.add_argument("--salt", default=DEFAULT_SALT)
    args = parser.parse_args()
    try:
        print(json.dumps(calculate(args.deployer, args.nonce, args.salt), indent=2))
    except (ValueError, AssertionError, OSError, subprocess.SubprocessError) as error:
        parser.exit(1, f"Address calculation failed: {error}\n")
