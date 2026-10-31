# EVM Tx — Dynamic Fee Transactions EIP-1559 (Type 0x02) Explained

[Read the article](https://andreyobruchkov1996.substack.com/p/evm-tx-dynamic-fee-transactions-eip).

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

Signs a type-0x02 DynamicFeeTx using the article’s token calldata. Fixed base fee 1 gwei and tip 2 gwei give floor(base × 112 / 100) + tip = 3.12 gwei fee cap. Tests check rounding, zero/negative/uint256-overflow boundaries, typed RLP signing fields, sender and wrong-chain rejection. These are fixture fees, not network quotes or inclusion guarantees.

This supplemental route uses only deterministic, publicly known **NEVER-FUND** fixture keys in memory (integer 1, and integer 2 where needed). It does not call `account.GetAccount`, read/write key files, connect to RPC or broadcast. Original programs and dependency pins remain unchanged. [Primary EIP specification](https://eips.ethereum.org/EIPS/eip-1559).

### Discover dynamic-fee inputs (optional read-only RPC)

```sh
python3 discover.py
python3 -m unittest discover -s tests -v
python3 discover.py  --rpc-url "$RPC_URL" --chain-id 80002
```

The default five-block fixture is **synthetic**, with 1 gwei base fee and 2 gwei tip; the output cap is 3.12 gwei. Live mode checks the explicit chain ID, requests `eth_feeHistory ["0x5","latest",[]]` and `eth_maxPriorityFeePerGas`, matching the article's Go client methods. It validates the returned block/base-fee arrays and computes the article's integer formula `floor(lastBaseFee * 112 / 100) + tip`. The last base-fee entry predicts the **next block**, not the last sampled block. This historical 12% policy is an arithmetic example, not fee advice or an inclusion guarantee. Unsupported RPC methods, malformed history and chain mismatches fail explicitly. No wallet/signing/broadcast occurs.
