# EVM Tx — SetCode Transactions EIP-7702 Temporary Smart-Account Power for EOAs Explained

[Read the article](https://andreyobruchkov1996.substack.com/p/evm-tx-setcode-transactions-eip-7702).

The article code is preserved; build configuration and focused tests are supplemental. Run commands from this folder.

## Run the Solidity examples

From this article folder, run `make build` and `make test`. Each nested project keeps its own compiler pin and focused tests:

- `delegation/`: [foundry.toml](delegation/foundry.toml), [src/](delegation/src/), [test/](delegation/test/).

These tests need only the installed Foundry toolchain.

### delegation

Tested toolchain: Foundry 1.4.4; compiler pinned to 0.8.30.

```sh
(cd delegation && forge build && forge test)
```

### transaction-types

Go 1.23.10 or compatible. Dependencies are pinned by go.mod/go.sum.

```sh
(cd transaction-types && go test ./...)
```

**Do not run the transaction/signing entrypoints as tests.** They contain historical network addresses; the original account helper creates key files and prints private keys. The command compiles the preserved entrypoints and runs only supplemental tests. Use a separately reviewed disposable local setup before execution; never use a funded/personal wallet. Keep the `transaction-types` directory name because the original helper uses it to resolve paths.

Delegation tests use synthetic designation bytes to exercise routing, event callers and rejection paths. They do not submit a signed EIP-7702 authorization transaction.

### What the preserved EIP-7702 invoker demonstrates

`MultiDelegationInvoker` reads the `0xef0100 || address` designation and calls the extracted module directly with `someModule.call(...)`. Consequently the module sees **the invoker contract as `msg.sender`**, and emits from the module address. This is not execution through the designated EOA; protocol delegation would execute the target code in the authority account's context. `testDesignationRoutesToModuleAndRecordsInvokerAsSender` checks this distinction explicitly.

Under [EIP-7702](https://eips.ethereum.org/EIPS/eip-7702), the designation is persistent account code until a later authorization replaces or clears it; it is not temporary for one transaction. These tests install synthetic bytes with `vm.etch`. They validate the printed invoker's parsing/call behavior, not SetCode transaction authorization, signature validation, or protocol delegation.

## Execute the offline fixture

```sh
cd transaction-types
go run ./offline
go test ./...
```

Signs two EIP-7702 authorizations with public fixture keys 1 and 2 and serializes a type-0x04 SetCode envelope. The outer sender’s authorization uses outer nonce + 1; the other authority uses its own nonce 0. Tests independently form 0x05 || RLP(chain_id,address,nonce), recover authorities across signed/unsigned-64-bit boundaries, reject nonce 2^64−1, and check the outer envelope/sender/chain. This minimal cryptography example omits invoker calldata and does **not execute protocol delegation**. The preserved historical helper narrows nonce to int64; its additional test records that limitation while this route uses geth’s unsigned SDK helper.

This supplemental route uses only deterministic, publicly known **NEVER-FUND** fixture keys in memory (integer 1, and integer 2 where needed). It does not call `account.GetAccount`, read/write key files, connect to RPC or broadcast. Original programs and dependency pins remain unchanged. [Primary EIP specification](https://eips.ethereum.org/EIPS/eip-7702).

## Execute the complete native workflow on owned local Prague Anvil

```sh
# From this article folder; existing Foundry 1.4.4 and Go are required.
(cd transaction-types && go run ./local)                 # plan only
(cd transaction-types && go run ./local --execute-local)
```

The supplemental `local/` route accepts no external RPC URL, keypair path or wallet. With the explicit flag it starts its own in-memory loopback Anvil using `--hardfork prague --chain-id 31337`, checks the actual `anvil_nodeInfo` hardfork/client/chain **before submitting anything**, then deploys the unchanged `Invoked` and `MultiDelegationInvoker` contracts. Exact deployed runtime bytecode is checked. It uses public NEVER-FUND fixture keys 1/2 and the public Anvil account 0 only; local balance setup uses `anvil_setBalance`, with no key files or public network.

It ABI-packs `triggerPings([authority1,authority2])` and independently checks its 132 bytes of selector/array words. Authority 1 signs nonce 0; authority 2 is the outer sender at nonce 0 and signs authorization nonce 1, accounting for the sender increment before authorization processing. The native type-4 transaction uses the article's 120,000 gas limit. The runner reads the mined transaction/receipt and requires:

- successful type-4 receipt and the expected calldata/authorization list;
- actual `0xef0100 || module` code on both authority accounts, with final nonces **1 and 2**;
- `PingStart`, two module `Pinged` events and two `PingSuccess` events, in order, with their actual emitter/caller/address values;
- designation bytes still present after mining another block.

The run prints the observed transaction, contract addresses, nonces, event count and gas used, then stops its owned node even on failure. It never uses `vm.etch` or `anvil_setCode`: these observations exercise native EIP-7702 authorization processing. A runtime that cannot start Prague or accept type 4 fails explicitly; the runner does not upgrade tools or fall back to synthetic designation bytes.

**Application behavior remains the printed behavior:** `Pinged` is emitted from `Invoked`, and its caller is `MultiDelegationInvoker`, because that contract calls the extracted module directly. This native authorization run does not turn that direct call into execution through the designated EOA's context. The designators persist beyond the transaction; they are not temporary. The separate `delegation/` Forge tests above remain synthetic unit tests, and `go run ./offline` remains an offline cryptography-only example.
