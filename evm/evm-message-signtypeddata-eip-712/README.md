# EVM Message — SignTypedData EIP-712 Secure Off-Chain Signatures for Real-World Ethereum Apps Explained

[Read the article](https://andreyobruchkov1996.substack.com/p/evm-message-signtypeddata-eip-712).

The article code is preserved; build configuration and focused tests are supplemental. Run commands from this folder.

Install the dependencies actually imported by these examples (Node.js/npm and Git):

```sh
node setup.mjs
```

## Run the Solidity examples

From this article folder, run `make build` and `make test`. Each nested project keeps its own compiler pin and focused tests:

- `permit-verifier/`: [foundry.toml](permit-verifier/foundry.toml), [src/](permit-verifier/src/), [test/](permit-verifier/test/).

The Makefile restores only this article’s pinned dependencies through `setup.mjs`. OpenZeppelin is installed inside `permit-verifier/node_modules/` from that project’s package lock.

### permit-verifier

Tested toolchain: Foundry 1.4.4; compiler pinned to 0.8.30.

```sh
(cd permit-verifier && forge build && forge test)
```

### transaction-types

Go 1.23.10 or compatible. Dependencies are pinned by go.mod/go.sum.

```sh
(cd transaction-types && go test ./...)
```

**Do not run the transaction/signing entrypoints as tests.** They contain historical network addresses; the original account helper creates key files and prints private keys. The command compiles the preserved entrypoints and runs only supplemental tests. Use a separately reviewed disposable local setup before execution; never use a funded/personal wallet. Keep the `transaction-types` directory name because the original helper uses it to resolve paths.

The permit tests cover typed-data fields and the verifying-contract domain. The original view helper accepts a correctly signed expired payload and does not consume nonces; those limitations are asserted explicitly.

## Execute the offline fixture

```sh
cd transaction-types
go run ./offline
go test ./...
```

Signs the article’s MyDApp/Permit structure with fixed chain 80002, verifier, value, nonce 0 and deadline 2000000000. Tests independently form domain/struct ABI words and the 0x1901 digest, then change domain fields, spender, nonce and deadline. This is cryptographic binding, not an expiry, nonce-consumption or replay-protection implementation; the preserved verifier’s limits still apply.

This supplemental route uses only deterministic, publicly known **NEVER-FUND** fixture keys in memory (integer 1, and integer 2 where needed). The default offline command does not call `account.GetAccount`, read/write key files, connect to RPC or broadcast. Original programs and dependency pins remain unchanged. [Primary EIP specification](https://eips.ethereum.org/EIPS/eip-712).

## Complete wallet steps 4–6 locally: ABI pack → eth_call → bool

```sh
# From this article folder, with existing Forge/Cast/Anvil 1.4.4 and Go:
node setup.mjs
python3 permit_local.py
```

This supplemental adapter starts its own in-memory Cancun Anvil, deploys the preserved `PermitVerifier`, then runs the Go signer with its explicit loopback URL/address. It retains the article's MyDApp/1 domain, Permit fields, 1e18 value and nonce 0, with public NEVER-FUND key 1 and a fixed deadline. The local chain ID and deployed verifier address replace historical network inputs. Go uses `abi.Pack`, independently checks the eight ABI argument words, calls `verifyPermit` via **actual eth_call**, uses `abi.Unpack` to decode the returned bool and requires true for the signed value and false after changing it. The node is stopped afterward; no wallet files or original account helper are used.

For inspection, the adapter invokes `go run ./offline --rpc-url http://127.0.0.1:PORT --verifier LOCAL_VERIFIER_ADDRESS` inside `transaction-types`. That opt-in mode rejects nonloopback/ambiguous URLs and requires chain 31337. Running `go run ./offline` without flags remains fully offline. These are view-signature checks: the original verifier still does not implement a token permit, expiry enforcement, nonce consumption or allowance changes.
