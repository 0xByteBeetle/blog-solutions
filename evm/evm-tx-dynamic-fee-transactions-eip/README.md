# EVM Tx — Dynamic Fee Transactions EIP-1559 (Type 0x02) Explained

[Read the article](https://andreyobruchkov1996.substack.com/p/evm-tx-dynamic-fee-transactions-eip).

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

Signs a type-0x02 DynamicFeeTx using the article’s token calldata. Fixed base fee 1 gwei and tip 2 gwei give floor(base × 112 / 100) + tip = 3.12 gwei fee cap. Tests check rounding, zero/negative/uint256-overflow boundaries, typed RLP signing fields, sender and wrong-chain rejection. These are fixture fees, not network quotes or inclusion guarantees.

This supplemental route uses only deterministic, publicly known **NEVER-FUND** fixture keys in memory (integer 1, and integer 2 where needed). It does not call `account.GetAccount`, read/write key files, connect to RPC or broadcast. Original programs and dependency pins remain unchanged. [Primary EIP specification](https://eips.ethereum.org/EIPS/eip-1559).

### Discover dynamic-fee inputs (optional read-only RPC)

```sh
python3 discover.py
python3 -m unittest discover -s tests -v
python3 discover.py  --rpc-url "$RPC_URL" --chain-id 80002
```

The default five-block fixture is **synthetic**, with 1 gwei base fee and 2 gwei tip; the output cap is 3.12 gwei. Live mode checks the explicit chain ID, requests `eth_feeHistory ["0x5","latest",[]]` and `eth_maxPriorityFeePerGas`, matching the article's Go client methods. It validates the returned block/base-fee arrays and computes the article's integer formula `floor(lastBaseFee * 112 / 100) + tip`. The last base-fee entry predicts the **next block**, not the last sampled block. This historical 12% policy is an arithmetic example, not fee advice or an inclusion guarantee. Unsupported RPC methods, malformed history and chain mismatches fail explicitly. No wallet/signing/broadcast occurs.

## Query, send and inspect an owned-local receipt

This supplemental adapter requires installed Anvil/Foundry **1.4.4**, the pinned Go dependencies and cached Solidity **0.8.30**. It accepts no RPC URL or wallet argument. Run from this article:

```sh
cd transaction-types
go run ./local                 # plan only
go run ./local --execute-local
```

It starts and awaits cleanup of its own loopback Cancun Anvil (chain 31337), checks its chain/fork/client before any mutation, and uses only public **NEVER-FUND** integer fixture keys 1/2 and Anvil account 0. Success, errors and handled SIGINT/SIGTERM terminate and await only the owned child. No default wallet, original account helper or public endpoint is used. Local acceptance is separate from offline signing/KZG checks and does not establish public-chain consensus or mempool acceptance.

The dynamic route uses the article’s exact `transfer(address,uint256)` input: recipient `0x8056361b1c1361436D61D187d761233b42d1c20e`, amount **10^17 raw units**. `local-token/` is a labeled minimal prerequisite replacing the historical token address with a freshly deployed address; it is not a production token. Runtime bytecode, both balance deltas and indexed `Transfer` receipt fields are checked. Type 2 queries five-block fee history and the suggested tip, retains the printed integer `baseFee * 112 / 100 + tip` fee-cap formula, estimates gas, and checks the effective execution price against its cap. Each send uses a fresh pending nonce.
