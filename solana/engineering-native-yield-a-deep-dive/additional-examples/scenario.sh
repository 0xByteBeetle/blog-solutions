# Supplemental reuse plus RPC validation; no expected historical uiAmount copied.
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


# Supplemental published block9 RPC inspection; loopback URL inherited from guard.
request=$(printf '{"jsonrpc":"2.0","id":1,"method":"getTokenAccountBalance","params":["%s",{"commitment":"confirmed"}]}' "$INTEREST_ALICE")
curl --fail --silent --show-error --noproxy '*' --max-time 15 "$RPC" -H 'Content-Type: application/json' --data "$request" > "$LOCAL/balance-before.json"
sleep 3
curl --fail --silent --show-error --noproxy '*' --max-time 15 "$RPC" -H 'Content-Type: application/json' --data "$request" > "$LOCAL/balance-after.json"
python3 "$ROOT/check-interest.py" "$LOCAL/balance-before.json" "$LOCAL/balance-after.json"
