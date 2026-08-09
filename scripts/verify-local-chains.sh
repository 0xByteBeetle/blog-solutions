#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

"$ROOT/evm/rpc/run-local.sh"
"$ROOT/solana/token-2022/run-local.sh"
"$ROOT/solana/anchor/scripts/test.sh"
