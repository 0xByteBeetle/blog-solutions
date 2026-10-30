#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
# Every runtime dependency is installed inside its owning article.
while IFS= read -r manifest; do
  npm ci --ignore-scripts --prefix "$(dirname "$manifest")"
done < <(find "$ROOT/solana" -name package-lock.json -not -path '*/node_modules/*' -not -path '*/projects/*original/*')
