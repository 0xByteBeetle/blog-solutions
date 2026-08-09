# Gas Matters: How to Reduce Transaction Costs in Your Solidity Code

[Read the article on Substack](https://andreyobruchkov1996.substack.com/p/gas-matters-how-to-reduce-transaction-costs-in-your-solidity-code-0c0303d61a4f)

Published: 2025-08-05

The article contains 22 displayed code or output blocks. This page maps those examples to maintained implementations and checks; it does not duplicate the article itself.

## Companion implementation

### Storage packing, cached reads, unchecked increments, and batch writes

Code: `evm/foundry/src/GasPatterns.sol`

Run:

```bash
cd evm/foundry && forge test --offline --match-contract GasPatternsTest
```

## Verification boundary

The mapped deterministic tests or disposable local-chain scenario passed on 9 August 2026.
