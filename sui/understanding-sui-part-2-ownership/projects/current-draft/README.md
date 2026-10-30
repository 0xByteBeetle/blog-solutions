# Current Ownership draft source

Five Move modules are exact matches to draft blocks 8, 11, 14, 17 and 20.
The two Python clients are exact blocks 24 and 32; compared with the historical
reference they differ only blank lines/final newline (Python AST identical).
`Move.toml` is supplemental, copied from the original documented minimal template.
No full blog prose is included.

## Offline checks

Python 3.10+: `python3 -m unittest discover -s tests -v` (four synthetic receipt
checks plus four fake-CLI guard checks and four mocked reader checks pass; no chain or transport calls). Dependency versions for the optional
gRPC reader are in requirements.txt; restore in a project-local .venv. The exact
versions were restored and import/protobuf-smoke-checked in cloud using Python
3.12.14, not tested against a live endpoint.

## Local Move checks

Use an existing official Sui 1.83.0 CLI:

```sh
python3 run_move_tests.py --sui /absolute/path/to/sui
```

This supplemental runner uses an isolated empty keystore and only `move build`
and `move test`. It does not generate keys or invoke `sui client`, faucet, publish,
or transaction commands. Initial framework dependency resolution needs network
access. **Fresh Move execution NOT RUN in this cloud checkpoint.**

The copied original helper `local_cli.py` selects an isolated configuration; its
Testnet URL is not a request to contact or transact on that network. The runner
asserts the keystore remains empty after every subprocess.

Current and historical source remain separate. Do not reinterpret the original
reference's recorded Testnet receipts as output from a new run.

Run Python normally, **not with -O or PYTHONOPTIMIZE**: the exact draft clients use assertions for consistency checks. Optimization disables those checks.

`move/Move.lock` is copied byte-for-byte from the recorded Testnet build and pins
framework revision `719fb2960ccfbf9f4d33041f8ea5146d30671696`. It is supplemental
setup evidence, not a claim this new project has built. The runner must observe
all seven expected Move test names and a seven-pass/zero-failure summary; fake
CLI regression tests ensure an exit-zero/no-tests result is rejected. The local
Party test does not establish runtime admission or consensus ordering; the freeze
test does not establish runtime mutable-input rejection. Historical Testnet
receipts remain separate evidence for those boundaries.
