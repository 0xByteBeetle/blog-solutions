# Diamonds in EVM: The Proxy That Scales Beyond Limits

[Read the article on Substack](https://andreyobruchkov1996.substack.com/p/diamonds-in-evm-the-proxy-that-scales-beyond-limits-2fedc282cadf)

Published: 2025-09-16

The article contains 25 displayed code or output blocks. This page maps those examples to maintained implementations and checks; it does not duplicate the article itself.

## Companion implementation

### Diamond cuts, loupe inspection, selector routing, shared storage, and facet replacement

Code: `evm/foundry/src/Diamond.sol`

Run:

```bash
cd evm/foundry && forge test --offline --match-contract DiamondTest
```

## Verification boundary

The mapped deterministic tests or disposable local-chain scenario passed on 9 August 2026.
