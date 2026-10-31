# EVM Tx — Access List Transactions EIP-2930 (Type 0x01) Explained

[Read the article](https://andreyobruchkov1996.substack.com/p/evm-tx-access-list-transactions-eip).

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

Signs a type-0x01 AccessListTx using the article’s token transfer calldata and two storage keys. Tests independently form the typed RLP signing payload, check fields/serialization/sender, reject a wrong-chain signer, and show that changing a storage key changes the signed hash. Fixed nonce/gas/fees replace RPC queries; no gas-saving claim is measured.

This supplemental route uses only deterministic, publicly known **NEVER-FUND** fixture keys in memory (integer 1, and integer 2 where needed). It does not call `account.GetAccount`, read/write key files, connect to RPC or broadcast. Original programs and dependency pins remain unchanged. [Primary EIP specification](https://eips.ethereum.org/EIPS/eip-2930).

### Discover an access list (optional read-only RPC)

The default fixture is the article's printed response; it is not a current node observation. Requires Python 3.10+, standard library only:

```sh
python3 discover.py
python3 -m unittest discover -s tests -v
# Opt in explicitly; FROM is a public address only, never a private key.
python3 discover.py  --rpc-url "$RPC_URL" --chain-id 80002 \
  --from "$FROM" --to 0x0Fd9e8d3aF1aaee056EB9e802c3A762a667b1904 \
  --data 0xa9059cbb0000000000000000000000008056361b1c1361436d61d187d761233b42d1c20e0000000000000000000000000000000000000000000000000de0b6b3a7640000
```

Set `RPC_URL` to the node/network you intend to inspect and check the expected chain ID. The script checks `eth_chainId`, then sends the article's `eth_createAccessList` parameters (`pending`, gas `0x50000`, gasPrice `0x6fee2d00`). Addresses/calldata are explicit inputs; the gas fields preserve the historical example and may now be unsuitable for that node. A provider may not support this method or may return an execution error if the sender lacks tokens/gas or the call reverts. Errors stop the script; no historical list is substituted. A discovered list reflects that call and state, and does not guarantee a gas saving or future execution success. No wallet, signature or broadcast is used. The curl example transfers 1 token in calldata; the preserved Go program uses a different amount, so do not assume their lists describe identical state transitions.

## Query, send and inspect an owned-local receipt

This supplemental adapter requires installed Anvil/Foundry **1.4.4**, the pinned Go dependencies and cached Solidity **0.8.30**. It accepts no RPC URL or wallet argument. Run from this article:

```sh
cd transaction-types
go run ./local                 # plan only
go run ./local --execute-local
```

It starts and awaits cleanup of its own loopback Cancun Anvil (chain 31337), checks its chain/fork/client before any mutation, and uses only public **NEVER-FUND** integer fixture keys 1/2 and Anvil account 0. Success, errors and handled SIGINT/SIGTERM terminate and await only the owned child. No default wallet, original account helper or public endpoint is used. Local acceptance is separate from offline signing/KZG checks and does not establish public-chain consensus or mempool acceptance.

The access route uses the article’s exact `transfer(address,uint256)` input: recipient `0x8056361b1c1361436D61D187d761233b42d1c20e`, amount **10^17 raw units**. `local-token/` is a labeled minimal prerequisite replacing the historical token address with a freshly deployed address; it is not a production token. Runtime bytecode, both balance deltas and indexed `Transfer` receipt fields are checked. Type 1 discovers a fresh `eth_createAccessList`, estimates with that list and verifies the mined list is present. Each send uses a fresh pending nonce.
