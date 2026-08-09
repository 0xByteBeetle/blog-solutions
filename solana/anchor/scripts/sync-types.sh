#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

cd "$ROOT"
anchor build
mkdir -p types
cp target/types/accounts_lab.ts types/accounts_lab.ts
cp target/types/borsh_lab.ts types/borsh_lab.ts
cp target/types/zero_copy.ts types/zero_copy.ts
cp target/types/transfer_hook.ts types/transfer_hook.ts

echo "Refreshed the tracked Anchor TypeScript interfaces."
