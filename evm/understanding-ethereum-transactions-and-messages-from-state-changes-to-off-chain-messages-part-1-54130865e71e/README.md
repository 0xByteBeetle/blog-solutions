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

`Login to app.xyz` is prefixed with `\x19Ethereum Signed Message:\n16` and signed/recovered entirely offline. Tests independently form the prefix and reject a changed message. The fixture key is the publicly known integer 1, held only in memory: no account helper, key file, RPC, or broadcast is used. Go's signature recovery byte is 0/1; some wallet interfaces expose it as 27/28. These fixed values demonstrate encoding/signing, not current network fee estimates.

### Discover an access list (optional read-only RPC)

The default fixture is the article's printed response; it is not a current node observation. Requires Python 3.10+, standard library only:

```sh
python3 discover.py access-list
python3 -m unittest discover -s tests -v
# Opt in explicitly; FROM is a public address only, never a private key.
python3 discover.py access-list --rpc-url "$RPC_URL" --chain-id 80002 \
  --from "$FROM" --to 0x0Fd9e8d3aF1aaee056EB9e802c3A762a667b1904 \
  --data 0xa9059cbb0000000000000000000000008056361b1c1361436d61d187d761233b42d1c20e0000000000000000000000000000000000000000000000000de0b6b3a7640000
```

Set `RPC_URL` to the node/network you intend to inspect and check the expected chain ID. The script checks `eth_chainId`, then sends the article's `eth_createAccessList` parameters (`pending`, gas `0x50000`, gasPrice `0x6fee2d00`). Addresses/calldata are explicit inputs; the gas fields preserve the historical example and may now be unsuitable for that node. A provider may not support this method or may return an execution error if the sender lacks tokens/gas or the call reverts. Errors stop the script; no historical list is substituted. A discovered list reflects that call and state, and does not guarantee a gas saving or future execution success. No wallet, signature or broadcast is used. The curl example transfers 1 token in calldata; the preserved Go program uses a different amount, so do not assume their lists describe identical state transitions.

### Discover dynamic-fee inputs (optional read-only RPC)

```sh
python3 discover.py fees
python3 -m unittest discover -s tests -v
python3 discover.py fees --rpc-url "$RPC_URL" --chain-id 80002
```

The default five-block fixture is **synthetic**, with 1 gwei base fee and 2 gwei tip; the output cap is 3.12 gwei. Live mode checks the explicit chain ID, requests `eth_feeHistory ["0x5","latest",[]]` and `eth_maxPriorityFeePerGas`, matching the article's Go client methods. It validates the returned block/base-fee arrays and computes the article's integer formula `floor(lastBaseFee * 112 / 100) + tip`. The last base-fee entry predicts the **next block**, not the last sampled block. This historical 12% policy is an arithmetic example, not fee advice or an inclusion guarantee. Unsupported RPC methods, malformed history and chain mismatches fail explicitly. No wallet/signing/broadcast occurs.
