# Article-local reproduction

Source: https://andreyobruchkov1996.substack.com/p/whats-behind-your-rpc-node-types

## Scope

No displayed code in captured article; no code companion to fabricate.

**No standalone author program is missing or required for this article.** The published page contains no displayed code blocks.

This classification concerns the displayed material, not a claim that the full prose has been technically audited. Optional supplementary demonstrations below are assistant-authored labs, not recovered author programs.

## Optional supplementary demonstrations

Run these commands from this article directory. They are optional, not requirements to complete the conceptual article.

### Successful and reverting call paths designed for opcode-level tracing

Local source: `supplementary/foundry/src/Tracing.sol`.

Requires Foundry 1.4.4 and Solidity 0.8.26. If the compiler is not cached, first run `forge build --root supplementary/foundry` with download access; the test command uses the local compiler.

```sh
cd supplementary/foundry && forge test --offline --match-contract TracingTest
```

### Real eth_call and debug_traceCall responses from a disposable Anvil node

Local source: `supplementary/rpc/run-local.sh`.

Requires Bash, Node.js 22+, Foundry 1.4.4 (`anvil`, `cast`, `forge`) and the Solidity 0.8.26 compiler. Starts and stops its own loopback Anvil node, deploys the supplementary trace fixture using disposable local test accounts, and refuses external/occupied RPC endpoints. Run only when local test-node execution is authorized.

```sh
./supplementary/rpc/run-local.sh
```

### JSON-RPC request validation, batch correlation, and partial-error handling

Local source: `supplementary/go/rpcbatch`.

Requires Go compatible with `supplementary/go/go.mod` (reproduction target Go 1.24.x). First build may fetch pinned modules. These package tests do not call a public blockchain.

```sh
cd supplementary/go && go test ./rpcbatch
```

## Verification limits

Dated source freshness, source integrity and optional lab execution are separate. Historical reports retain historical paths/dates; moving this directory does not imply a new execution pass. No public-network transaction is authorized by these instructions.
