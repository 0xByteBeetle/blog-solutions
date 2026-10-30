# Supplemental gap completion: What Every Blockchain Developer Should Know About EVM Internals – Part 2

Article-local companion for published block(s) 3, 5, 12, 13. Original excerpts in
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
Six tests demonstrate Ether receive/event fields, unknown-selector rejection
without fallback, payable fallback for empty/unknown calldata, lack of an external
selector for internalFunction, and encoded Token.transfer arguments/caller. The
mock token is supplemental, not an invented original token implementation. A
false token return is intentionally ignored by the original Caller; its test
records that limitation rather than silently fixing it. internalFunction's empty
body remains empty. A successful internal call does not imply invented state.

Anthology duplicates intentionally carry their own exact article-specific source
and local tests, so each article is self-contained rather than depending on a
sibling article. Trivial formatting differences are retained, not normalized away.
