# Understanding Contract Deployments, Proxies, and CREATE2 — Part 2

[Read the article on Substack](https://andreyobruchkov1996.substack.com/p/understanding-contract-deployments-proxies-and-create2-part-2-df8f05998d5e)

Published: 2025-09-04

The article contains 14 displayed code or output blocks. This page maps those examples to maintained implementations and checks; it does not duplicate the article itself.

## Companion implementation

### CREATE, CREATE2, clones, transparent proxies, ERC-1967 slots, and UUPS upgrades

Code: `evm/foundry/src/Deployments.sol`

Run:

```bash
cd evm/foundry && forge test --offline --match-contract DeploymentsTest
```

## Verification boundary

The mapped deterministic tests or disposable local-chain scenario passed on 9 August 2026.
