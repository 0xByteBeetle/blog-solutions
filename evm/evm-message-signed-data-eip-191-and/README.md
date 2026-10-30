# EVM Message — Signed Data EIP-191 and the Ethereum Message Prefix

[Read the article](https://andreyobruchkov1996.substack.com/p/evm-message-signed-data-eip-191-and).

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

Signs `Login to app.xyz` with the EIP-191 prefix. Its UTF-8 byte length is **16**; empty and multibyte inputs have independent Cast-derived golden hashes. Tests recover the known signer and show that a changed message or unprefixed hash does not recover it. Go uses a 0/1 recovery byte; wallet APIs may expose 27/28.

This supplemental route uses only deterministic, publicly known **NEVER-FUND** fixture keys in memory (integer 1, and integer 2 where needed). It does not call `account.GetAccount`, read/write key files, connect to RPC or broadcast. Original programs and dependency pins remain unchanged. [Primary EIP specification](https://eips.ethereum.org/EIPS/eip-191).
