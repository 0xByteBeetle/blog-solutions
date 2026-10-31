# Sui: Ownership

Code for [the unpublished draft](https://andreyobruchkov1996.substack.com/publish/post/222510085). Current draft source is preserved; Python tests and keyless run helpers are supplemental.

## Run locally

Use Python 3.10+ (tested with 3.12) and an existing Sui **1.83.0** CLI. Run from this directory:

```sh
python3 -m unittest discover -s tests -v
python3 run_move_tests.py --sui /absolute/path/to/sui
```

The Python tests use synthetic fixtures, not a network. The Move runner uses an isolated empty keystore; it never generates a key or submits a transaction. Initial framework dependency resolution may need network access. The checked-in lock pins the framework.

The Move suite checks seven named tests: capability binding/rejection, registry updates/admin rejection, wrapping identity, freezing and counter updates. Local value tests do not prove network ownership admission or consensus ordering. Twelve Python tests cover receipt selection, mocked object reads and runner guards.

## Read an object (optional network access)

```sh
python3 -m venv .venv
. .venv/bin/activate
python3 -m pip install -r requirements.txt
python3 client/read_object.py OBJECT_ID observation
```

The reader defaults to Sui Testnet and saves `evidence/observation.json`. `SUI_GRPC_ENDPOINT` can select another endpoint. Historical IDs may no longer be available. To inspect an existing CLI transaction receipt locally, use `python3 client/receipt.py receipt.json` (or append `package` / an object-type suffix and index). This does not submit a transaction.

Run Python without `-O` or `PYTHONOPTIMIZE`: the original clients use assertions for consistency checks. Generated evidence, caches and build output are ignored.

## Optional Testnet ownership lab

These are separately opted-in **reader transactions**, derived from the draft. The agent/CI does not create wallets, request faucet funds, publish or submit these calls. Use existing **Sui 1.83.0** and disposable Testnet accounts only; do not use a personal wallet or Mainnet. Public Testnet state persists, while gas balances, admission and endpoints can change. The keyless tests above remain the default.

Start in this article folder, which already contains `Move.toml`. Prepare an isolated CLI config outside the repository so first-run wallet initialization cannot touch your normal configuration. The Python block writes an **empty** keystore; only the two following explicit `new-address` commands create disposable keys. Keep their recovery output private.

```sh
export LAB_DIR=$(mktemp -d "${TMPDIR:-/tmp}/sui-ownership-lab.XXXXXX")
export SUI_CONFIG_DIR="$LAB_DIR/config"
python3 - <<'CONFIG'
import json, os
from pathlib import Path
p=Path(os.environ['SUI_CONFIG_DIR']);p.mkdir()
key=p/'sui.keystore';key.write_text('[]\n');key.chmod(0o600)
(p/'client.yaml').write_text('keystore:\n  File: '+json.dumps(str(key))+'\nenvs:\n  - alias: testnet\n    rpc: https://fullnode.testnet.sui.io:443\n    ws: null\n    basic_auth: null\nactive_env: testnet\nactive_address: null\n')
CONFIG
sui --version  # must report 1.83.0
sui client new-address ed25519 alice
sui client new-address ed25519 bob
sui client switch --env testnet --address alice
ALICE=$(sui client active-address)
sui client switch --address bob
BOB=$(sui client active-address)
sui client switch --address alice
sui client active-env  # verify testnet before any transaction
```

Fund both disposable addresses through the [official Testnet faucet](https://faucet.sui.io/?network=testnet). The draft uses these explicit requests; its CLI handles the faucet proof of work:

```sh
sui client faucet --address "$ALICE" --url https://faucet.testnet.sui.io
sui client faucet --address "$BOB" --url https://faucet.testnet.sui.io
sui client gas --address "$ALICE"
sui client gas --address "$BOB"
```

Allow at least 1 Testnet SUI each and inspect current balances. For the final two inflight requests Alice needs **two distinct sufficiently funded gas coin objects**; the same owned gas coin cannot safely be used by both. This is a gas-input concern separate from the party counter.

For native gRPC object reads, create/activate a virtual environment and install this article's `requirements.txt`. Keep that environment and `SUI_CONFIG_DIR` selected throughout the lab. Receipt files below are your own ignored local output, not historical evidence bundled into Git:

```sh
python3 -m venv .venv
. .venv/bin/activate
python3 -m pip install -r requirements.txt
mkdir -p evidence
sui client publish . --sender "$ALICE" --gas-budget 100000000 --json > evidence/publish.json
python3 client/receipt.py evidence/publish.json
PACKAGE=$(python3 client/receipt.py evidence/publish.json package)
```

Require `Status: success` before extracting IDs and proceeding. **Publish `.`**, not the draft's nested `move` path: this repository places the package at the article root. Every ID comes from your receipts; do not reuse the draft's historical IDs.

### Address-owned notebook and capability handover

```sh
sui client call --package "$PACKAGE" --module owned --function create_owned --args 7 --sender "$ALICE" --gas-budget 50000000 --json > evidence/owned-create.json
NOTEBOOK=$(python3 client/receipt.py evidence/owned-create.json '::owned::Notebook')
CAPABILITY=$(python3 client/receipt.py evidence/owned-create.json '::owned::NotebookCap')
sui client call --package "$PACKAGE" --module owned --function set_value --args "$NOTEBOOK" "$CAPABILITY" 9 --sender "$ALICE" --gas-budget 50000000 --json > evidence/owned-alice-update.json
python3 client/receipt.py evidence/owned-alice-update.json
python3 client/read_object.py "$NOTEBOOK" owned_before
sui client transfer --to "$BOB" --object-id "$NOTEBOOK" --sender "$ALICE" --gas-budget 50000000 --json > evidence/owned-transfer.json
python3 client/receipt.py evidence/owned-transfer.json
# Both are expected to exit nonzero, before Move execution:
sui client call --package "$PACKAGE" --module owned --function set_value --args "$NOTEBOOK" "$CAPABILITY" 10 --sender "$ALICE" --gas-budget 50000000 --json
sui client call --package "$PACKAGE" --module owned --function set_value --args "$NOTEBOOK" "$CAPABILITY" 10 --sender "$BOB" --gas-budget 50000000 --json
sui client transfer --to "$BOB" --object-id "$CAPABILITY" --sender "$ALICE" --gas-budget 50000000 --json > evidence/cap-transfer.json
python3 client/receipt.py evidence/cap-transfer.json
sui client call --package "$PACKAGE" --module owned --function set_value --args "$NOTEBOOK" "$CAPABILITY" 11 --sender "$BOB" --gas-budget 50000000 --json > evidence/owned-bob-update.json
python3 client/receipt.py evidence/owned-bob-update.json
python3 client/read_object.py "$NOTEBOOK" owned
```

Observe Alice/value 9 before transfer, then Bob/value 11 under the **same notebook ID**. During the two rejected calls Alice lacks notebook custody and Bob lacks capability custody. The nested incorrect-owner/signature error identifies the input; neither attempt reaches `set_value` or produces a committed receipt. This differs from the local Move test's wrong-capability assertion.

### Shared registry: public addition, application admin check

```sh
sui client call --package "$PACKAGE" --module registry --function create --sender "$ALICE" --gas-budget 50000000 --json > evidence/registry-create.json
REGISTRY=$(python3 client/receipt.py evidence/registry-create.json '::registry::Registry')
sui client call --package "$PACKAGE" --module registry --function add_entry --args "$REGISTRY" --sender "$ALICE" --gas-budget 50000000 --json > evidence/registry-alice-add.json
sui client call --package "$PACKAGE" --module registry --function add_entry --args "$REGISTRY" --sender "$BOB" --gas-budget 50000000 --json > evidence/registry-bob-add.json
python3 client/receipt.py evidence/registry-alice-add.json
python3 client/receipt.py evidence/registry-bob-add.json
# Expected nonzero: executed MoveAbort in registry::reset, code 0.
sui client call --package "$PACKAGE" --module registry --function reset --args "$REGISTRY" --sender "$BOB" --gas-budget 50000000 --json
python3 client/read_object.py "$REGISTRY" shared
```

Require both add receipts successful, owner kind SHARED, Alice as application admin, entries 2 after the rejected reset. Unlike the prior custody failures, Bob can supply this shared input; the application guard aborts during execution. Do not infer execution solely from a nonzero CLI status: inspect the reported MoveAbort/digest when available.

### Immutable rules: read succeeds, mutable reference fails

```sh
sui client call --package "$PACKAGE" --module rules --function create --args 10 --sender "$ALICE" --gas-budget 50000000 --json > evidence/rules-create.json
RULES=$(python3 client/receipt.py evidence/rules-create.json '::rules::Rules')
sui client call --package "$PACKAGE" --module rules --function read_limit --args "$RULES" --sender "$BOB" --gas-budget 50000000 --json > evidence/rules-read.json
python3 client/receipt.py evidence/rules-read.json
# Expected nonzero: CommandArgumentError / InvalidObjectByMutRef.
sui client call --package "$PACKAGE" --module rules --function set_limit --args "$RULES" 20 --sender "$BOB" --gas-budget 50000000 --json
python3 client/read_object.py "$RULES" immutable
```

The object remains IMMUTABLE with limit 10. The mutable-reference error is not `registry::reset`'s application assertion. Freezing this instance is irreversible.

### Wrapped notebook: access through its known case

```sh
sui client call --package "$PACKAGE" --module case --function pack --args "$NOTEBOOK" --sender "$BOB" --gas-budget 50000000 --json > evidence/case-pack.json
CASE=$(python3 client/receipt.py evidence/case-pack.json '::case::Case')
python3 client/read_object.py "$CASE" wrapped
# Expected nonzero: the known child has no independent live record while packed.
python3 client/read_object.py "$NOTEBOOK" wrapped_child
sui client call --package "$PACKAGE" --module owned --function set_value --args "$NOTEBOOK" "$CAPABILITY" 12 --sender "$BOB" --gas-budget 50000000 --json
sui client call --package "$PACKAGE" --module case --function set_inside --args "$CASE" "$CAPABILITY" 12 --sender "$BOB" --gas-budget 50000000 --json > evidence/case-update.json
sui client call --package "$PACKAGE" --module case --function unpack --args "$CASE" --sender "$BOB" --gas-budget 50000000 --json > evidence/case-unpack.json
python3 client/receipt.py evidence/case-update.json
python3 client/receipt.py evidence/case-unpack.json
python3 client/read_object.py "$NOTEBOOK" unwrapped
```

Check the case's nested notebook ID/value 11 before updating, then the same standalone notebook ID/value 12 after unpacking. The known pack receipt and parent data establish containment; NOT_FOUND alone cannot establish why an arbitrary ID is absent. The direct child call fails in object resolution and has no committed receipt. Unpacking deletes the case UID; wrapping is not a separate runtime owner enum.

### Party counter: restricted owner, two inflight requests

```sh
sui client call --package "$PACKAGE" --module party_counter --function create --sender "$ALICE" --gas-budget 50000000 --json > evidence/party-create.json
PARTY=$(python3 client/receipt.py evidence/party-create.json '::party_counter::Counter')
# Expected nonzero owner-admission failure before execution; no committed receipt:
sui client call --package "$PACKAGE" --module party_counter --function increment --args "$PARTY" --sender "$BOB" --gas-budget 50000000 --json
sui client gas --address "$ALICE"
```

Set `GAS_A` and `GAS_B` to **different** current Alice gas coin IDs from that output, each covering the budget. Do not use historical IDs. Then submit both updates before waiting:

```sh
test -n "$GAS_A" && test -n "$GAS_B" && test "$GAS_A" != "$GAS_B" || exit 1
sui client call --package "$PACKAGE" --module party_counter --function increment --args "$PARTY" --sender "$ALICE" --gas "$GAS_A" --gas-budget 50000000 --json > evidence/party-a.json &
PID_A=$!
sui client call --package "$PACKAGE" --module party_counter --function increment --args "$PARTY" --sender "$ALICE" --gas "$GAS_B" --gas-budget 50000000 --json > evidence/party-b.json &
PID_B=$!
wait "$PID_A"
wait "$PID_B"
python3 client/receipt.py evidence/party-a.json
python3 client/receipt.py evidence/party-b.json
python3 client/read_object.py "$PARTY" party
```

Require **both successful receipts**, CONSENSUS_ADDRESS ownership by Alice and final value **2**. The two shell processes demonstrate inflight submission, not parallel execution of conflicting writes or a performance benchmark. Owner start version and current object version serve different purposes; versions need not equal the draft's historical numbers. Explicitly selecting separate gas coins is a supplemental reproducibility guard, not a change to the Move program.

When finished, unset `SUI_CONFIG_DIR` and remove the disposable lab directory only if you no longer need its Testnet signing keys. Keep keys/recovery phrases out of Git; deleting them relinquishes control of these disposable objects. Network procedures above are documented but **not executed by the agent**; local tests establish value behavior and parser guards, not Testnet admission/finality.
