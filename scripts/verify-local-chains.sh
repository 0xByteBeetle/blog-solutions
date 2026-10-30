#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

"$ROOT/evm/eth_call-vs-debug_tracecall-how-to/supplementary/rpc/run-local.sh"
"$ROOT/solana/the-utility-extensions-completing/supplementary/token-2022/run-local.sh"
"$ROOT/solana/solana-deep-dive-unpacking-borsh/supplementary/anchor/scripts/test.sh"
