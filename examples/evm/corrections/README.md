# Supplemental EVM boundary regressions

These are **assistant-authored corrections and tests**, not additional published
snippets. Original article extracts and recovered implementations remain unchanged.
They illustrate boundaries left out of pedagogical examples; this is not a
production security audit or a claim that all workshop examples are production code.

## Provenance and deliberate differences

| Variant/test | Preserved source | Change |
| --- | --- | --- |
| `solidity/src/GuardedToken.sol` | [`uups/src/UUPSLogicContract.sol`](../uups/src/UUPSLogicContract.sol), [UUPS article](https://andreyobruchkov1996.substack.com/p/proxies-and-upgradability-uups-proxy), block 1 | Copies original inheritance and storage layout; renames `MyToken` to `GuardedToken` and adds `require(!initialized, "Already initialized")` before initializer writes. No other algorithm changes. |
| Solidity proxy harness | [`uups/src/UUPSProxy.sol`](../uups/src/UUPSProxy.sol), same article block 2 | Imports original proxy without editing it. Tests demonstrate original reset behavior, then reject owner and nonowner reinitialization in the corrected variant, preserve balances and ownership, and exercise an owner upgrade/transfer. |
| Storage assertions | [`storage-validation/src/Storage.sol`](../storage-validation/src/Storage.sol), [article](https://andreyobruchkov1996.substack.com/p/gas-matters-how-to-reduce-transaction-costs-in-your-solidity-code-0c0303d61a4f), block 3 | Imports original unchanged. Checks both retrieved fields, overwrites including long/empty strings and 0/100 bounds, exact revert reason for 101, and unchanged state after rejection. |
| `rlp/encode/encode.go` | [`rlp/encode/encode.go`](../rlp/encode/encode.go), [original repository](https://github.com/bounty-wiz/RLP_EVM/tree/2dbcdaa835fc4e2fd64eea3a16303db2ba6f78d0) | Converts signed nonnegative integers to `uint64` and preserves unsigned width; never narrows an integer value to platform `int`. Adds a bounded 8-byte big-endian encoder. Existing string/list handling retained. |
| `rlp/decode/decode.go` | [`rlp/decode/decode.go`](../rlp/decode/decode.go), same original revision | Rejects unconsumed top-level input. Reads declared lengths into `uint64`, bounds against available bytes before narrowing to `int` or adding offsets. Existing payload/list decoding retained. |

Source hashes and extraction changes for the preserved originals are in
[`catalog/source-files.json`](../../../../catalog/source-files.json). This directory
must not be added there as author-source. Full blog prose is intentionally absent.

## Scope limits

- The token correction only prevents repeated initialization. It does not turn the
  simplified example into ERC-20/EIP-1967-compliant or production-ready code. Direct
  initialization of the implementation itself is still possible; `delegatedOnly`
  remains the original boolean-based teaching mechanism, not a proxy-context check.
- RLP tests cover integer conversion and framing/length boundaries, not complete
  Ethereum canonical-encoding validation. The decoder still accepts some noncanonical
  encodings. Do not use it as a consensus decoder. Unsupported/negative encoder
  inputs retain the original panic-style API.
- All Solidity execution is an ephemeral local test VM; no RPC, wallet, transaction
  submission, or deployed network contract is needed.

## Run from repository root

Requires Go >=1.23.10 (validated target Go 1.24.x), Foundry 1.4.4, and Solidity 0.8.30.
The Solidity project deliberately uses no forge-std or npm dependencies. Foundry may
need to download the pinned compiler on first use.

```sh
(cd examples/evm/corrections/rlp && go test ./...)
# On hosts that can execute 32-bit binaries, verify the platform-int boundary too:
(cd examples/evm/corrections/rlp && GOARCH=386 go test ./...)
(cd examples/evm/corrections/solidity && forge test -vv)
node scripts/check-catalog.mjs
node --test scripts/source-integrity.test.mjs
```

Execution status belongs in the audit verification report, not in source claims.
No runtime pass is implied merely by the presence of these tests.

## Verification — 2026-10-30

- Go **1.24.13**: native `go test -count=1 ./...` passes both corrected packages,
  including the original vectors and the new boundary tests.
- Foundry **1.4.4**, Solidity **0.8.30**: all **4** Solidity tests pass in the local VM.
  An initial import-resolution failure was fixed with explicit original-source
  remappings and allowed read paths in this supplemental project's config.
- The attempted `GOARCH=386 go test ./...` compiled but its test executables could
  not run on this host (`exec format error`). **32-bit runtime remains unverified**;
  this is not a behavioral test failure or a claimed pass.
- These checks do not execute any public-network transactions and do not establish
  live article freshness or full protocol compliance.
