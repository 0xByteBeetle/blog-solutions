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

**Do not run the transaction/signing entrypoints as tests.** They contain historical network addresses; the original account helper creates key files and prints private keys. The test command compiles those original entrypoints but runs only supplemental tests. Use a separately reviewed disposable local setup before execution; never use a funded/personal wallet. Keep the `transaction-types` directory name because the original helper uses it to resolve paths.

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
