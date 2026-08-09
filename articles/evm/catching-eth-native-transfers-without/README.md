# Catching ETH (Native) Transfers Without Events

[Read the article on Substack](https://andreyobruchkov1996.substack.com/p/catching-eth-native-transfers-without)

Published: 2025-11-08

The article contains 3 displayed code or output blocks. This page maps those examples to maintained implementations and checks; it does not duplicate the article itself.

## Companion implementation

### Events, native-value accounting, metadata calls, and multicall behavior

Code: `evm/foundry/src/Observability.sol`

Run:

```bash
cd evm/foundry && forge test --offline --match-contract ObservabilityTest
```

### Log topics, event decoding, and native-transfer trace interpretation

Code: `evm/go/observability`

Run:

```bash
cd evm/go && go test ./observability
```

### JSON-RPC request validation, batch correlation, and partial-error handling

Code: `evm/go/rpcbatch`

Run:

```bash
cd evm/go && go test ./rpcbatch
```

## Verification boundary

The mapped deterministic tests or disposable local-chain scenario passed on 9 August 2026.
