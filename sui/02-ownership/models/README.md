# Sui Part 2: choosing an object ownership model

Current author reference for the [unpublished Substack draft](https://andreyobruchkov1996.substack.com/publish/post/222510085). The current walkthrough runs on **public Sui Testnet**, with local Move compilation and tests. Every required reader source file, setup command, operation, and captured output belongs inline in the article. Readers do not need this repository to follow it.

`evidence/testnet/` contains the current public observations and receipts. `evidence/recorded/`, `evidence/localnet-verification.json`, and the earlier `evidence/source-audit.json` retain the previous localnet investigation as archived author reference. The parent directory retains an even earlier single-model notebook lab. Neither archive supplies the current article's transaction evidence.

## Five experiments

| Form | Source | Verified behavior |
| --- | --- | --- |
| Address-owned | `move/sources/owned.move` | Alice transfers only the notebook to Bob. Each account then lacks one input. After its capability follows, Bob updates the notebook to 11. |
| Shared | `move/sources/registry.move` | Alice and Bob add entries. Bob's reset enters Move and aborts at the administrator check with code 0. |
| Immutable | `move/sources/rules.move` | Bob successfully supplies the frozen rules as `&Rules`. Supplying them as `&mut Rules` produces `InvalidObjectByMutRef`. |
| Wrapped | `move/sources/case.move` | The notebook is nested inside Bob's address-owned Case. A standalone read returns `NOT_FOUND`. Updating through the Case and unpacking restores the original notebook ID with value 12. |
| Party | `move/sources/party_counter.move` | Alice submits two counter updates before waiting, using distinct 0.1-SUI gas coins. Both succeed and the counter reaches 2. Bob fails input-owner admission. |

`client/read_object.py` uses native gRPC `LedgerService.GetObject`, defaults to `fullnode.testnet.sui.io:443`, and saves the complete response. Server reflection supplies the message descriptors. It prints runtime owner metadata and the parsed Move value, and saves native missing-object errors with exit status 1. TLS is used for remote endpoints. Only loopback development endpoints use plaintext.

`client/receipt.py` reads saved CLI JSON without calling the network. It prints status and digest, selects the published package ID, or selects created object IDs by a Move type suffix. An optional integer selects one match when several objects have the same type.

## Verified environment

- CLI: `sui 1.83.0-16d2dc1e05ed`, official release `testnet-v1.83.0`.
- Testnet chain ID: `69WiPg3DAQiwdxfncX6wYQ2siKwAe6L9BZthQea3JNMD`.
- Native TLS gRPC: `fullnode.testnet.sui.io:443`.
- Framework revision: `719fb2960ccfbf9f4d33041f8ea5146d30671696`, as recorded in `evidence/testnet/Move.lock`.
- Python 3.13.7 with the three pinned packages in `requirements.txt`.

Seven local Move tests passed under this CLI: two for owned notebooks, two for the shared registry, and one each for immutable rules, wrapping, and party-counter logic. An `expected_failure` test passes when its specified abort occurs. These tests are distinct from the actual signed Testnet transactions and public native reads.

The official CLI archive checksum, release URL, and actual executable version are recorded in `evidence/testnet/toolchain/`. That directory contains metadata, not executable binaries or synthetic dry-run fixtures. The public network and faucet observations are timestamped and describe the captured run rather than a permanent network configuration.

## Configure Testnet and fund fresh accounts

Use the pinned CLI on `PATH`. Keep this folder as the working directory, and use a fresh private client configuration:

```bash
mkdir -p .private/network .local/move-cache evidence
export SUI_CONFIG_DIR="$PWD/.private/network"
export MOVE_HOME="$PWD/.local/move-cache"
export SUI_GRPC_ENDPOINT=fullnode.testnet.sui.io:443
export RUST_LOG=off
```

For this fresh configuration, create an empty keystore, select the public Testnet endpoint, and generate both dedicated accounts. Account-creation JSON contains recovery material and stays under `.private/`. The following matches the article setup:

```bash
umask 077
export SUI_CONFIG_DIR="$PWD/.private/network"
export MOVE_HOME="$PWD/.local/move-cache"
export RUST_LOG=off
export SUI_GRPC_ENDPOINT=fullnode.testnet.sui.io:443
printf '[]\n' > "$SUI_CONFIG_DIR/sui.keystore"
cat > "$SUI_CONFIG_DIR/client.yaml" <<EOF
keystore:
  File: $SUI_CONFIG_DIR/sui.keystore
envs:
  - alias: testnet
    rpc: "https://fullnode.testnet.sui.io:443"
    ws: null
    basic_auth: null
active_env: testnet
active_address: null
EOF
sui client new-address ed25519 alice --json > .private/alice-address.json
sui client new-address ed25519 bob --json > .private/bob-address.json
ALICE=$(python3 -c 'import json;print(json.load(open(".private/alice-address.json"))["address"])')
BOB=$(python3 -c 'import json;print(json.load(open(".private/bob-address.json"))["address"])')
sui client switch --env testnet --address "$ALICE" --json > evidence/selected-network.json
CHAIN_ID=$(sui client chain-identifier --json | python3 -c 'import json,sys;print(json.load(sys.stdin)["base58"])')
printf 'ALICE=%s\nBOB=%s\nCHAIN_ID=%s\n' "$ALICE" "$BOB" "$CHAIN_ID"
```

Fund the public addresses and inspect the returned balance fields:

```bash
sui client faucet --address "$ALICE"
sui client faucet --address "$BOB"
sui client gas "$ALICE" --json
sui client gas "$BOB" --json
```

The CLI's current public faucet flow computes its proof of work and pays SUI into the recipient's **address balance**. A successful payout does not necessarily create a `Coin<SUI>` object. The gas response exposes `addressMistBalance` as well as `gasCoins`. The recorded preparation received sufficient faucet funds before execution. Use each successful payout's reported amount and your actual balance, rather than assuming that one request always pays a fixed quantity. See the [official faucet guide](https://faucet.sui.io/how-to-use/).

Materialize one 0.5-SUI coin for each account. These are actual setup transactions, paid from their address balances:

```bash
sui client ptb \
  --move-call 0x2::coin::redeem_funds '<0x2::sui::SUI>' 'withdrawal(500000000)' \
  --assign coin --transfer-objects '[coin]' "@$ALICE" \
  --sender "@$ALICE" --gas-budget 50000000 --json > evidence/alice-materialize-gas.json
sui client ptb \
  --move-call 0x2::coin::redeem_funds '<0x2::sui::SUI>' 'withdrawal(500000000)' \
  --assign coin --transfer-objects '[coin]' "@$BOB" \
  --sender "@$BOB" --gas-budget 50000000 --json > evidence/bob-materialize-gas.json
ALICE_GAS=$(python3 client/receipt.py evidence/alice-materialize-gas.json '::coin::Coin<0x2::sui::SUI>')
BOB_GAS=$(python3 client/receipt.py evidence/bob-materialize-gas.json '::coin::Coin<0x2::sui::SUI>')
```

The ordinary successful calls in this capture generally selected address-balance gas. Explicit gas coins make the deliberate input and execution failures reproducible, and later provide two distinct owned gas inputs for the party demonstration. This setup does not claim that every transaction needs a gas coin.

## Compile and test locally

The CLI supplies the built-in Testnet environment. The current manifest needs no custom local chain declaration:

```bash
cp move/Move.toml.template move/Move.toml
sui move build --path move
sui move test --path move
python3 -m venv .venv
source .venv/bin/activate
python3 -m pip install -r requirements.txt
```

The recorded build and five filtered test commands are in `evidence/testnet/`. The command manifest retains an earlier unsuccessful build attempt followed by the successful build. The final test outputs all pass. The article shows the exact per-module run commands and actual outputs beside each complete source file.

The complete ordered publication, creation, handover, mutation, rejection, and inspection commands are preserved in `evidence/reader-commands.json` when the current draft is generated. Use IDs returned by a new run's receipts instead of the captured IDs below. A typical native inspection command is:

```bash
python3 client/read_object.py "$OBJECT_ID" observation
```

## Public Testnet evidence

The deployed [Move package](https://suiscan.xyz/testnet/object/0x5fdb5abb7ab797fedd114768a311b4e31e3443055f2bdd3d25698adb4fbd290f) was published in [this successful transaction](https://suiscan.xyz/testnet/tx/9ztdJjZ7mifDspETYXPN8G85jVG9C8Z5EMavEyaqa2MN).

| Record | Public object or transaction |
| --- | --- |
| Notebook, finally restored at value 12 | [Object](https://suiscan.xyz/testnet/object/0x98f53bf745703aeb2a69dfd81d729a73f168a7adade7ba479ecf12ce35406a59) |
| Matching capability | [Object](https://suiscan.xyz/testnet/object/0xe87fe80d12e51fcfc3eb573401c77015340d89e951b9a07072677fee559ae2fb) |
| Shared registry, two entries | [Object](https://suiscan.xyz/testnet/object/0xcbcd7f3b312de963b9cd322bd0a30bd0738be159a60ea9c946d0c518fbb9562a) |
| Immutable rules, limit 10 | [Object](https://suiscan.xyz/testnet/object/0xd1f41a6d82879734fe544e61630e82cf996c4db0f35954af8f4577d46f3c9c62) |
| Case used for wrapping, subsequently consumed by unpack | [Object history](https://suiscan.xyz/testnet/object/0xbdc1708caf256e195af197c3fdee57b8b7940f4553c5df3e28510cd0aa0a37ff) |
| Party counter, final value 2 | [Object](https://suiscan.xyz/testnet/object/0x671abd69e62f58404b8de99a69f839fbbb47fbcc572eca5c237057eb17f8fe86) |
| Rejected registry reset, committed Move abort | [Failed transaction](https://suiscan.xyz/testnet/tx/B92H9tammBG3zTXMsAfDsGN1F5KFzw61U61Pa4FC8Bsa) |
| Rejected mutable use of immutable rules, committed argument error | [Failed transaction](https://suiscan.xyz/testnet/tx/G4SaV6Td2KNVXuM3KDQrLvtyAnUbVcevzFDTN9TBwqKC) |
| Party update A | [Successful transaction](https://suiscan.xyz/testnet/tx/6AhankWo3fc9ZEC5auK3TsMPCmAyH1QpVHHBQEEcsU6g) |
| Party update B | [Successful transaction](https://suiscan.xyz/testnet/tx/EVZvGNGg8GzuUymvqJzPJE86yppDgLyTwaEyYFBZWkKC) |

The two party gas coins were created with the following split, using 100,000,000 MIST each, or 0.1 SUI:

```bash
sui client ptb --split-coins gas '[100000000,100000000]' \
  --assign parts --transfer-objects '[parts.0,parts.1]' "@$ALICE" \
  --sender "@$ALICE" --gas-coin "@$ALICE_GAS" \
  --gas-budget 50000000 --json > evidence/prepare-party-gas.json
```

Testnet does not promise permanent history. The copied public receipts and native observations preserve the captured inputs to this article even if a service later prunes them or the network resets.

## Read the evidence at its actual boundary

- `owned-alice-rejected`, `owned-bob-rejected`, and `party-bob-rejected` fail the full node's input-owner checks before Move. Their diagnostics are real, but they do not establish committed failed transactions or explorer receipts.
- `registry-bob-reset-rejected` is a committed Move abort with code 0 in `registry::reset`. Its failed execution receipt was fetched by digest.
- `rules-bob-mutation-rejected` is a committed execution-time argument error, `InvalidObjectByMutRef`. Its failed execution receipt was fetched by digest.
- `read-wrapped_child` records native `GetObject` returning `NOT_FOUND` while the notebook was inside the Case. The subsequent direct update fails object resolution before execution.
- `case-pack.effects.wrapped` identifies the nested notebook. The CLI `objectChanges` projection labels that transition `deleted`, which does not mean permanent destruction of the notebook's UID. The captured parent contains that ID, and unwrapping restores it.

The shared registry's owner is `SHARED`. Its `admin` address is an application field checked in Move. The Case is `ADDRESS`-owned and contains the notebook as nested data. Wrapping is not an owner enum named `WRAPPED`.

The shared registry's recorded current version is 4 and its start version is 1. The party counter's current version is also 4, while `owner.version` is its consensus start version, 1. Both party calls supply `initialSharedVersion: 1` through the CLI's `sharedObject` input representation. The runtime owner remains `CONSENSUS_ADDRESS` with Alice's address. This input representation does not give Bob public shared access.

Both party CLI processes were launched before the batch waited for completion. Both succeeded with different gas coins. These observations establish accepted inflight requests and an ordered final counter value. They do not establish parallel execution of conflicting writes or a latency benchmark. Public object reads do not grant permission to supply those objects to Move.

## Offline receipt checks and provenance

These projections require no node or gRPC packages:

```bash
python3 client/receipt.py evidence/testnet/publish.json
python3 client/receipt.py evidence/testnet/registry-failed-receipt.json
python3 client/receipt.py evidence/testnet/rules-failed-receipt.json
```

They report one success and two failures. The failed receipts' `effects.status.error` fields distinguish the Move abort from the immutable-reference error.

`evidence/verification.json` checks 20 successful committed receipts, two failed execution receipts, the saved native states, input references, and the seven local tests. The independent `evidence/testnet/testnet-validation.json` records another 126 passed checks, including selector projections and the demonstrated failure boundaries. `provenance.json` hashes the copied current sources and Testnet records, and retains historical localnet provenance in a clearly labeled archive object. The raw command manifest records actual outcomes, including the earlier build attempt. The generated article command map selects the reader's demonstrated path.

No wallet, keystore, private configuration, node database, executable binary, build output, generated `Published.toml`, or synthetic dry-run fixture is included in the current onchain evidence. Public transaction receipts include their public transaction signatures.
