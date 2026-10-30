#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

forge test --offline --root "$ROOT/evm/proxies-and-upgradability-minimal/supplementary/foundry"
(
  cd "$ROOT/evm/batching-calls-efficiently-with-multicall/supplementary/go"
  go test ./...
)
