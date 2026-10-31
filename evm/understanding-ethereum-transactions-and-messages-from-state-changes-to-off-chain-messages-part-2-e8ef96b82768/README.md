# Understanding Ethereum Transactions and Messages: From State Changes to Off-Chain Messages — Part 2

[Read the article](https://andreyobruchkov1996.substack.com/p/understanding-ethereum-transactions-and-messages-from-state-changes-to-off-chain-messages-part-2-e8ef96b82768).

The article code is preserved; build configuration and focused tests are supplemental. Run commands from this folder.

Install the dependencies actually imported by these examples (Node.js/npm and Git):

```sh
node setup.mjs
```

## Run the Solidity examples

From this article folder, run `make build` and `make test`. Each nested project keeps its own compiler pin and focused tests:

- `delegation/`: [foundry.toml](delegation/foundry.toml), [src/](delegation/src/), [test/](delegation/test/).
- `permit-verifier/`: [foundry.toml](permit-verifier/foundry.toml), [src/](permit-verifier/src/), [test/](permit-verifier/test/).

The Makefile restores only this article’s pinned dependencies through `setup.mjs`. OpenZeppelin is installed inside `permit-verifier/node_modules/` from that project’s package lock.

### permit-verifier

Tested toolchain: Foundry 1.4.4; compiler pinned to 0.8.30.

```sh
(cd permit-verifier && forge build && forge test)
```

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

**Do not run the transaction/signing entrypoints as tests.** They contain historical network addresses; the original account helper creates key files and prints private keys. The test command compiles those original entrypoints but runs only supplemental tests. Use only the explicit supplemental local routes below for execution; never use a funded/personal wallet. Keep the `transaction-types` directory name because the original helper uses it to resolve paths.

The permit tests cover signature and domain binding, including the original helper’s lack of expiry and nonce consumption. Delegation tests use synthetic designation bytes to exercise the invoker; they do not submit a signed EIP-7702 authorization transaction.

### What the preserved EIP-7702 invoker demonstrates

`MultiDelegationInvoker` reads the `0xef0100 || address` designation and calls the extracted module directly with `someModule.call(...)`. Consequently the module sees **the invoker contract as `msg.sender`**, and emits from the module address. This is not execution through the designated EOA; protocol delegation would execute the target code in the authority account's context. `testDesignationRoutesToModuleAndRecordsInvokerAsSender` checks this distinction explicitly.

Under [EIP-7702](https://eips.ethereum.org/EIPS/eip-7702), the designation is persistent account code until a later authorization replaces or clears it; it is not temporary for one transaction. These tests install synthetic bytes with `vm.etch`. They validate the printed invoker's parsing/call behavior, not SetCode transaction authorization, signature validation, or protocol delegation.

## Blob and typed-data workflows

The older article also prints the blob/KZG program and the EIP-712 signer plus `eth_call`; these are restored in `transaction-types/eip4844/` and `eip712/`. Import declarations supply the omitted excerpt context. The public [c-kzg setup](https://github.com/ethereum/c-kzg-4844/blob/main/src/trusted_setup.txt) is in `eip4844/trusted_setup.txt`, where the original relative path expects it. It is public protocol data, not a key. Do not run the historical broadcast programs as tests.

The supplemental routes use only public NEVER-FUND fixture key 1, a fixed deadline, and deterministic nonce/fees. Existing geth/uint256 versions are unchanged; the missing original import requires adding samber/lo 1.51.0 (the same pin as the standalone article). From this article directory:

```sh
(cd transaction-types && go test ./...)
(cd transaction-types && go run ./offline/eip4844)
(cd transaction-types && go run ./offline/eip712)
node setup.mjs
python3 permit_local.py
```

The blob route retains the article's exact ASCII bytes and zero padding, which pass canonical-scalar validation for this particular payload. Arbitrary blob bytes are not guaranteed valid field elements; a separate invalid-scalar test checks rejection. It computes and verifies a real KZG proof, independently checks the SHA-256 versioned hash, signs a Sepolia type-3 envelope and distinguishes core serialization from the sidecar network wrapper. The supplemental route uses geth's bundled public Go setup; loading the original c-kzg file does not configure that separate Go backend. These checks prove neither network acceptance nor consensus availability.

`permit_local.py` starts its own in-memory Cancun Anvil, deploys the original `PermitVerifier`, and invokes the Go signer against that explicit loopback URL/address. It uses the local chain ID in the domain and checks actual `eth_call` results: the signed 1e18 value returns true; changing the value returns false. No token allowance is set, expiry enforced, or nonce consumed: this is the article's signature-only view helper. The owned node is stopped even after failure. Requires existing Forge/Cast/Anvil 1.4.4, Go and a C compiler for compiling the preserved c-kzg imports.

## Two-authority native SetCode batch on an owned local node

This supplemental route is self-contained in this article and preserves both printed authorities and the sponsor nonce rule. With installed Foundry/Anvil 1.4.4 and the pinned Go dependencies:

```sh
cd transaction-types
go test ./offline/eip7702
go run ./offline/eip7702
go run ./local7702                 # plan only
go run ./local7702 --execute-local
```

The adapter starts and stops its own loopback Prague Anvil (chain 31337); it accepts no external RPC or key input. It deploys the preserved `Invoked` and `MultiDelegationInvoker`, discovers both pending nonces, signs authority 1 at its pending nonce and sponsor authority 2 at pending nonce + 1, then signs/sends the outer type-4 transaction at the sponsor's pending nonce. Public integer keys 1/2 and Anvil account 0 are **NEVER-FUND fixtures**. Only local test balances are assigned.

Checks cover the real mined authorization list, 132-byte `triggerPings` input, receipt success/type, five event emitters/arguments, account nonces and both `ef0100 || module` designators persisting after another block. The original invoker calls the module directly: `Pinged` sees the invoker as caller. This does not demonstrate executing `ping` through the delegated EOA. The existing `vm.etch` test remains synthetic; the local route separately validates native authorizations. SIGINT/SIGTERM and ordinary errors stop and await only the owned child. Local acceptance does not establish public-chain acceptance.

## Query, send and inspect an owned-local receipt

This supplemental adapter requires installed Anvil/Foundry **1.4.4**, the pinned Go dependencies. It accepts no RPC URL or wallet argument. Run from this article:

```sh
cd transaction-types
go run ./localblob                 # plan only
go run ./localblob --execute-local
```

It starts and awaits cleanup of its own loopback Cancun Anvil (chain 31337), checks its chain/fork/client before any mutation, and uses only public **NEVER-FUND** integer fixture keys 1/2. Success, errors and handled SIGINT/SIGTERM terminate and await only the owned child. No default wallet, original account helper or public endpoint is used. Local acceptance is separate from offline signing/KZG checks and does not establish public-chain consensus or mempool acceptance.

The blob route queries the pending nonce, five-block fee history, suggested tip and gas estimate; retains the printed recipient, **10^14 wei**, empty calldata and **2,000,000 wei blob fee cap**. It packs the article’s complete text into canonical zero-high-byte field elements (a labeled correction to raw byte copying), reconstructs that text, computes/verifies a real KZG proof with geth’s bundled Go setup, then signs/submits a type-3 sidecar. Checks require successful type-3 receipt, value/nonce effects, the versioned hash, **131,072 blob gas used**, and positive blob gas price within its cap. BlobGasUsed is not ExcessBlobGas. This local execution does not test beacon availability or historical public receipts.
