# EVM Tx — Understanding Legacy Ethereum Transactions (Type 0x0)

[Read the article](https://andreyobruchkov1996.substack.com/p/evm-tx-understanding-legacy-ethereum).

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

Signs a chain-80002 legacy transaction, prints its RLP bytes and recovers the known signer. Tests independently form all nine EIP-155 signing fields, verify chain-protected v, reject a wrong-chain signer and check the official EIP-155 golden signing hash. A legacy envelope begins with its RLP list, not a typed transaction byte.

This supplemental route uses only deterministic, publicly known **NEVER-FUND** fixture keys in memory (integer 1, and integer 2 where needed). It does not call `account.GetAccount`, read/write key files, connect to RPC or broadcast. Original programs and dependency pins remain unchanged. [Primary EIP specification](https://eips.ethereum.org/EIPS/eip-155).
