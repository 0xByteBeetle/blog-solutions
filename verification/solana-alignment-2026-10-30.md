# Solana article alignment — 2026-10-30

Source-only audit on branch codex/article-alignment-20261030. All 16 cataloged
articles / 156 displayed blocks inspected at mapping/classification level.
18 declared implementation links: 10 exact substring matches, 7 individually
reviewed formatting adaptations, 1 documented program-ID substitution. All 18
match after those scoped changes; no general whitespace deletion is accepted.
Broad normalization remains diagnostic only.
138 blocks have no direct implementation link; that does not mean 138 missing programs.
All existing published snapshots, author implementations and source hashes remain unchanged.
Two exact metadata client extractions and their hashes/links were added to the catalog.

## Per-article inventory

| Article | Blocks | Direct links | Example projects | Remaining boundary |
| --- | --- | --- | --- | --- |
| [Architecting High-Performance Solana Programs: The Zero-Copy Deep Dive](https://andreyobruchkov1996.substack.com/p/architecting-high-performance-solana) | 6 | 3 | `zero-copy-original`, `zero-copy`, `zero-copy-layout` | Unmapped fragments/output and runtime coverage remain separate |
| [Solana Deep Dive: Unpacking Borsh Serialization Under the Hood](https://andreyobruchkov1996.substack.com/p/solana-deep-dive-unpacking-borsh) | 13 | 4 | `borsh-proposal`, `borsh-profile` | Unmapped fragments/output and runtime coverage remain separate |
| [The Utility Extensions: Completing the Token-2022 Architecture](https://andreyobruchkov1996.substack.com/p/the-utility-extensions-completing) | 13 | 0 | none | Preserved blocks only; no inferred runnable implementation |
| [Native ZK on Solana: The Architecture of Confidential Transfers](https://andreyobruchkov1996.substack.com/p/native-zk-on-solana-the-architecture) | 12 | 0 | none | Preserved blocks only; no inferred runnable implementation |
| [Engineering Native Yield: A Deep Dive into Solana's Interest-Bearing Mint Extension](https://andreyobruchkov1996.substack.com/p/engineering-native-yield-a-deep-dive) | 10 | 0 | none | Preserved blocks only; no inferred runnable implementation |
| [Transfer Hooks on Solana: Anchor 0.31 & Token-2022](https://andreyobruchkov1996.substack.com/p/transfer-hooks-on-solana-anchor-031) | 15 | 3 | `transfer-hook`, `transfer-hook-original` | Unmapped fragments/output and runtime coverage remain separate |
| [Solana Token-2022 Transfer Hooks and the Fee-on-Transfer Extension](https://andreyobruchkov1996.substack.com/p/solana-token-2022-transfer-hooks) | 9 | 0 | none | Preserved blocks only; no inferred runnable implementation |
| [From Convention to Explicit State: Token-2022 and Metadata Pointers on Solana](https://andreyobruchkov1996.substack.com/p/from-convention-to-explicit-state) | 6 | 0 | none | Preserved blocks only; no inferred runnable implementation |
| [Where Token Metadata Lives on Solana: From Convention to Explicit Data](https://andreyobruchkov1996.substack.com/p/where-token-metadata-lives-on-solana) | 5 | 2 | `metadata-published` | Exact clients restored; type-check passes, devnet execution not run |
| [SPL Token Program Architecture: A Technical Overview](https://andreyobruchkov1996.substack.com/p/spl-token-program-architecture-a) | 13 | 0 | none | Preserved blocks only; no inferred runnable implementation |
| [Understanding Solana – Part 6: Transactions, Messages, and Address Lookup Tables in Practice](https://andreyobruchkov1996.substack.com/p/understanding-solana-part-6-transactions) | 13 | 3 | `wallet-token-balances`, `wallet-token-balances-original` | Unmapped fragments/output and runtime coverage remain separate |
| [Understanding Solana - Part 5: Transaction, Serialization, Signatures, Fees, and Runtime Execution](https://andreyobruchkov1996.substack.com/p/understanding-solana-part-5-transaction) | 9 | 0 | none | Preserved blocks only; no inferred runnable implementation |
| [Understanding Solana - Part4: Instructions and Messages](https://andreyobruchkov1996.substack.com/p/understanding-solana-part4-instructions) | 10 | 0 | none | Preserved blocks only; no inferred runnable implementation |
| [Understanding Solana - Part 3: Anchor Accounts, Seeds, Bumps, PDAs, and How the Client Really Works](https://andreyobruchkov1996.substack.com/p/understanding-solana-part-3-anchor) | 15 | 3 | `anchor-accounts` | Unmapped fragments/output and runtime coverage remain separate |
| [Understanding Solana: Account Model - part 2](https://andreyobruchkov1996.substack.com/p/understanding-solana-account-model) | 7 | 0 | none | Preserved blocks only; no inferred runnable implementation |
| [Understanding Solana: Architecture, Account Model and Transactions — part 1](https://andreyobruchkov1996.substack.com/p/understanding-solana-architecture-account-model-and-transactions-part-1-1bffae449650) | 0 | 0 | none | No displayed code; prose not audited |

## Discrepancies and source corroboration

- Borsh block2 does not match literally or after broad normalization because
  published `YourProgramIdHere...` is substituted with the recorded local program
  ID. `catalog/source-files.json` explicitly records this environment substitution.
  It is not invented logic; the catalog's generic substring match wording is too
  broad for this one link. Snapshot remains unchanged.
- Historical Oct29 export normalized text corroborates 148/156 blocks. The other
  eight are zero-copy blocks2,3,5,6 and Borsh blocks2,3,9,11. The export visibly
  drops Rust angle-bracket generic types (e.g. Context<T>, size_of::<T>) and other
  HTML-like content. Negative comparison is not proof of author/source drift.
  Live Substack freshness remains unverified; export is not an exact source.
- All per-block statuses and file paths are in
  [machine-readable inventory](solana-alignment-2026-10-30.json). Only code/block
  metadata is stored here; no full article prose copied.

## Findings and runnable setup

See [Solana run map](../examples/solana/README.md) for all 11 source directories,
shared pinned dependencies, safe local harness commands, historical verification
versus not-run stages, and semantic/test gaps. Particularly: zero-copy has no
creator authorization constraint; Borsh capacity is fixture-sized; several tests
only print results; transfer-hook's original negative assertion catches itself.
The existing corrected wallet ALT variant and stronger transfer-hook regression
are already present; do not duplicate their implementation.

Metadata clients (blocks4–5) now have exact source files with pinned type-check
setup; no public RPC or wallet was accessed. Missing direct links still include
Anchor account full program block3 (placeholder/smart-quote adaptation), and CLI
recipes with cluster/wallet/version requirements. Most other gaps are fragments,
output, pseudocode or deliberately failing commands. Recover source before
creating a new original; label all supplemental setup and corrected variants.

## Verification in this review

- Source/config/test/harness read-through and 18-link comparisons completed.
- No Solana program build/runtime, public-network transaction or wallet access
  attempted. Metadata npm dependencies installed with scripts disabled; both exact
  clients pass TypeScript no-emit checking. September 6 runtime reports are historical only.
- Required repository integrity tests run separately after these documentation
  additions; no claim of new Solana execution coverage.

## Closing the seven formatting-only links

Full unified diffs were manually reviewed, including strings, comments, templates
and Rust lifetimes. `scripts/check-solana-alignment.mjs` now requires exact
substring equality after only the scoped changes below; no language-parser or
semantic-equivalence guarantee is implied.

| Article/block | Actual adaptation |
| --- | --- |
| Borsh10 | Add four leading spaces to lines2–3; `GM` literal unchanged. |
| Transfer-hook6 | Add eight leading spaces to lines2–3 of generic call. |
| Transactions6/block1 | Program-ID placeholder's smart quote delimiters → ASCII. |
| Transactions6/block4 | Smart double-quote delimiters → ASCII; text unchanged. |
| Transactions6/block5 | Same delimiter repair; no string-body/whitespace changes. |
| Anchor3/block7 | Quote delimiters/comment example repair and `’info` → `'info` Rust lifetimes. |
| Anchor3/block13 | Quote delimiter/comment repair plus one four-line PDA derivation call reflowed onto one line. |

The eighth non-exact link is Borsh2: exact equality after the manifest-recorded
program-ID substitution. Three matcher tests pass, including changed literal
whitespace, template contents, token joins/operators and scoped lifetime repair.
Run `node scripts/check-solana-alignment.mjs` and
`node --test scripts/solana-alignment.test.mjs` from repository root.

Supplemental Rust host tests now assert zero-copy layout and Borsh fixture capacity;
they remain not run until a Rust/Cargo runtime is available. Runner toolchain
preflight now checks Anchor0.31.1 and required binaries before generating keys.
