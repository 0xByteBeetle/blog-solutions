# Sui: Objects, tokenomics and storage

Code for [the unpublished draft](https://andreyobruchkov1996.substack.com/publish/post/221819065). Current draft source is preserved; Python tests and keyless run helpers are supplemental.

## Run locally

Use Python 3.10+ (tested with 3.12) and an existing Sui **1.82.3** CLI. Run from this directory:

```sh
python3 -m unittest discover -s tests -v
python3 verify.py --sui /absolute/path/to/sui
```

The Python tests use synthetic fixtures, not a network. The Move runner uses an isolated empty keystore; it never generates a key or submits a transaction. Initial framework dependency resolution may need network access. The checked-in lock pins the framework.

The Move runner checks three named tests, compiled bytecode and the intentional copy-ability compiler rejection in `negative/copy_object/`. Six Python tests cover reading/decoding synthetic coin data and missing or inconsistent history.

## Read the example object (optional network access)

```sh
python3 -m venv .venv
. .venv/bin/activate
python3 -m pip install -r requirements.txt
python3 tests/check_dependency_apis.py
python3 client/rpc.py
python3 client/01_read_object.py
python3 client/02_decode_coin.py
python3 client/03_inspect_storage.py
```

The clients use Sui Testnet. The decoder reads the preceding saved response locally; the final command requests historical object versions. Missing historical data is an explicit failure, not a reason to substitute invented output. Offline tests do not verify live gRPC transport or reflection.

Run Python without `-O` or `PYTHONOPTIMIZE`: the original clients use assertions for consistency checks. Generated evidence, caches and build output are ignored.

## Inspect the compiled getter without a wallet

The existing keyless runner now executes the article's `sui move build --disassemble`, then prints `notebook.value` from `build/sui_foundations/disassembly/notebook.mvb`:

```sh
python3 verify.py --sui /absolute/path/to/existing/sui-1.82.3
sed -n '/public value(/,/^}/p' build/sui_foundations/disassembly/notebook.mvb
```

Run from this folder: the package is here, not in a nested `move/` directory. `verify.py` supplies its isolated empty-keystore environment and verifies the CLI version before building; it does not initialize a personal wallet. The generated getter should contain MoveLoc, ImmBorrowField, ReadRef and Ret. These show movement of the **reference**, borrowing the notebook's value field, reading its u64 and returning it; they do not copy the key-bearing object. The runner checks those operations without a full bytecode snapshot. Compiler/framework changes can alter disassembly details. Generated build output stays ignored.
