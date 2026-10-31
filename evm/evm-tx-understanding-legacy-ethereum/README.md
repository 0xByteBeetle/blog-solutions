# EVM Tx — Understanding Legacy Ethereum Transactions (Type 0x0)

[Read the article](https://andreyobruchkov1996.substack.com/p/evm-tx-understanding-legacy-ethereum).

The article code is preserved; build configuration and focused tests are supplemental. Run commands from this folder.

### transaction-types

Go 1.23.10 or compatible. Dependencies are pinned by go.mod/go.sum.

```sh
cd transaction-types
go test -run '^$' ./...
```

**Do not run the transaction/signing entrypoints as tests.** They contain historical network addresses; the original account helper creates key files and prints private keys. The command above compiles only. Use the explicit supplemental local route below for execution; never use a funded/personal wallet. Keep the `transaction-types` directory name because the original helper uses it to resolve paths.

## Execute the offline fixture

```sh
cd transaction-types
go run ./offline
go test ./...
```

Signs a chain-80002 legacy transaction, prints its RLP bytes and recovers the known signer. Tests independently form all nine EIP-155 signing fields, verify chain-protected v, reject a wrong-chain signer and check the official EIP-155 golden signing hash. A legacy envelope begins with its RLP list, not a typed transaction byte.

This supplemental route uses only deterministic, publicly known **NEVER-FUND** fixture keys in memory (integer 1, and integer 2 where needed). It does not call `account.GetAccount`, read/write key files, connect to RPC or broadcast. Original programs and dependency pins remain unchanged. [Primary EIP specification](https://eips.ethereum.org/EIPS/eip-155).

## Query, send and inspect an owned-local receipt

This supplemental adapter requires installed Anvil/Foundry **1.4.4**, the pinned Go dependencies. It accepts no RPC URL or wallet argument. Run from this article:

```sh
cd transaction-types
go run ./local                 # plan only
go run ./local --execute-local
```

It starts and awaits cleanup of its own loopback Cancun Anvil (chain 31337), checks its chain/fork/client before any mutation, and uses only public **NEVER-FUND** integer fixture keys 1/2. Success, errors and handled SIGINT/SIGTERM terminate and await only the owned child. No default wallet, original account helper or public endpoint is used. Local acceptance is separate from offline signing/KZG checks and does not establish public-chain consensus or mempool acceptance.

The legacy route queries the pending nonce and suggested gas price, signs an EIP-155 type-0 transfer of the article’s **0.01 ETH (10^16 wei)** and checks mined type/status/fields, nonce advancement and the recipient balance delta.
