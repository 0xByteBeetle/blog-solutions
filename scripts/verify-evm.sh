#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

forge test --offline --root "$ROOT/evm/foundry"
(
  cd "$ROOT/evm/go"
  go test ./...
)
