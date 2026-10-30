# Ethereum Dev Hacks: Catching Hidden Transfers, Real-Time Events, and Multicalls

[Read the article](https://andreyobruchkov1996.substack.com/p/ethereum-dev-hacks-catching-hidden-transfers-real-time-events-and-multicalls-bef7435b9397).

The article code is preserved; build configuration and focused tests are supplemental. Run commands from this folder.

### multicall

Go 1.23.10 or compatible. Dependencies are pinned by go.mod/go.sum.

```sh
cd multicall
go test ./...
```

The original executable contains a network endpoint. Compile/tests do not authorize running it against a public chain; inspect the endpoint and use local/mocked execution.

### streaming

Go 1.23.10 or compatible. Dependencies are pinned by go.mod/go.sum.

```sh
cd streaming
go test ./...
```

The original executable contains a network endpoint. Compile/tests do not authorize running it against a public chain; inspect the endpoint and use local/mocked execution.

## Historical event filtering and hidden native transfers

These article-local Python implementations turn the published `eth_getLogs` / `trace_replayTransaction` requests and transfer-collection pseudocode into runnable examples. They are supplemental implementations, not additional printed Go programs. Python 3 needs no external packages:

```sh
python3 events.py request
python3 events.py decode fixtures/transfer.json
python3 eth_transfers.py request 0x$(python3 -c 'print("11"*32)')
python3 eth_transfers.py parse fixtures/parity.json
python3 eth_transfers.py parse fixtures/geth.json
python3 -m unittest discover -s tests -v
```

The event filter uses the article's Amoy token, indexed sender and block `0x182e86c`; its response fixture decodes two padded addresses and the uint256 raw amount without assuming token decimals. Native-transfer fixtures are synthetic: committed CALL/CREATE/SELFDESTRUCT values survive, while reverted subtrees and DELEGATECALL context values do not count as payments. Wei remain exact integer strings. Flat Parity and nested Geth call traces are different schemas, both explicitly handled. The root trace already includes the outer transfer; do not add it a second time.

Optional read-only requests require an explicit endpoint: `events.py fetch --rpc-url URL` or `eth_transfers.py fetch HASH --rpc-url URL`. They are not needed by the offline/mock tests. These companions do not submit transactions.

The Go tests now execute the original multicall entrypoint against an owned HTTP mock, checking all three ERC-20 calls inside one `eth_call`, successful decode, an individual failed result, and malformed output. Streaming keeps the article's filter/printing loop with a small supplemental cancellation/output seam; an owned WebSocket mock checks the subscription filter, delivered log and subscription failure. Neither test contacts the printed public endpoints.
