#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
BACKUP="$(mktemp -d)"
FILES=(
  "Anchor.toml"
  "programs/accounts/src/lib.rs"
  "programs/borsh_lab/src/lib.rs"
  "programs/zero_copy/src/lib.rs"
  "programs/transfer_hook/src/lib.rs"
)

restore_sources() {
  for file in "${FILES[@]}"; do
    cp "$BACKUP/$file" "$ROOT/$file"
  done
}
trap restore_sources EXIT INT TERM

for file in "${FILES[@]}"; do
  mkdir -p "$BACKUP/$(dirname "$file")"
  cp "$ROOT/$file" "$BACKUP/$file"
done

mkdir -p "$ROOT/target/deploy"
for name in accounts_lab borsh_lab zero_copy transfer_hook; do
  solana-keygen new \
    --no-bip39-passphrase \
    --silent \
    --force \
    --outfile "$ROOT/target/deploy/${name}-keypair.json"
done

cd "$ROOT"
anchor keys sync
"$@"
