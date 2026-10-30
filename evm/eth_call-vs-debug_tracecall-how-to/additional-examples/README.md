# Supplemental gap completion: eth_call vs debug_traceCall: How to Simulate, Trace, and Debug Ethereum Transactions

Article-local companion for published block(s) 4. Original excerpts in
`published/` remain byte-for-byte preserved; see `source-map.json`. Source taken
from the verified repository snapshot, not recreated from the article title.

## Why there are two distinct artifacts

`published/block-04.txt` is the original incomplete curl/JSON request. It remains
incomplete; no invented closing text is represented as author code. The adjacent
published blocks establish eth_call and debug_traceCall intent, but leave target,
caller and calldata as placeholders.

`local_rpc.py` is a separately labeled complete **supplemental** reproduction of
that request shape. It does not reconstruct the author's unknown contract. It
starts its own disposable loopback-only Anvil and uses the identity precompile as
a deterministic fixture, with data 0x1234 and simulated value 0x1. Complete JSON
bodies are built using json.dumps, avoiding invalid smart-quote shell syntax.

## Requirements and run

Python 3.10+ standard library and Anvil 1.4.4; no pip packages or project-external
source files required. From this directory:

```sh
python3 local_rpc.py
# Or an explicitly installed local binary and unused loopback port:
python3 local_rpc.py --anvil /absolute/path/to/anvil --port 18561
```

The runner binds 127.0.0.1, ignores HTTP proxy environment configuration, allows no
public endpoint override and uses no signing keys. It submits **zero transactions**;
eth_call/debug_traceCall simulate only. It stops its own node in a finally block.
Don't run historical public-node commands automatically.

## Verified boundary

Both simulation methods returned the supplied identity bytes; balances before and
after were identical despite value 0x1. Verification JSON contains the exact request,
actual local response and four assertions. No committed state change, archive-node
history, client-to-client trace compatibility, original target-contract behavior
or public-network execution is claimed. Other node clients may expose different
trace APIs. The preserved truncated source is not a runnable original; this
supplemental local recipe closes the practical setup gap without falsifying it.
