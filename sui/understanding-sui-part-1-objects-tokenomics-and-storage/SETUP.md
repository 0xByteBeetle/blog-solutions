# Article-local setup (unpublished draft)

The current source and all manifests are in `projects/current-draft/`.

```sh
cd projects/current-draft
python3 -m unittest discover -s tests -v
```

These standard-library tests are offline and use synthetic fixtures, not real gRPC or chain execution. Read that directory's README for pinned dependencies and separately gated Move checks. Do not execute captured Testnet transaction commands as setup. `projects/original-reference/` contains labeled historical variants/evidence, not current execution proof.

The [October 30 Mac run](../../verification/mac-sui-drafts-2026-10-30.md) passed these nine offline tests and the separately selected Sui 1.82.3 Move build/three-test/negative-compile route. Use an existing matching executable as documented; the verification did not install a CLI or perform chain operations.
