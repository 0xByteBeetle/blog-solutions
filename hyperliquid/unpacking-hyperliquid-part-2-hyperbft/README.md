# Part 2: API response examples

[Article](https://andreyobruchkov1996.substack.com/p/unpacking-hyperliquid-part-2-hyperbft)

The fixtures preserve the printed clearinghouse response and abbreviated spot response. The latter contains `...` and is intentionally `.json.txt`: it is not valid complete JSON. No omitted balances or Rust implementation have been invented.

Requires Python 3.10+; standard library only. From this directory:

```sh
python3 -m unittest discover -s tests -v
```

Three supplemental tests check clearinghouse field types, reject the incomplete spot JSON, and examine only explicitly displayed spot rows after test-only removal of the omission marker. These are historical fixtures, not fresh API observations.

## Query both accounting engines (optional, read-only)

Install `curl` and `jq` separately if absent. From this folder, set one public user address and use it for **both** requests. The default below is the article's historical account, not a wallet to use or fund:

```sh
USER_ADDRESS=0x09174CC31425746672737a0c3d06Fb27E82274e8
jq -n --arg user "$USER_ADDRESS" '{type:"clearinghouseState",user:$user}' | \
  curl -fsS https://api.hyperliquid-testnet.xyz/info -H 'Content-Type: application/json' --data-binary @- | jq
jq -n --arg user "$USER_ADDRESS" '{type:"spotClearinghouseState",user:$user}' | \
  curl -fsS https://api.hyperliquid-testnet.xyz/info -H 'Content-Type: application/json' --data-binary @- | jq
```

Compare perp `marginSummary`/`withdrawable`/`assetPositions` with spot `balances` and, when supplied, `tokenToAvailableAfterMaintenance`. Token indices identify assets; `total` and `hold` are decimal-string balances. The two requests are separate observations, not an atomic snapshot. Historical zero perp margin and 798 spot USDC may have changed. No private key, signing or trading is involved. `usdClassTransfer` is discussed as a boundary but its implementation is deferred by the article; this companion does not invent one. The offline fixture tests above remain the default checks and do not call the API.
