# Sui draft Mac verification — October 30, 2026

The code-only import at `a0b097630ba44f9007f362467b3a7b306540269b` matches tree `871247a279247d4329a6740f20b14c6bc9250cfd` on main base `63e1c2ed0ae8c342d3b0977fe105c4e411305e7c`. All 27 transport chunks, gzip bytes and decompressed patch passed the supplied SHA-256 checks. Five source/history whitespace warnings were preserved. The 404 Sui files include 107 exact native blocks from two unpublished drafts; they do not expand the 58 published-article catalog.

All 24 offline checks passed: nine Foundations checks and 15 Ownership checks. All 28 root integrity/topology tests and the catalog/topology/import gates also passed. Complete command outputs and [structured evidence](mac-sui-drafts-2026-10-30.json) are retained in [the evidence directory](mac-sui-drafts-2026-10-30/).

## Foundations local Move result

The reviewed supplemental command was `python3 sui/understanding-sui-part-1-objects-tokenomics-and-storage/projects/current-draft/verify.py --sui /Users/andreyobruchkov/.local/bin/sui`. The existing executable reported `sui 1.82.3-bf4073918ed3`; no CLI was installed.

- `sui move build` exited 0 and produced a 422-byte `notebook.mv`, SHA-256 `47036b656e02133e9794fb73ab06d9d33f32496ea4633a0cfafdba5ecba76219`.
- `sui move test` reported three passed, zero failed: create/update, distinct object IDs and wrong capability.
- `sui move build --path negative/copy_object` exited 1 with `EC05001`: `UID` lacks the required `copy` ability. The intended failure is preserved.

This establishes compilation and local Move unit behavior only. Real gRPC transport/reflection, live object availability and historical object retention were not tested. Historical receipts remain fixture-consistency evidence.

## Ownership runtime gate

The Ownership helper requires Sui 1.83.0. PATH, the active Sui binary, existing suiup binary directories, task-local named Sui directories and the specifically named `sui-testnet-v1.83.0` download were checked. Only Sui 1.82.3 was found. Ownership's fresh Move execution is blocked by the missing 1.83.0 binary; no other version was substituted and nothing was installed. Its 15 offline tests passed, including the wrong-version guard.

## Source preservation and cleanup

All 404 imported file hashes matched immediately after the runtime run. Current draft code, native blocks, original-reference files, provenance and tracked Move locks were unchanged. Four supplemental documentation files now reference this dated result; only their entries in the import hash catalog were deliberately refreshed.

The isolated keystore was verified empty before removal. The run-generated Sui config, Move dependency cache, output directory and both build directories were absent before this run and were removed after evidence was copied outside `sui/`. No personal configuration was read or modified. No chain reads, publications, transaction submissions, signing keys or funding were used.
