# Ethereum Dev Hacks: Catching Hidden Transfers, Real-Time Events, and Multicalls

[Read the article on Substack](https://andreyobruchkov1996.substack.com/p/ethereum-dev-hacks-catching-hidden-transfers-real-time-events-and-multicalls-bef7435b9397)

Published: 2025-08-20

The article contains 9 displayed code or output blocks. This page maps those examples to maintained implementations and checks; it does not duplicate the article itself.

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
