# Part 3: precompiles and CoreWriter

[Article](https://andreyobruchkov1996.substack.com/p/unpacking-hyperliquid-part-3-hyperevm)

The source files preserve the printed contract/library bodies. Compiler headers, the interface import in HyperCoreLimitOrder, and a library wrapper around PriceScale are supplemental. WrongOracle is intentionally incorrect and retained for comparison.

Requires Foundry and Solidity 0.8.30 (pinned, Cancun EVM); no external Solidity packages. From this directory:

```sh
forge test -vv
```

Ten supplemental local tests cover ABI call shapes, mock decoding/failures, price-scaling boundaries, and recorded CoreWriter action encoding. No RPC, wallet or deployment is needed. Mocked precompile results and the recording writer are not native HyperCore execution or confirmation of action acceptance.

The original helper reverts for szDecimals > 6; raw order helpers do not enforce market policy. These teaching-scope behaviors are preserved.

## Foundry project

The runnable project is here: [foundry.toml](foundry.toml), [src/](src/) and [test/](test/). Run `forge build` and `forge test` from this article folder. No repository-root setup is required.

## Raw read and integer decode

The default is an offline reproduction of the article's literal byte responses:

```sh
python3 decode_reads.py
python3 -m unittest discover -s tests -v
```

Expected raw integers are oracle **631381**, bid **631610**, ask **631850**. For the printed BTC metadata `szDecimals=5`, divide by `10^(6-5)=10`: oracle **63138.1**, bid **63161**, ask **63185**. The decoder uses Decimal and checks exact word length and zero padding for uint64 values; no floating-point price conversion or assumed universal scale.

Optional read-only Testnet reproduction requires existing `curl` and `jq`:

```sh
mkdir -p .local/price-reads
INDEX=3
# A single raw ABI uint32 word, with NO function selector.
DATA=$(printf '0x%064x' "$INDEX")
for ENTRY in '0807 oracle' '080e bbo'; do
  set -- $ENTRY
  jq -n --arg to "0x000000000000000000000000000000000000$1" --arg data "$DATA" \
    '{jsonrpc:"2.0",id:1,method:"eth_call",params:[{to:$to,data:$data},"latest"]}' | \
    curl -fsS https://rpc.hyperliquid-testnet.xyz/evm -H 'Content-Type: application/json' --data-binary @- > ".local/price-reads/$2.json"
done
curl -fsS https://api.hyperliquid-testnet.xyz/info -H 'Content-Type: application/json' \
  -d '{"type":"meta"}' > .local/price-reads/meta.json
jq --argjson index "$INDEX" '.universe[$index] | {name,szDecimals}' .local/price-reads/meta.json
python3 decode_reads.py --index "$INDEX" --meta .local/price-reads/meta.json --oracle .local/price-reads/oracle.json --bbo .local/price-reads/bbo.json
```

Run that block in **bash/sh** (its `set -- $ENTRY` uses shell word splitting). Inspect the current `universe[3]`; do not assume the historical BTC index or szDecimals remains unchanged. The files are fresh responses only if you opt in and the requests succeed. These three reads are not an atomic snapshot; current prices may differ from each other and from the printed fixture. The local Solidity mocks still do not prove native precompile execution. No wallet, transaction submission or CoreWriter action is involved.
