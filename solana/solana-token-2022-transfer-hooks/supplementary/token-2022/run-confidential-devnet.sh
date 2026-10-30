#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
LOCAL="$ROOT/.local/confidential-devnet"
CONFIG="$LOCAL/solana.yml"
URL="${SOLANA_URL:-https://api.devnet.solana.com}"

PAYER="$LOCAL/payer.json"
MINT_KEYPAIR="$LOCAL/mint.json"
SOURCE_KEYPAIR="$LOCAL/source.json"
DESTINATION_KEYPAIR="$LOCAL/destination.json"

mkdir -p "$LOCAL"
for keypair in "$PAYER" "$MINT_KEYPAIR" "$SOURCE_KEYPAIR" "$DESTINATION_KEYPAIR"; do
  solana-keygen new --silent --force --no-bip39-passphrase -o "$keypair" >/dev/null
done

PAYER_PUB="$(solana-keygen pubkey "$PAYER")"
MINT="$(solana-keygen pubkey "$MINT_KEYPAIR")"
SOURCE="$(solana-keygen pubkey "$SOURCE_KEYPAIR")"
DESTINATION="$(solana-keygen pubkey "$DESTINATION_KEYPAIR")"

solana config set --config "$CONFIG" --url "$URL" --keypair "$PAYER" >/dev/null

echo "Requesting disposable devnet funds for $PAYER_PUB"
solana airdrop 2 "$PAYER_PUB" --url "$URL" >/dev/null

token22() {
  spl-token -C "$CONFIG" --program-2022 "$@"
}

echo "Creating confidential-transfer mint $MINT"
token22 create-token "$MINT_KEYPAIR" --decimals 0 --enable-confidential-transfers auto >/dev/null

echo "Creating and configuring the source account $SOURCE"
token22 create-account "$MINT" "$SOURCE_KEYPAIR" --fee-payer "$PAYER" >/dev/null
token22 configure-confidential-transfer-account --address "$SOURCE" --fee-payer "$PAYER" >/dev/null

echo "Creating and configuring the destination account $DESTINATION"
token22 create-account "$MINT" "$DESTINATION_KEYPAIR" --fee-payer "$PAYER" >/dev/null
token22 configure-confidential-transfer-account --address "$DESTINATION" --fee-payer "$PAYER" >/dev/null

echo "Depositing 100 public tokens into the confidential source balance"
token22 mint "$MINT" 100 "$SOURCE" --mint-authority "$PAYER" --fee-payer "$PAYER" >/dev/null
token22 deposit-confidential-tokens "$MINT" 100 --address "$SOURCE" --fee-payer "$PAYER" >/dev/null
token22 apply-pending-balance --address "$SOURCE" --fee-payer "$PAYER" >/dev/null

echo "Transferring 50 confidential tokens and applying the pending balance"
token22 transfer "$MINT" 50 "$DESTINATION" --from "$SOURCE" --fee-payer "$PAYER" --confidential >/dev/null
token22 apply-pending-balance --address "$DESTINATION" --fee-payer "$PAYER" >/dev/null

echo "Withdrawing 50 tokens to the destination's public balance"
token22 withdraw-confidential-tokens "$MINT" 50 --address "$DESTINATION" --fee-payer "$PAYER" >/dev/null

BALANCE="$(token22 balance --address "$DESTINATION")"
if [[ "$BALANCE" != "50" ]]; then
  echo "Expected destination public balance 50, got $BALANCE" >&2
  exit 1
fi

echo "Confidential-transfer devnet suite passed."
echo "Mint: $MINT"
echo "Source token account: $SOURCE"
echo "Destination token account: $DESTINATION"
