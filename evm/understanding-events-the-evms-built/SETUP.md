# Article-local reproduction

Source: https://andreyobruchkov1996.substack.com/p/understanding-events-the-evms-built

## Scope

Event declaration, eth_getLogs request and historical response; standalone application not supplied/required by these blocks. Local event fixture would be supplemental.

**No standalone author program is missing or required for this article.** The exact reference snippets, commands and illustrative outputs are retained in `published.md`; they are not presented as a complete application.

This classification concerns the displayed material, not a claim that the full prose has been technically audited. Optional supplementary demonstrations below are assistant-authored labs, not recovered author programs.

## Optional supplementary demonstrations

Run these commands from this article directory. They are optional, not requirements to complete the conceptual article.

### Events, native-value accounting, metadata calls, and multicall behavior

Local source: `supplementary/foundry/src/Observability.sol`.

Requires Foundry 1.4.4 and Solidity 0.8.26. If the compiler is not cached, first run `forge build --root supplementary/foundry` with download access; the test command uses the local compiler.

```sh
cd supplementary/foundry && forge test --offline --match-contract ObservabilityTest
```

### Log topics, event decoding, and native-transfer trace interpretation

Local source: `supplementary/go/observability`.

Requires Go compatible with `supplementary/go/go.mod` (reproduction target Go 1.24.x). First build may fetch pinned modules. These package tests do not call a public blockchain.

```sh
cd supplementary/go && go test ./observability
```

### JSON-RPC request validation, batch correlation, and partial-error handling

Local source: `supplementary/go/rpcbatch`.

Requires Go compatible with `supplementary/go/go.mod` (reproduction target Go 1.24.x). First build may fetch pinned modules. These package tests do not call a public blockchain.

```sh
cd supplementary/go && go test ./rpcbatch
```

## Verification limits

Dated source freshness, source integrity and optional lab execution are separate. Historical reports retain historical paths/dates; moving this directory does not imply a new execution pass. No public-network transaction is authorized by these instructions.
