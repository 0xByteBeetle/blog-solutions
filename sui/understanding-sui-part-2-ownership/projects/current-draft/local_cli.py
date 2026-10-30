"""Prepare a project-local Sui client configuration with an empty keystore."""

import json
import os
from pathlib import Path


root = Path(__file__).resolve().parent
config_dir = root / ".local" / "sui-config"
keystore = config_dir / "sui.keystore"


def assert_keyless():
    if not keystore.is_file() or json.loads(keystore.read_text()) != []:
        raise RuntimeError("This local build configuration must have an empty keystore")


def environment():
    config_dir.mkdir(parents=True, exist_ok=True)
    if keystore.exists():
        assert_keyless()
    else:
        keystore.write_text("[]\n")
        keystore.chmod(0o600)
    # The Sui CLI may initialize a wallet when no client configuration exists.
    # Give compilation its own keyless configuration instead of a user's wallet.
    client = (
        "keystore:\n"
        "  File: " + json.dumps(str(keystore)) + "\n"
        "envs:\n"
        "  - alias: testnet\n"
        "    rpc: https://fullnode.testnet.sui.io:443\n"
        "    ws: null\n"
        "    basic_auth: null\n"
        "active_env: testnet\n"
        "active_address: null\n"
    )
    (config_dir / "client.yaml").write_text(client)
    cache = root / ".local" / "move-cache"
    cache.mkdir(parents=True, exist_ok=True)
    env = os.environ.copy()
    env.update(SUI_CONFIG_DIR=str(config_dir), MOVE_HOME=str(cache), NO_COLOR="1")
    assert_keyless()
    return env


if __name__ == "__main__":
    environment()
    print("Keyless Sui configuration:", config_dir.relative_to(root))
    print("Move dependency cache: .local/move-cache")
    print("Signing keys: 0")
