# Catching native ETH transfers without events

[Article](https://andreyobruchkov1996.substack.com/p/catching-eth-native-transfers-without)

The article supplies a `trace_replayTransaction` curl request and recursive collection pseudocode. `eth_transfers.py` turns that workflow into a runnable parser, with the failure and schema handling needed around the pseudocode. It uses only Python 3's standard library.

From this folder:

```sh
python3 eth_transfers.py parse fixtures/parity.json
python3 eth_transfers.py parse fixtures/geth.json
python3 eth_transfers.py top fixtures/transaction.json fixtures/receipt.json
python3 -m unittest discover -s tests -v
```

The owned synthetic fixtures model the same execution in both formats. Each trace yields paths `[]`, `[1,0]`, `[2]`, `[3]` with exact decimal wei strings `1000000000000000001`, `2`, `3`, `4`. The reverted call and its successful-looking child are excluded. No floating-point ETH conversion occurs.

For a transaction and read-only tracing endpoint you provide:

```sh
python3 eth_transfers.py request "$TX_HASH" |
  curl -sS -H 'Content-Type: application/json' --data-binary @- "$RPC_URL" |
  python3 eth_transfers.py parse -
# Geth equivalent:
python3 eth_transfers.py fetch "$TX_HASH" --schema geth --rpc-url "$RPC_URL"
```

Parity/OpenEthereum `result.trace[]` is flat: `traceAddress` establishes ancestry. Geth `callTracer` returns nested `calls`. Both include the top-level frame, so do not add `top` output to the same trace again. Failed ancestors roll back descendants. DELEGATECALL/CALLCODE can carry inherited value without transferring it; their actual CALL children are still visited. CREATE uses `result.address` in flat traces; SELFDESTRUCT uses `address`, `refundAddress`, `balance` there. Zero values and self-transfers are omitted.

Provide a full transaction trace, not a filtered subset or `onlyTopCall` result. RPC errors, null results and incomplete flat ancestry fail explicitly. These records describe committed value movements, not net balance changes or gas fees. Tests use fixtures and owned loopback mock RPCs; no public-node execution is claimed.

Schema references: [OpenEthereum trace API](https://openethereum.github.io/JSONRPC-trace-module), [Geth callTracer](https://geth.ethereum.org/docs/developers/evm-tracing/built-in-tracers#calltracer).
