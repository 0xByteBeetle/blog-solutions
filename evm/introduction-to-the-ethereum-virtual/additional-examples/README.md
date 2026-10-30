# Supplemental gap completion: Introduction to the Ethereum Virtual Machine (EVM)

Article-local companion for published block(s) 1. Original excerpts in
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
Two tests exercise the original CalldataExample.setName: stored value matches,
a later call replaces it, a string crossing the storage-word boundary persists,
and an empty string clears it. No author semantics were changed. The test proves
observable storage behavior, not a gas benchmark or memory-layout equivalence.

Anthology duplicates intentionally carry their own exact article-specific source
and local tests, so each article is self-contained rather than depending on a
sibling article. Trivial formatting differences are retained, not normalized away.
