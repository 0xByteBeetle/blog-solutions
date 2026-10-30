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
