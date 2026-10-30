# Article-local setup (unpublished draft)

The current source and all manifests are in `projects/current-draft/`.

```sh
cd projects/current-draft
python3 -m unittest discover -s tests -v
```

These standard-library tests are offline and use synthetic fixtures, not real gRPC or chain execution. Read that directory's README for pinned dependencies and separately gated Move checks. Do not execute captured Testnet transaction commands as setup. `projects/original-reference/` contains labeled historical variants/evidence, not current execution proof.
