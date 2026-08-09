# Deployments & Deterministic Addresses (CREATE vs CREATE2)

[Read the article on Substack](https://andreyobruchkov1996.substack.com/p/deployments-and-deterministic-addresses)

Published: 2025-11-08

The article contains 11 displayed code or output blocks. This page maps those examples to maintained implementations and checks; it does not duplicate the article itself.

## Companion implementation

### CREATE, CREATE2, clones, transparent proxies, ERC-1967 slots, and UUPS upgrades

Code: `evm/foundry/src/Deployments.sol`

Run:

```bash
cd evm/foundry && forge test --offline --match-contract DeploymentsTest
```

## Verification boundary

The mapped deterministic tests or disposable local-chain scenario passed on 9 August 2026.
