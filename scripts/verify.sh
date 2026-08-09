#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

node "$ROOT/scripts/check-catalog.mjs"
"$ROOT/scripts/verify-evm.sh"
"$ROOT/scripts/verify-solana.sh"

echo "All deterministic blog example checks passed."
