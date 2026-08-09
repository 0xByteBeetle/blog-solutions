# Proxies and Upgradability - UUPS proxy (EIP-1822)

[Read the article on Substack](https://andreyobruchkov1996.substack.com/p/proxies-and-upgradability-uups-proxy)

Published: 2025-11-08

The article contains 5 displayed code or output blocks. This page maps those examples to maintained implementations and checks; it does not duplicate the article itself.

## Companion implementation

### CREATE, CREATE2, clones, transparent proxies, ERC-1967 slots, and UUPS upgrades

Code: `evm/foundry/src/Deployments.sol`

Run:

```bash
cd evm/foundry && forge test --offline --match-contract DeploymentsTest
```

## Verification boundary

The mapped deterministic tests or disposable local-chain scenario passed on 9 August 2026.
