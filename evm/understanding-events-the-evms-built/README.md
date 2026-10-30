# Query and decode the article's Transfer log

[Article](https://andreyobruchkov1996.substack.com/p/understanding-events-the-evms-built)

The article prints an `eth_getLogs` request and response. `fixtures/transfer.json` preserves that example response; `events.py` is a supplemental executable filter builder and ERC-20 decoder. Python 3 standard library only.

```sh
python3 events.py request
python3 events.py decode fixtures/transfer.json
python3 -m unittest discover -s tests -v
```

Defaults reproduce Amoy block `0x182e86c`, the printed token contract, Transfer signature and padded indexed sender. The decoder extracts sender `0x7f8b1ca29f95274e06367b60fc4a539e4910fd0c`, recipient `0x2a51ae0ad42dc7d2eb89462a7d41e79502bcf697` and `1000000000000000000` raw token units. Displaying that as one token assumes 18 decimals; decimals are not encoded in the event.

To query a read-only endpoint you supply:

```sh
python3 events.py fetch --rpc-url "$RPC_URL" --block 0x182e86c   --token 0x0fd9e8d3af1aaee056eb9e802c3a762a667b1904   --sender 0x7f8b1ca29f95274e06367b60fc4a539e4910fd0c
```

Tests check the exact filter, zero-padded address topics, full uint256 precision, removed logs, RPC errors and the distinct ERC-721 log shape. Only fixtures and an owned loopback mock are used in tests; the historical public endpoint is not required.
