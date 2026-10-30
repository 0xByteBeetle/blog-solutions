# Supplemental scenario; existing utility branches reused, combined branch added.
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


# Supplemental missing published block6: both extensions on the SAME mint.
COMBINED_KEYPAIR="$(new_mint_keypair combined-mint)"
COMBINED_MINT="$(solana-keygen pubkey "$COMBINED_KEYPAIR")"
token22 create-token --decimals 0 --enable-permanent-delegate --enable-non-transferable "$COMBINED_KEYPAIR" >/dev/null
token22 create-account "$COMBINED_MINT" --owner "$ALICE_PUB" --fee-payer "$PAYER" >/dev/null
token22 create-account "$COMBINED_MINT" --owner "$BOB_PUB" --fee-payer "$PAYER" >/dev/null
COMBINED_ALICE="$(ata22 "$COMBINED_MINT" "$ALICE_PUB")"
COMBINED_BOB="$(ata22 "$COMBINED_MINT" "$BOB_PUB")"
token22 mint "$COMBINED_MINT" 100 "$COMBINED_ALICE" --mint-authority "$PAYER" --fee-payer "$PAYER" >/dev/null
token22 burn "$COMBINED_ALICE" 50 --owner "$PAYER" --fee-payer "$PAYER" >/dev/null
assert_eq "$(token22 balance --address "$COMBINED_ALICE")" "50" "combined mint delegate burn"
expect_failure "combined mint holder transfer" token22 transfer "$COMBINED_MINT" 10 "$COMBINED_BOB" --from "$COMBINED_ALICE" --owner "$ALICE" --fee-payer "$PAYER"
assert_eq "$(token22 balance --address "$COMBINED_ALICE")" "50" "combined mint rejected transfer preserves source"
assert_eq "$(token22 balance --address "$COMBINED_BOB")" "0" "combined mint rejected transfer preserves destination"
