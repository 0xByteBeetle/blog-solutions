#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
LOCAL="$ROOT/.local"
LEDGER="$LOCAL/ledger"
LOG="$LOCAL/validator.log"
CONFIG="$LOCAL/solana.yml"
RPC_PORT="${TOKEN_2022_RPC_PORT:-20999}"
RPC="http://127.0.0.1:$RPC_PORT"

PAYER="$LOCAL/payer.json"
ALICE="$LOCAL/alice.json"
BOB="$LOCAL/bob.json"

mkdir -p "$LOCAL"
rm -rf "$LEDGER"

for keypair in "$PAYER" "$ALICE" "$BOB"; do
  solana-keygen new --silent --force --no-bip39-passphrase -o "$keypair" >/dev/null
done

PAYER_PUB="$(solana-keygen pubkey "$PAYER")"
ALICE_PUB="$(solana-keygen pubkey "$ALICE")"
BOB_PUB="$(solana-keygen pubkey "$BOB")"

cleanup() {
  if [[ -n "${VALIDATOR_PID:-}" ]] && kill -0 "$VALIDATOR_PID" 2>/dev/null; then
    kill "$VALIDATOR_PID" 2>/dev/null || true
    wait "$VALIDATOR_PID" 2>/dev/null || true
  fi
}
trap cleanup EXIT

if [[ "${TOKEN_2022_CLONE_FEATURE_SET:-0}" == "1" ]]; then
  "${SOLANA_TEST_VALIDATOR:-solana-test-validator}" \
    --reset \
    --ledger "$LEDGER" \
    --bind-address 127.0.0.1 \
    --rpc-port "$RPC_PORT" \
    --gossip-port 21001 \
    --faucet-port 21002 \
    --dynamic-port-range 21003-21100 \
    --clone-feature-set \
    --url "${TOKEN_2022_SOURCE_CLUSTER:-https://api.devnet.solana.com}" \
    >"$LOG" 2>&1 &
else
  "${SOLANA_TEST_VALIDATOR:-solana-test-validator}" \
    --reset \
    --ledger "$LEDGER" \
    --bind-address 127.0.0.1 \
    --rpc-port "$RPC_PORT" \
    --gossip-port 21001 \
    --faucet-port 21002 \
    --dynamic-port-range 21003-21100 \
    >"$LOG" 2>&1 &
fi
VALIDATOR_PID=$!

for _ in {1..60}; do
  if solana cluster-version --url "$RPC" >/dev/null 2>&1; then
    break
  fi
  if ! kill -0 "$VALIDATOR_PID" 2>/dev/null; then
    echo "The local validator stopped before becoming ready." >&2
    tail -n 80 "$LOG" >&2
    exit 1
  fi
  sleep 1
done

solana cluster-version --url "$RPC" >/dev/null
solana config set --config "$CONFIG" --url "$RPC" --keypair "$PAYER" >/dev/null
solana airdrop 100 "$PAYER_PUB" --url "$RPC" >/dev/null

token() {
  spl-token -C "$CONFIG" "$@"
}

token22() {
  spl-token -C "$CONFIG" --program-2022 "$@"
}

new_mint_keypair() {
  local name="$1"
  local path="$LOCAL/$name.json"
  solana-keygen new --silent --force --no-bip39-passphrase -o "$path" >/dev/null
  printf '%s\n' "$path"
}

ata22() {
  local mint="$1"
  local owner="$2"
  token22 accounts "$mint" --owner "$owner" --addresses-only | tail -n 1
}

assert_eq() {
  local actual="$1"
  local expected="$2"
  local label="$3"
  if [[ "$actual" != "$expected" ]]; then
    echo "$label: expected '$expected', got '$actual'" >&2
    exit 1
  fi
  printf '  verified: %s = %s\n' "$label" "$actual"
}

assert_contains() {
  local value="$1"
  local expected="$2"
  local label="$3"
  if [[ "$value" != *"$expected"* ]]; then
    echo "$label: expected output to contain '$expected'" >&2
    printf '%s\n' "$value" >&2
    exit 1
  fi
  printf '  verified: %s\n' "$label"
}

expect_failure() {
  local label="$1"
  shift
  if "$@" >"$LOCAL/expected-failure.log" 2>&1; then
    echo "$label unexpectedly succeeded" >&2
    exit 1
  fi
  printf '  verified rejection: %s\n' "$label"
}

echo "1/6 Classic SPL Token mint, accounts, minting, and transfer"
CLASSIC_KEYPAIR="$(new_mint_keypair classic-mint)"
CLASSIC_MINT="$(solana-keygen pubkey "$CLASSIC_KEYPAIR")"
token create-token --decimals 0 "$CLASSIC_KEYPAIR" >/dev/null
token create-account "$CLASSIC_MINT" --owner "$ALICE_PUB" --fee-payer "$PAYER" >/dev/null
token create-account "$CLASSIC_MINT" --owner "$BOB_PUB" --fee-payer "$PAYER" >/dev/null
CLASSIC_ALICE="$(token accounts "$CLASSIC_MINT" --owner "$ALICE_PUB" --addresses-only | tail -n 1)"
CLASSIC_BOB="$(token accounts "$CLASSIC_MINT" --owner "$BOB_PUB" --addresses-only | tail -n 1)"
token mint "$CLASSIC_MINT" 1000 "$CLASSIC_ALICE" --mint-authority "$PAYER" --fee-payer "$PAYER" >/dev/null
token transfer "$CLASSIC_MINT" 100 "$CLASSIC_BOB" --from "$CLASSIC_ALICE" --owner "$ALICE" --fee-payer "$PAYER" >/dev/null
assert_eq "$(token balance --address "$CLASSIC_ALICE")" "900" "Alice classic-token balance"
assert_eq "$(token balance --address "$CLASSIC_BOB")" "100" "Bob classic-token balance"

echo "2/6 Token-2022 metadata pointer and embedded metadata"
METADATA_KEYPAIR="$(new_mint_keypair metadata-mint)"
METADATA_MINT="$(solana-keygen pubkey "$METADATA_KEYPAIR")"
token22 create-token --decimals 9 --enable-metadata "$METADATA_KEYPAIR" >/dev/null
token22 initialize-metadata "$METADATA_MINT" "Example Token" "EXMPL" "https://example.com/metadata.json" \
  --mint-authority "$PAYER" --update-authority "$PAYER_PUB" --fee-payer "$PAYER" >/dev/null
token22 update-metadata "$METADATA_MINT" course "0xByteBeetle" --authority "$PAYER" --fee-payer "$PAYER" >/dev/null
METADATA_OUTPUT="$(token22 display "$METADATA_MINT")"
assert_contains "$METADATA_OUTPUT" "Example Token" "metadata name is stored on the mint"
assert_contains "$METADATA_OUTPUT" "EXMPL" "metadata symbol is stored on the mint"
assert_contains "$METADATA_OUTPUT" "0xByteBeetle" "custom metadata field survives reallocation"

echo "3/6 Transfer-fee extension"
FEE_KEYPAIR="$(new_mint_keypair transfer-fee-mint)"
FEE_MINT="$(solana-keygen pubkey "$FEE_KEYPAIR")"
token22 create-token --decimals 0 --transfer-fee-basis-points 100 --transfer-fee-maximum-fee 5 "$FEE_KEYPAIR" >/dev/null
token22 create-account "$FEE_MINT" --owner "$ALICE_PUB" --fee-payer "$PAYER" >/dev/null
token22 create-account "$FEE_MINT" --owner "$BOB_PUB" --fee-payer "$PAYER" >/dev/null
FEE_ALICE="$(ata22 "$FEE_MINT" "$ALICE_PUB")"
FEE_BOB="$(ata22 "$FEE_MINT" "$BOB_PUB")"
token22 mint "$FEE_MINT" 1000 "$FEE_ALICE" --mint-authority "$PAYER" --fee-payer "$PAYER" >/dev/null
token22 transfer "$FEE_MINT" 100 "$FEE_BOB" --from "$FEE_ALICE" --owner "$ALICE" --fee-payer "$PAYER" >/dev/null
assert_eq "$(token22 balance --address "$FEE_ALICE")" "900" "Alice post-transfer principal"
assert_eq "$(token22 balance --address "$FEE_BOB")" "99" "Bob spendable balance after 1% fee"
assert_contains "$(token22 display "$FEE_BOB")" "Transfer fees withheld: 1" "withheld fee remains in Bob's token account"

echo "4/6 Permanent delegate and non-transferable extensions"
DELEGATE_KEYPAIR="$(new_mint_keypair permanent-delegate-mint)"
DELEGATE_MINT="$(solana-keygen pubkey "$DELEGATE_KEYPAIR")"
token22 create-token --decimals 0 --enable-permanent-delegate "$DELEGATE_KEYPAIR" >/dev/null
token22 create-account "$DELEGATE_MINT" --owner "$ALICE_PUB" --fee-payer "$PAYER" >/dev/null
DELEGATE_ALICE="$(ata22 "$DELEGATE_MINT" "$ALICE_PUB")"
token22 mint "$DELEGATE_MINT" 100 "$DELEGATE_ALICE" --mint-authority "$PAYER" --fee-payer "$PAYER" >/dev/null
token22 burn "$DELEGATE_ALICE" 25 --owner "$PAYER" --fee-payer "$PAYER" >/dev/null
assert_eq "$(token22 balance --address "$DELEGATE_ALICE")" "75" "balance after permanent delegate burn"

NONTRANSFER_KEYPAIR="$(new_mint_keypair non-transferable-mint)"
NONTRANSFER_MINT="$(solana-keygen pubkey "$NONTRANSFER_KEYPAIR")"
token22 create-token --decimals 0 --enable-non-transferable "$NONTRANSFER_KEYPAIR" >/dev/null
token22 create-account "$NONTRANSFER_MINT" --owner "$ALICE_PUB" --fee-payer "$PAYER" >/dev/null
token22 create-account "$NONTRANSFER_MINT" --owner "$BOB_PUB" --fee-payer "$PAYER" >/dev/null
NONTRANSFER_ALICE="$(ata22 "$NONTRANSFER_MINT" "$ALICE_PUB")"
NONTRANSFER_BOB="$(ata22 "$NONTRANSFER_MINT" "$BOB_PUB")"
token22 mint "$NONTRANSFER_MINT" 50 "$NONTRANSFER_ALICE" --mint-authority "$PAYER" --fee-payer "$PAYER" >/dev/null
expect_failure "non-transferable token transfer" token22 transfer "$NONTRANSFER_MINT" 10 "$NONTRANSFER_BOB" --from "$NONTRANSFER_ALICE" --owner "$ALICE" --fee-payer "$PAYER"
assert_eq "$(token22 balance --address "$NONTRANSFER_ALICE")" "50" "non-transferable source balance"
assert_eq "$(token22 balance --address "$NONTRANSFER_BOB")" "0" "non-transferable destination balance"

echo "5/6 Default-frozen accounts and required transfer memos"
FROZEN_KEYPAIR="$(new_mint_keypair default-frozen-mint)"
FROZEN_MINT="$(solana-keygen pubkey "$FROZEN_KEYPAIR")"
token22 create-token --decimals 0 --default-account-state frozen --enable-freeze "$FROZEN_KEYPAIR" >/dev/null
token22 create-account "$FROZEN_MINT" --owner "$ALICE_PUB" --fee-payer "$PAYER" >/dev/null
FROZEN_ALICE="$(ata22 "$FROZEN_MINT" "$ALICE_PUB")"
expect_failure "minting into a frozen account" token22 mint "$FROZEN_MINT" 100 "$FROZEN_ALICE" --mint-authority "$PAYER" --fee-payer "$PAYER"
token22 thaw "$FROZEN_ALICE" --freeze-authority "$PAYER" --fee-payer "$PAYER" >/dev/null
token22 mint "$FROZEN_MINT" 100 "$FROZEN_ALICE" --mint-authority "$PAYER" --fee-payer "$PAYER" >/dev/null
assert_eq "$(token22 balance --address "$FROZEN_ALICE")" "100" "balance after explicit thaw"

MEMO_KEYPAIR="$(new_mint_keypair required-memo-mint)"
MEMO_MINT="$(solana-keygen pubkey "$MEMO_KEYPAIR")"
token22 create-token --decimals 0 "$MEMO_KEYPAIR" >/dev/null
token22 create-account "$MEMO_MINT" --owner "$ALICE_PUB" --fee-payer "$PAYER" >/dev/null
token22 create-account "$MEMO_MINT" --owner "$BOB_PUB" --fee-payer "$PAYER" >/dev/null
MEMO_ALICE="$(ata22 "$MEMO_MINT" "$ALICE_PUB")"
MEMO_BOB="$(ata22 "$MEMO_MINT" "$BOB_PUB")"
token22 mint "$MEMO_MINT" 100 "$MEMO_ALICE" --mint-authority "$PAYER" --fee-payer "$PAYER" >/dev/null
token22 enable-required-transfer-memos "$MEMO_BOB" --owner "$BOB" --fee-payer "$PAYER" >/dev/null
expect_failure "incoming transfer without required memo" token22 transfer "$MEMO_MINT" 50 "$MEMO_BOB" --from "$MEMO_ALICE" --owner "$ALICE" --fee-payer "$PAYER"
token22 transfer "$MEMO_MINT" 50 "$MEMO_BOB" --from "$MEMO_ALICE" --owner "$ALICE" --fee-payer "$PAYER" --with-memo "Invoice payment for Q3 RPC node hosting" >/dev/null
assert_eq "$(token22 balance --address "$MEMO_BOB")" "50" "memo-gated destination balance"

echo "6/6 Interest-bearing mint rate checkpoints"
INTEREST_KEYPAIR="$(new_mint_keypair interest-bearing-mint)"
INTEREST_MINT="$(solana-keygen pubkey "$INTEREST_KEYPAIR")"
token22 create-token --decimals 9 --interest-rate 500 "$INTEREST_KEYPAIR" >/dev/null
INTEREST_INITIAL="$(token22 display "$INTEREST_MINT")"
assert_contains "$INTEREST_INITIAL" "Current rate: 500bps" "initial interest rate is 500bps"
token22 --with-compute-unit-limit 200000 set-interest-rate "$INTEREST_MINT" 1000 --rate-authority "$PAYER" --fee-payer "$PAYER" >/dev/null
INTEREST_UPDATED="$(token22 display "$INTEREST_MINT")"
assert_contains "$INTEREST_UPDATED" "Current rate: 1000bps" "updated interest rate is 1000bps"
token22 create-account "$INTEREST_MINT" --owner "$ALICE_PUB" --fee-payer "$PAYER" >/dev/null
INTEREST_ALICE="$(ata22 "$INTEREST_MINT" "$ALICE_PUB")"
token22 mint "$INTEREST_MINT" 100 "$INTEREST_ALICE" --mint-authority "$PAYER" --fee-payer "$PAYER" >/dev/null
assert_contains "$(token22 display "$INTEREST_ALICE")" "Balance: 100" "raw interest-bearing principal remains explicit"

if [[ "${TOKEN_2022_RUN_CONFIDENTIAL:-0}" == "1" ]]; then
  echo "Optional confidential-transfer lifecycle"
  CONFIDENTIAL_KEYPAIR="$(new_mint_keypair confidential-mint)"
  CONFIDENTIAL_MINT="$(solana-keygen pubkey "$CONFIDENTIAL_KEYPAIR")"
  CONFIDENTIAL_SOURCE_KEYPAIR="$(new_mint_keypair confidential-source-account)"
  CONFIDENTIAL_DESTINATION_KEYPAIR="$(new_mint_keypair confidential-destination-account)"
  CONFIDENTIAL_SOURCE="$(solana-keygen pubkey "$CONFIDENTIAL_SOURCE_KEYPAIR")"
  CONFIDENTIAL_DESTINATION="$(solana-keygen pubkey "$CONFIDENTIAL_DESTINATION_KEYPAIR")"
  token22 create-token --decimals 0 --enable-confidential-transfers auto "$CONFIDENTIAL_KEYPAIR" >/dev/null
  token22 create-account "$CONFIDENTIAL_MINT" "$CONFIDENTIAL_SOURCE_KEYPAIR" --fee-payer "$PAYER" >/dev/null
  token22 configure-confidential-transfer-account --address "$CONFIDENTIAL_SOURCE" --fee-payer "$PAYER" >/dev/null
  token22 create-account "$CONFIDENTIAL_MINT" "$CONFIDENTIAL_DESTINATION_KEYPAIR" --fee-payer "$PAYER" >/dev/null
  token22 configure-confidential-transfer-account --address "$CONFIDENTIAL_DESTINATION" --fee-payer "$PAYER" >/dev/null
  token22 mint "$CONFIDENTIAL_MINT" 100 "$CONFIDENTIAL_SOURCE" --mint-authority "$PAYER" --fee-payer "$PAYER" >/dev/null
  token22 deposit-confidential-tokens "$CONFIDENTIAL_MINT" 100 --address "$CONFIDENTIAL_SOURCE" --fee-payer "$PAYER" >/dev/null
  token22 apply-pending-balance --address "$CONFIDENTIAL_SOURCE" --fee-payer "$PAYER" >/dev/null
  token22 transfer "$CONFIDENTIAL_MINT" 50 "$CONFIDENTIAL_DESTINATION" --from "$CONFIDENTIAL_SOURCE" --fee-payer "$PAYER" --confidential >/dev/null
  token22 apply-pending-balance --address "$CONFIDENTIAL_DESTINATION" --fee-payer "$PAYER" >/dev/null
  token22 withdraw-confidential-tokens "$CONFIDENTIAL_MINT" 50 --address "$CONFIDENTIAL_DESTINATION" --fee-payer "$PAYER" >/dev/null
  assert_eq "$(token22 balance --address "$CONFIDENTIAL_DESTINATION")" "50" "destination public balance after confidential withdrawal"
fi

echo "Token and Token-2022 local-validator suite passed."
echo "Validator log: $LOG"
