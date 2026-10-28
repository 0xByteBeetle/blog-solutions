# Sui Part 2: choosing an object ownership model

The current five-form article reference is in [models/](models/README.md), covering address-owned, shared, immutable, wrapped, and party objects with actual local evidence. Its [Substack draft](https://andreyobruchkov1996.substack.com/publish/post/222510085) contains all reader-facing material inline.

## Archived notebook and capability investigation

The earlier single-model lab below is retained as author reference. Its sources, commands, and recorded observations describe that earlier investigation.

Author reference for the [unpublished Substack draft](https://andreyobruchkov1996.substack.com/publish/post/222510085). All reader material belongs inline in the article, including source files, setup commands, run commands, and actual outputs. The article does not require readers to clone this repository.

The example follows one notebook and its separate capability. Alice initially owns both. She transfers only the notebook to Bob, leaving neither address able to supply both address-owned inputs to `set_value`. Two signed calls are rejected during input validation. After Alice transfers the capability, Bob successfully updates the notebook. Its object ID and the capability's binding remain unchanged.

## Files and evidence

| File | Purpose |
| --- | --- |
| `move/sources/notebook.move` | Notebook, capability, creation, and the binding guard |
| `move/tests/handover_tests.move` | Four local Move tests covering handover, unavailable owned inputs, and wrong binding |
| `move/Move.toml.template` | Portable manifest text, expanded with a fresh localnet chain identifier |
| `client/rpc.py` | Native gRPC calls using runtime protobuf reflection |
| `client/01_inspect_owned.py` | Read two objects and save a labeled observation |
| `client/02_compare_handover.py` | Compare four saved observations locally |
| `client/inspect_call_inputs.py` | Inspect object inputs, input versions, and the pure value in the saved successful call |
| `failures/forge-cap/sources/forgery_failure.move` | Deliberate compiler rejection for constructing NotebookCap outside its defining module |
| `evidence/recorded-client/` | Original object observations and Python output |
| `evidence/recorded-cli/` | Public transaction receipts, input errors, compiler output, test output, and recorded manifest/lock |
| `evidence/cli-manifest.json` | Complete source and 14 CLI steps with captured outputs and boundary notes |
| `evidence/client-manifest.json` | Complete Python source and actual commands/outputs |
| `evidence/captured-commands.json` | Five actual signed CLI invocations and their results |
| `draft/` | Saved article source, exact code blocks, screenshots, and Substack formatting verification |
| `provenance.json` | Original source locations, hashes, copying rules, and evidence limits |

Nothing under `.local/` or `.private/`, no wallets or private keys, no node databases, no build binaries, and no generated `Published.toml` are included. The JSON transaction receipts contain public transaction data and signatures.

## Verified environment

The recorded run used `sui 1.82.3-bf4073918ed3`, Python 3.13.7, and the three exact Python dependency versions in `requirements.txt`. Python 3.10 or newer is needed by those dependencies. The compiler resolved framework revision `719fb2960ccfbf9f4d33041f8ea5146d30671696`, preserved in `evidence/recorded-cli/Move.lock`. That lock is evidence of the original resolution, rather than a replacement for the manifest generated for a new network.

The CLI came from the official `mainnet-v1.82.3` release. These exercises ran on a disposable localnet with one validator. No public-network transaction is claimed. The original run reused the verified CLI archive, a framework cache, and an existing Python environment. A clean run fetches framework sources and installs the Python dependencies.

Commands below assume the pinned Sui CLI is on `PATH` and the working directory is this folder. A fresh genesis generates different addresses, object IDs, package IDs, and chain ID. Keep the shell variables obtained from your own responses. Recorded sample identifiers are evidence, not constants for a new run.

## Repeat the local exercise

In terminal one, create a fresh local network and keep the process running:

```bash
mkdir -p .local/network evidence
export SUI_CONFIG_DIR="$PWD/.local/network"
export MOVE_HOME="$PWD/.local/move-cache"
sui genesis --working-dir "$SUI_CONFIG_DIR" --with-faucet --committee-size 1 --epoch-duration-ms 86400000
sui start --network.config "$SUI_CONFIG_DIR" --with-faucet --fullnode-rpc-port 9000
```

In terminal two, enter this same folder. Select the generated accounts and obtain the new chain identifier:

```bash
export SUI_CONFIG_DIR="$PWD/.local/network"
export MOVE_HOME="$PWD/.local/move-cache"
export SUI_GRPC_ENDPOINT="127.0.0.1:9000"
sui client addresses --json > evidence/addresses.json
ALICE=$(python3 -c 'import json; print(json.load(open("evidence/addresses.json"))["addresses"][0][1])')
BOB=$(python3 -c 'import json; print(json.load(open("evidence/addresses.json"))["addresses"][1][1])')
CHAIN_ID=$(sui client chain-identifier --json | python3 -c 'import json, sys; print(json.load(sys.stdin)["base58"])')
```

Generate the actual manifest. The literal `$CHAIN_ID` in `Move.toml.template` is a template placeholder. The unquoted heredoc below expands the variable before the compiler reads `move/Move.toml`:

```bash
cat > move/Move.toml <<TOML
[package]
name = "sui_ownership"
edition = "2024"

[environments]
localnet = "$CHAIN_ID"
TOML
sui move build --path move
sui move test --path move
```

The recorded build succeeded with two `WSL06002` linter warnings about transferring to the sender in `create_owned`. They are preserved rather than removed. All four Move tests passed.

Set up the Python reader in terminal two:

```bash
python3 -m venv .venv
source .venv/bin/activate
python3 -m pip install grpcio==1.84.1 grpcio-reflection==1.84.1 protobuf==7.36.2
python3 client/rpc.py
```

The helper uses plaintext HTTP/2 only for loopback local development. Other targets use a TLS channel with normal certificate verification. It requires the server's reflection service and does not contain a signing key or submit transactions.

Publish, create the pair, and let Alice update the value from 7 to 9:

```bash
sui client publish move --sender "$ALICE" --gas-budget 100000000 --json > evidence/publish.json
PACKAGE_ID=$(python3 -c 'import json; d=json.load(open("evidence/publish.json")); print(next(o["packageId"] for o in d["objectChanges"] if o["type"] == "published"))')
sui client call --package "$PACKAGE_ID" --module notebook --function create_owned --args 7 --sender "$ALICE" --gas-budget 50000000 --json > evidence/create.json
NOTE_ID=$(python3 -c 'import json; d=json.load(open("evidence/create.json")); print(next(o["objectId"] for o in d["objectChanges"] if o["type"] == "created" and o["objectType"].endswith("::notebook::Notebook")))')
CAP_ID=$(python3 -c 'import json; d=json.load(open("evidence/create.json")); print(next(o["objectId"] for o in d["objectChanges"] if o["type"] == "created" and o["objectType"].endswith("::notebook::NotebookCap")))')
sui client call --package "$PACKAGE_ID" --module notebook --function set_value --args "$NOTE_ID" "$CAP_ID" 9 --sender "$ALICE" --gas-budget 50000000 --json > evidence/alice-update.json
python3 client/01_inspect_owned.py "$NOTE_ID" "$CAP_ID" baseline
```

Transfer only the notebook and capture the split custody:

```bash
sui client transfer --to "$BOB" --object-id "$NOTE_ID" --sender "$ALICE" --gas-budget 50000000 --json > evidence/transfer-notebook.json
python3 client/01_inspect_owned.py "$NOTE_ID" "$CAP_ID" partial
```

Choose explicit gas coins for the two deliberate failures. This avoids a gas-selection preflight error hiding the ownership check. Run each signed call separately. Each is expected to exit with status 1, so do not put these commands in a script that stops at the first failing command:

```bash
sui client gas "$ALICE" --json > evidence/alice-gas.json
sui client gas "$BOB" --json > evidence/bob-gas.json
ALICE_GAS=$(python3 -c 'import json; print(json.load(open("evidence/alice-gas.json"))["gasCoins"][0]["gasCoinId"])')
BOB_GAS=$(python3 -c 'import json; print(json.load(open("evidence/bob-gas.json"))["gasCoins"][0]["gasCoinId"])')
sui client call --package "$PACKAGE_ID" --module notebook --function set_value --args "$NOTE_ID" "$CAP_ID" 10 --sender "$BOB" --gas "$BOB_GAS" --gas-budget 50000000 --json > evidence/bob-rejected.txt 2>&1
printf 'Exit code: %s\n' "$?"
sed -n '/^    0: RPC error:/p' evidence/bob-rejected.txt
```

```bash
sui client call --package "$PACKAGE_ID" --module notebook --function set_value --args "$NOTE_ID" "$CAP_ID" 10 --sender "$ALICE" --gas "$ALICE_GAS" --gas-budget 50000000 --json > evidence/alice-rejected.txt 2>&1
printf 'Exit code: %s\n' "$?"
sed -n '/^    0: RPC error:/p' evidence/alice-rejected.txt
python3 client/01_inspect_owned.py "$NOTE_ID" "$CAP_ID" rejected
```

Complete the capability transfer, then let Bob update the notebook:

```bash
sui client transfer --to "$BOB" --object-id "$CAP_ID" --sender "$ALICE" --gas-budget 50000000 --json > evidence/transfer-capability.json
sui client call --package "$PACKAGE_ID" --module notebook --function set_value --args "$NOTE_ID" "$CAP_ID" 11 --sender "$BOB" --gas-budget 50000000 --json > evidence/bob-update.json
python3 client/01_inspect_owned.py "$NOTE_ID" "$CAP_ID" complete
python3 client/02_compare_handover.py evidence/baseline.json evidence/partial.json evidence/rejected.json evidence/complete.json
```

## Replay the saved comparison

This command uses only the four saved JSON files. It requires Python and no node or gRPC dependencies:

```bash
python3 client/02_compare_handover.py evidence/recorded-client/baseline.json evidence/recorded-client/partial.json evidence/recorded-client/rejected.json evidence/recorded-client/complete.json
```

Recorded output:

```text
baseline: value=9, same owner=True
partial: value=9, same owner=False
complete: value=11, same owner=True
PASS: notebook identity, capability identity, and their binding stayed unchanged
PASS: only the notebook moved first, then the capability followed
PASS: both object records stayed unchanged after the rejected attempts
```

## What the evidence establishes

The Python reads are two sequential `GetObject` calls per stage. Mutations were paused while collecting each stage. They are public service observations, rather than a single atomic snapshot or a consensus proof. The recorded `partial` and `rejected` responses are equal for both objects.

The two signed failures are full-node input-validation rejections for ordinary address-owned inputs. They are distinct from the local `test_scenario` inventory failures and the notebook module's binding-guard abort. A `NotebookCap` of the correct type can still refer to the wrong notebook, which is why the module also checks the object ID.

The example concerns these two address-owned objects and this function signature. Reading their public records does not grant Move references. Matching owners is a custody observation, not a general proof that every possible operation is authorized. Broader ownership forms and other input paths belong in separate articles.

## Additional construction and receipt controls

The expanded draft traces the saved successful call locally and tests whether a foreign module can fabricate the capability. No new node transaction was required.

After the original Alice update has generated `evidence/alice-update.json`, run:

```bash
python3 client/inspect_call_inputs.py
```

For an offline replay, copy `evidence/recorded-cli/alice-update.json` to `evidence/alice-update.json` first. This program reports recorded transaction fields without verifying a signature or contacting a node. Input versions are 3, while the following baseline state query observes version 4.

The foreign module is an intentionally invalid fixture. With `move/Move.toml` already generated for the local lab, prepare its supporting files and build it separately:

```bash
mkdir -p failures/forge-cap/sources
cp move/Move.toml failures/forge-cap/Move.toml
cp move/sources/notebook.move failures/forge-cap/sources/notebook.move
RUST_LOG=off sui move build --path failures/forge-cap --no-lint
```

Expected exit status is 1 with EC04001 restricted visibility. The original Move package remains valid. The failure source is fully printed in the Substack draft, and no reader-facing source is hidden behind this repository. Clean compiler evidence is preserved in `evidence/forge-cap/`, and the receipt inspector source and output are preserved in `evidence/call-inputs-manifest.json`. The source path in the compiler manifest is relative to the lab root, and its baseline output is retained alongside the manifest.
