# Supplemental gap completion: Diamonds in EVM: The Proxy That Scales Beyond Limits

Article-local companion for published block(s) 25. Original excerpts in
`published/` remain byte-for-byte preserved; see `source-map.json`. Source taken
from the verified repository snapshot, not recreated from the article title.

## Requirements and run

Foundry 1.4.4 and Solidity 0.8.30. The article-local foundry.toml pins the compiler
and Cancun EVM. There are no external Solidity libraries, root node_modules,
sibling projects or shared forge-std imports. A cached compiler or initial
compiler download is needed. From this directory:

```sh
forge build
forge test -vv
```

`src/` files add only a clearly labeled compiler pragma/comment before each exact
published body. `test/Behavior.t.sol` is separate supplemental test scaffolding.
No RPC, wallet, deployment, public transaction or personal configuration is used.
Tests run inside Foundry's local VM. `verification.json` records actual results.

## Behavior and preservation limits
Two tests exercise the exact CounterStorage library through a supplemental
wrapper: the designated keccak slot changes while slot 0 stays 77; two contracts
retain independent namespace state and allow overwrite. The original diamond
facets are NOT rewritten to use this alternative layout. This completes the
standalone displayed library example, not a storage migration or full diamond
security review.

Anthology duplicates intentionally carry their own exact article-specific source
and local tests, so each article is self-contained rather than depending on a
sibling article. Trivial formatting differences are retained, not normalized away.
