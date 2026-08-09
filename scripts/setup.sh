#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

npm ci --prefix "$ROOT/solana/anchor"
npm ci --prefix "$ROOT/solana/metadata"

echo "JavaScript dependencies installed. Rust and Go dependencies are fetched by their normal build commands."
