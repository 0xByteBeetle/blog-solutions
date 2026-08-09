# What Every Blockchain Developer Should Know About EVM Internals – Part 2

[Read the article on Substack](https://andreyobruchkov1996.substack.com/p/what-every-blockchain-developer-should-know-about-evm-internals-part-2-eab0f4fae3de)

Published: 2025-07-08

The article contains 20 displayed code or output blocks. This page maps those examples to maintained implementations and checks; it does not duplicate the article itself.

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
