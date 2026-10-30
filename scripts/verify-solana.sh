#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

cargo test --manifest-path "$ROOT/solana/architecting-high-performance-solana/supplementary/fundamentals/Cargo.toml"

(
  cd "$ROOT/solana/solana-deep-dive-unpacking-borsh/supplementary/anchor"
  ./scripts/build.sh
  npx tsc --noEmit
)

(
  cd "$ROOT/solana/where-token-metadata-lives-on-solana/supplementary/metadata"
  npm test
  npm run check
)
