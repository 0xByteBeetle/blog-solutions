# Article-local reproduction

Source: https://andreyobruchkov1996.substack.com/p/where-token-metadata-lives-on-solana

Each named project keeps its own manifests. Commands below are reproduction setup; author snippets and original variants remain unchanged. Published snippets are in `published.md`; this is not a duplicate of the blog prose. Original-repository variants remain separate from published variants. Toolchain executables are external prerequisites; see each project manifest. Do not run transaction/deployment commands against public networks without separate authorization.

Catalog source restoration does not imply every excerpt has a complete runnable implementation. See README source map and verification status for remaining gaps. Historical verification records refer to pre-migration paths; a topology migration alone is not a runtime rerun.

## Per-project build commands

Run commands below from this article directory. These build/test commands do not run transaction script entrypoints. Go requires the version declared by go.mod (the current reproduction used Go 1.24.x); Solidity requires Foundry 1.4.4 with the compiler selected by its config. Rust projects require a compatible stable Rust toolchain. Dependency restores require registry/network access.
