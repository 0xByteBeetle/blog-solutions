# eth_call vs debug_traceCall: How to Simulate, Trace, and Debug Ethereum Transactions

[Read the article](https://andreyobruchkov1996.substack.com/p/eth_call-vs-debug_tracecall-how-to).

The article code is preserved; build configuration and focused tests are supplemental. Run commands from this folder.

The supplemental loopback fixture demonstrates the article’s RPC method shape; it does not reconstruct truncated target contracts or assert live-node capabilities. Requires Python3 and Anvil.

```sh
python3 local_rpc.py
```
