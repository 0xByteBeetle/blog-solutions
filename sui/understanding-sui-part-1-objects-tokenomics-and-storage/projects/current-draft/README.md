# Current Sui Foundations draft: native gRPC client companion

Status: **unpublished draft 221819065**, captured 2026-10-30. The four files in
`client/` are exact native code blocks 24, 27, 30 and 33, not reconstructed from
screenshots. `provenance.json` records byte hashes. This replaces neither the
published EVM/Solana catalog nor the historical GraphQL variant: that variant
must stay explicitly labeled if retained.

## Requirements and checks

Python 3.10+; the draft's exact dependency versions are in `requirements.txt`.
Create an article-local virtual environment and restore dependencies with:

```sh
python3 -m venv .venv
. .venv/bin/activate
python3 -m pip install -r requirements.txt
python3 -m pip check
```

Dependency restore and `pip check` passed in an isolated Linux/Python 3.12.14
virtual environment. Exact rpc imports and a synthetic protobuf message
roundtrip also passed without opening a channel. Actual gRPC transport/reflection
integration has **not** been run. These pins reproduce the draft, not an assertion
that every platform provides wheels. No wallet, private key, funding or
transaction submission is needed by these clients.

Supplemental deterministic tests require only Python's standard library:

```sh
python3 -m unittest discover -s tests -v
```

Nine tests passed on Python 3.12.14 (six client checks and three source/lock integrity checks). They use explicitly synthetic fixtures and
replace the imported `rpc` function; they do **not** exercise real gRPC,
reflection, protobuf compatibility, live object availability or live historical
version retention. They cover network rejection, response persistence, coin
byte decoding, wrong-length rejection, mismatch rejection and historical-object
completeness/consistency checks.

## Optional read-only live sequence

From this directory, after restoring dependencies:

```sh
python3 client/rpc.py
python3 client/01_read_object.py
python3 client/02_decode_coin.py
python3 client/03_inspect_storage.py
```

The exact original programs read Sui Testnet. They may fail if the endpoint no
longer retains the specified object/version/transaction; such failure is not a
reason to fabricate or substitute historical output. The third command decodes
the saved response locally. The fourth requires both historical object versions;
its explicit failure is preserved. Real network commands were **not run** here.

The five exact Move/config source blocks already match branch
`432209b5b8e592631e3931b5e9ed5a9b38aef3bb`. Their separate build/test checks are
historical and must be rerun with the appropriate Sui toolchain before claiming
a fresh Move pass. Existing installer/verifier helpers differ from the current
draft's suiup setup and must be labeled supplemental, not exact draft blocks.

Run Python normally, **not with -O or PYTHONOPTIMIZE**: the exact draft clients use assertions for consistency checks. Optimization disables those checks.

## Existing CLI Move verification

With an existing official Sui **1.82.3** executable:

```sh
python3 verify.py --sui /absolute/path/to/sui
```

This original supplemental helper checks the pinned version, builds, asserts the
three named Move tests, and requires the intended copy-ability compiler failure.
It uses an isolated empty keystore and no transaction commands. Initial Move
framework dependency resolution may need GitHub access; cached dependencies are
needed if network access is forbidden. No fresh Move execution is claimed here.
