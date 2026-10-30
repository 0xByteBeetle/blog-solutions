# Understanding Ethereum Transactions and Messages: From State Changes to Off-Chain Messages — Part 1

[Read the article](https://andreyobruchkov1996.substack.com/p/understanding-ethereum-transactions-and-messages-from-state-changes-to-off-chain-messages-part-1-54130865e71e).

The article code is preserved; build configuration and focused tests are supplemental. Run commands from this folder.

### rlp

Go 1.23.10 or compatible. Dependencies are pinned by go.mod/go.sum.

```sh
cd rlp
go test ./...
```

### transaction-types

Go 1.23.10 or compatible. Dependencies are pinned by go.mod/go.sum.

```sh
cd transaction-types
go test -run '^$' ./...
```

**Do not run the transaction/signing entrypoints as tests.** They contain historical network addresses; the original account helper creates key files and prints private keys. The command above compiles only. Use a separately reviewed disposable local setup before execution; never use a funded/personal wallet. Keep the `transaction-types` directory name because the original helper uses it to resolve paths.

## Access-list, dynamic-fee and personal signatures

The preserved programs are `transaction-types/eip2930/eip2930.go`, `eip1559/eip1559.go`, and `personalsign/personalsign.go`. They retain the original account helper and network defaults. Use this supplemental offline demonstration instead of running those entrypoints:

```sh
cd transaction-types
go run ./offline
go test ./...
```

It constructs the same AccessListTx / DynamicFeeTx formats with the article's token transfer calldata and two access-list storage keys. Fixed nonce, gas and fee inputs replace RPC lookups: a 1 gwei base fee buffered by 112%, plus a 2 gwei tip, gives a 3.12 gwei cap. The printed signed envelopes begin `0x01` and `0x02`. Tests round-trip the bytes, recover the signer, reject the wrong chain, and check fields/fee math.

`Login to app.xyz` is prefixed with `\x19Ethereum Signed Message:\n15` and signed/recovered entirely offline. Tests independently form the prefix and reject a changed message. The fixture key is the publicly known integer 1, held only in memory: no account helper, key file, RPC, or broadcast is used. Go's signature recovery byte is 0/1; some wallet interfaces expose it as 27/28. These fixed values demonstrate encoding/signing, not current network fee estimates.
