#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

node "$ROOT/scripts/check-catalog.mjs"
node --test "$ROOT/scripts/source-integrity.test.mjs"
node "$ROOT/scripts/check-evm-alignment.mjs"
node "$ROOT/scripts/check-solana-alignment.mjs"
node "$ROOT/scripts/check-hyperliquid-alignment.mjs"
node --test "$ROOT/scripts/hyperliquid-alignment.test.mjs"
node --test "$ROOT/scripts/solana-alignment.test.mjs"
node --test "$ROOT/scripts/evm-alignment.test.mjs" "$ROOT/scripts/toolchain.test.mjs"
node "$ROOT/scripts/verify-restored-builds.mjs"

echo "Recovered-source integrity and build/unit checks passed. See article statuses for runtime coverage."
