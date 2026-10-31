# REVIEW ONLY: existing sequence; entrypoint blocks until compatible runtime established.
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
# Review-only Transfer Trap: after deposit100, available remains0 until apply.
assert_eq "$(token22 balance --address "$CONFIDENTIAL_SOURCE")" "0" "source public balance after deposit"
token22 display "$CONFIDENTIAL_SOURCE"
# Inspect the pending/available extension state; ciphertexts alone are not plaintext balances.
if pending_error=$(token22 transfer "$CONFIDENTIAL_MINT" 50 "$CONFIDENTIAL_DESTINATION" --from "$CONFIDENTIAL_SOURCE" --fee-payer "$PAYER" --confidential 2>&1); then
  fail 'Pending-only transfer unexpectedly succeeded'
fi
# Only an available-funds failure counts; unrelated CLI/RPC/proof failures stop review.
if ! printf '%s' "$pending_error" | grep -Eiq 'insufficient.*available|available.*insufficient'; then
  printf '%s\n' "$pending_error" >&2
  fail 'Pending transfer failure is unclassified; do not treat it as the expected Transfer Trap'
fi
printf 'Expected available-funds rejection before apply: %s\n' "$pending_error"
token22 apply-pending-balance --address "$CONFIDENTIAL_SOURCE" --fee-payer "$PAYER" >/dev/null
token22 display "$CONFIDENTIAL_SOURCE"
# Pending credits are now settled; available must cover transfer50.
token22 transfer "$CONFIDENTIAL_MINT" 50 "$CONFIDENTIAL_DESTINATION" --from "$CONFIDENTIAL_SOURCE" --fee-payer "$PAYER" --confidential >/dev/null
token22 apply-pending-balance --address "$CONFIDENTIAL_DESTINATION" --fee-payer "$PAYER" >/dev/null
token22 withdraw-confidential-tokens "$CONFIDENTIAL_MINT" 50 --address "$CONFIDENTIAL_DESTINATION" --fee-payer "$PAYER" >/dev/null
assert_eq "$(token22 balance --address "$CONFIDENTIAL_DESTINATION")" "50" "destination public balance after confidential withdrawal"
