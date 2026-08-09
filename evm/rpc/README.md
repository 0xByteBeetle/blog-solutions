# Local RPC and tracing example

`run-local.sh` starts a disposable Anvil node, deploys the same storage target used by the Foundry trace tests, and compares a successful `debug_traceCall` with a reverting one.

```bash
./evm/rpc/run-local.sh
```

The account key inside the script is Anvil's public local-development key. It must never be funded or reused outside a disposable local node.
