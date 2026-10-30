# Sui draft 221819065: code companion

**Unpublished draft — not part of the 58 published-article catalog.**

- `draft-source/`: all native code/command/output blocks, exact hashes and source URL. No full article prose. Commands are source evidence, not a script to execute blindly.
- `projects/current-draft/`: exact current source plus explicitly supplemental setup and tests.
- `projects/original-reference/`: selected original code and essential historical evidence, preserved byte-for-byte from commit `432209b5b8e592631e3931b5e9ed5a9b38aef3bb`. Older implementations are reference variants, not proof of current-draft behavior. Import-scope guidance is supplemental; redundant archives/screenshots are excluded.

Both projects are inside this article folder; no sibling article is required. The original branch remains untouched. Historical evidence is labeled by its original provenance and has not been relabeled as fresh execution.

Python checks are offline unless a read-only network client is explicitly selected. No wallet, faucet, publish, transfer or transaction commands are run by the supplemental offline checks. Move build/test checks require the documented existing CLI and separate fresh verification; historical passes do not prove this checkpoint.

Read the project's setup before running commands. Sui Testnet transaction examples retained as source/history are **not** part of an automatic/default test route.

[Fresh Mac verification on October 30, 2026](../../verification/mac-sui-drafts-2026-10-30.md): existing Sui 1.82.3 built the current Move package, passed all three named Move tests and rejected the intended copy-ability fixture. Nine offline Python tests also passed. The run used an empty isolated keystore and no chain operations; original source and Move locks are unchanged.
