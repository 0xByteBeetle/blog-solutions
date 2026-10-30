# EVM Tx — Access List Transactions EIP-2930 (Type 0x01) Explained

[Read the article](https://andreyobruchkov1996.substack.com/p/evm-tx-access-list-transactions-eip).

The article code is preserved; build configuration and focused tests are supplemental. Run commands from this folder.

### transaction-types

Go 1.23.10 or compatible. Dependencies are pinned by go.mod/go.sum.

```sh
cd transaction-types
go test -run '^$' ./...
```

**Do not run the transaction/signing entrypoints as tests.** They contain historical network addresses; the original account helper creates key files and prints private keys. The command above compiles only. Use a separately reviewed disposable local setup before execution; never use a funded/personal wallet. Keep the `transaction-types` directory name because the original helper uses it to resolve paths.

## Execute the offline fixture

```sh
cd transaction-types
go run ./offline
go test ./...
```

Signs a type-0x01 AccessListTx using the article’s token transfer calldata and two storage keys. Tests independently form the typed RLP signing payload, check fields/serialization/sender, reject a wrong-chain signer, and show that changing a storage key changes the signed hash. Fixed nonce/gas/fees replace RPC queries; no gas-saving claim is measured.

This supplemental route uses only deterministic, publicly known **NEVER-FUND** fixture keys in memory (integer 1, and integer 2 where needed). It does not call `account.GetAccount`, read/write key files, connect to RPC or broadcast. Original programs and dependency pins remain unchanged. [Primary EIP specification](https://eips.ethereum.org/EIPS/eip-2930).
