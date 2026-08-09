#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

cargo test --manifest-path "$ROOT/solana/fundamentals/Cargo.toml"

(
  cd "$ROOT/solana/anchor"
  ./scripts/build.sh
  npx tsc --noEmit
)

(
  cd "$ROOT/solana/metadata"
  npm test
  npm run check
)
