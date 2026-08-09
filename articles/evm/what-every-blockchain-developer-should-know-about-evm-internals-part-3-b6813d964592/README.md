# What Every Blockchain Developer Should Know About EVM Internals — Part 3

[Read the article on Substack](https://andreyobruchkov1996.substack.com/p/what-every-blockchain-developer-should-know-about-evm-internals-part-3-b6813d964592)

Published: 2025-07-15

The article contains 18 displayed code or output blocks. This page maps those examples to maintained implementations and checks; it does not duplicate the article itself.

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
