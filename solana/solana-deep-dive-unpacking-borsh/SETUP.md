# Article-local reproduction

Source: https://andreyobruchkov1996.substack.com/p/solana-deep-dive-unpacking-borsh

Each named project keeps its own manifests. Commands below are reproduction setup; author snippets and original variants remain unchanged. Published snippets are in `published.md`; this is not a duplicate of the blog prose. Original-repository variants remain separate from published variants. Toolchain executables are external prerequisites; see each project manifest. Do not run transaction/deployment commands against public networks without separate authorization.

Catalog source restoration does not imply every excerpt has a complete runnable implementation. See README source map and verification status for remaining gaps. Historical verification records refer to pre-migration paths; a topology migration alone is not a runtime rerun.

## Original Anchor variants

Requires Anchor 0.31.1, Rust/Cargo, Solana CLI and SBF tools. Run `npm ci --ignore-scripts` here, then `node scripts/run-original-anchor.mjs <project-name> --build-only`. The article-local harness only accepts project names present under `projects/`; **even `--build-only` generates disposable program/wallet signing keys**; both build-only and runtime use require explicit local key authorization, while runtime additionally starts a local validator. The harness and pinned package dependencies are supplemental, while author manifests remain unchanged inside each original project.

## Per-project build commands

Run commands below from this article directory. These build/test commands do not run transaction script entrypoints. Go requires the version declared by go.mod (the current reproduction used Go 1.24.x); Solidity requires Foundry 1.4.4 with the compiler selected by its config. Rust projects require a compatible stable Rust toolchain. Dependency restores require registry/network access.

- `cd projects/borsh-profile && cargo test --locked` (host test, not on-chain execution).
- `projects/borsh-proposal`: use the article-local Anchor harness described above (not plain Cargo as a replacement for SBF/validator checks).

## Node.js 22.6 interoperability prerequisite

The verified Mac runtime used Node.js 22.6 with `NODE_OPTIONS=--experimental-require-module` to let the CommonJS Web3 dependency load its ESM UUID dependency. On that version, export `NODE_OPTIONS=--experimental-require-module` before running the article-local Anchor harness. This is the recorded environment prerequisite, not a change to author code or a new launcher implementation. Other Node versions require their own compatibility check.
