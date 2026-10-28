# Sui Part 2: choosing an object ownership model

Current author reference for the [unpublished Substack draft](https://andreyobruchkov1996.substack.com/publish/post/222510085). The article contains the complete source files, installation and setup, individual commands, and actual outputs inline. Readers do not need this repository to follow it.

The parent directory retains the earlier notebook-and-capability investigation as archived author reference. This folder contains the five-form replacement. No historical published-source catalog or Part 1 files are changed.

## Five experiments

| Form | Source | Demonstrated behavior |
| --- | --- | --- |
| Address-owned | `move/sources/owned.move` | Alice updates a notebook, then transfers only the notebook to Bob. Each account lacks one input until the matching capability follows. Bob then updates it. |
| Shared | `move/sources/registry.move` | Alice and Bob both add entries. A reset checks the administrator in Move, and Bob's reset aborts with code 0. |
| Immutable | `move/sources/rules.move` | The created rules object is frozen. Bob can supply it as `&Rules`; attempting `&mut Rules` fails with `InvalidObjectByMutRef`. |
| Wrapped | `move/sources/case.move` | The same notebook is nested in an address-owned Case. Its standalone lookup returns `NOT_FOUND`, an operation through the Case changes its value, and unwrapping restores the original notebook ID. |
| Party | `move/sources/party_counter.move` | A single-owner party counter accepts two owner updates using different gas coins. Bob is rejected by an input-owner check. |

`client/read_object.py` makes a native gRPC `GetObject` call, saves its full response, and prints the owner and Move value without the BCS payload. It handles missing objects with a saved error response and exit status 1. Its name deliberately avoids Python's standard-library `inspect` module.

`client/receipt.py` reads a previously saved CLI JSON file. It projects status and digest, selects a published package ID, or selects created object IDs by a Move type suffix. It does not call the network.

## Verified environment

The lab used `sui 1.82.3-bf4073918ed3`, the framework revision recorded in `evidence/recorded/Move.lock`, and Python 3.13.7 with the three versions in `requirements.txt`. The official CLI release label is `mainnet-v1.82.3`, while every transaction recorded here used a fresh disposable localnet with one validator.

Seven Move tests passed: two for the owned notebook, two for the registry, and one each for immutable rules, wrapping, and the party counter. Expected-failure tests pass when their specified abort occurs. These local tests are separate from the actual signed node calls and public data observations.

The observed chain identifier is recorded in `provenance.json`. A new genesis produces different accounts, package IDs, object IDs, and chain ID. Keep identifiers returned by the fresh run instead of copying the recorded values into new transactions.

## Compile the sources

Commands assume the pinned Sui CLI is on `PATH` and the working directory is this folder. Start a fresh network in terminal one:

```bash
mkdir -p .local/network evidence
export SUI_CONFIG_DIR="$PWD/.local/network"
export MOVE_HOME="$PWD/.local/move-cache"
sui genesis --working-dir "$SUI_CONFIG_DIR" --with-faucet --committee-size 1 --epoch-duration-ms 86400000
sui start --network.config "$SUI_CONFIG_DIR" --with-faucet --fullnode-rpc-port 9000
```

In terminal two, enter this folder and generate the manifest for that chain. `move/Move.toml.template` preserves the template text, while the unquoted heredoc below substitutes the actual identifier:

```bash
export SUI_CONFIG_DIR="$PWD/.local/network"
export MOVE_HOME="$PWD/.local/move-cache"
CHAIN_ID=$(sui client chain-identifier --json | python3 -c 'import json, sys; print(json.load(sys.stdin)["base58"])')
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

The recorded compiler and filtered test output are under `evidence/recorded/`. The article gives the complete publication, creation, handover, mutation, failure, and inspection commands in order. Its author command map is preserved in `evidence/reader-commands.json` when the draft is generated.

Set up the Python reader in terminal two:

```bash
python3 -m venv .venv
source .venv/bin/activate
python3 -m pip install -r requirements.txt
export SUI_GRPC_ENDPOINT=127.0.0.1:9000
```

The reader requires the endpoint's reflection service. It uses plaintext HTTP/2 for loopback development only, and normal TLS for other endpoints. A typical invocation, after obtaining an object ID from a receipt, is:

```bash
python3 client/read_object.py "$OBJECT_ID" observation
```

## Replay receipt projections offline

These commands read the preserved public receipts without a node or gRPC dependencies:

```bash
python3 client/receipt.py evidence/recorded/registry-alice-add.json
python3 client/receipt.py evidence/recorded/registry-failed-receipt.json
python3 client/receipt.py evidence/recorded/rules-failed-receipt.json
```

The successful call reports `success`. Both fetched failed-execution receipts report `failure`. Inspect their `effects.status.error` fields for the actual Move abort and immutable argument error.

## Read the evidence at its actual boundary

- `owned-alice-rejected`, `owned-bob-rejected`, and `party-bob-rejected` fail the observed full-node input-owner checks before Move executes.
- `registry-bob-reset-rejected` is a Move abort with code 0 in `registry::reset`. Its persistent failed receipt was fetched by digest.
- `rules-bob-mutation-rejected` is an execution-time call argument error, `InvalidObjectByMutRef`. Its persistent failed receipt was also fetched by digest.
- `read-wrapped_child` records native `GetObject` returning `NOT_FOUND` while the notebook is nested. The following direct update fails object resolution before execution.
- `case-pack.effects.wrapped` identifies the nested notebook. The CLI `objectChanges` projection labels this transition `deleted`, but that projection must not be treated as permanent destruction of the notebook's UID. The parent value contains the ID, and unwrapping restores it.

The registry's owner is `SHARED`, while its `admin` address is an application field checked by Move. The Case is `ADDRESS`-owned and contains the notebook as nested data. Wrapping is not a separate `WRAPPED` owner enum variant.

The party counter's recorded owner is `CONSENSUS_ADDRESS` with Alice's address and start version 10. Its current object version is 13, and its value is 2. Both successful calls reference that same consensus start version through the CLI's `sharedObject` input representation and use different gas coins. That representation does not mean the object became publicly shared. The current public party API supports single-owner parties.

Two successful inflight submissions are not proof of parallel conflicting writes or a latency benchmark. Public RPC inspection does not grant use of an object as a transaction input, and none of these individual observations is an atomic snapshot or a consensus proof. See `evidence/verification.json` for the checks against the captured state relationships and failure receipts.

## Provenance

`provenance.json` records SHA-256 hashes for copied source files and public evidence. `evidence/recorded/commands.json` retains actual CLI invocations and their outcomes, including exploratory attempts that are not part of the reader sequence. The article's selected step map identifies the demonstrated path.

No wallet, keystore, `.local` or `.private` directory, node database, build binary, or generated `Published.toml` is included. The transaction receipts contain public local-chain transaction data and signatures.
