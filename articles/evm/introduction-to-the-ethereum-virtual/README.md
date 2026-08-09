# Introduction to the Ethereum Virtual Machine (EVM)

[Read the article on Substack](https://andreyobruchkov1996.substack.com/p/introduction-to-the-ethereum-virtual)

Published: 2025-11-08

The article contains 1 displayed code or output blocks. This page maps those examples to maintained implementations and checks; it does not duplicate the article itself.

## Companion implementation

### Calldata, ABI decoding, storage, call context, fallback behavior, and revert propagation

Code: `evm/foundry/src/Internals.sol`

Run:

```bash
cd evm/foundry && forge test --offline --match-contract InternalsTest
```

### Successful and reverting call paths designed for opcode-level tracing

Code: `evm/foundry/src/Tracing.sol`

Run:

```bash
cd evm/foundry && forge test --offline --match-contract TracingTest
```

## Verification boundary

The mapped deterministic tests or disposable local-chain scenario passed on 9 August 2026.
