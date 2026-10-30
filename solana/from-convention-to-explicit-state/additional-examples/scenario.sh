# Supplemental article-local reuse plus external-pointer branch.
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


# Published external-pointer branch: store an external ADDRESS, not invented metadata.
TARGET_KEYPAIR="$(new_mint_keypair external-pointer-target)"
TARGET_ADDRESS="$(solana-keygen pubkey "$TARGET_KEYPAIR")"
EXTERNAL_KEYPAIR="$(new_mint_keypair external-pointer-mint)"
EXTERNAL_MINT="$(solana-keygen pubkey "$EXTERNAL_KEYPAIR")"
token22 create-token --decimals 9 --metadata-address "$TARGET_ADDRESS" "$EXTERNAL_KEYPAIR" >/dev/null
[[ "$TARGET_ADDRESS" != "$EXTERNAL_MINT" ]] || fail 'External pointer accidentally points to mint itself'
EXTERNAL_OUTPUT="$(token22 display "$EXTERNAL_MINT")"
assert_contains "$EXTERNAL_OUTPUT" "$TARGET_ADDRESS" "published external metadata address retained"
printf '%s\n' "$EXTERNAL_OUTPUT" > "$LOCAL/external-pointer-display.txt"
# No data is initialized at TARGET_ADDRESS: a pointer alone does not prove valid metadata.
