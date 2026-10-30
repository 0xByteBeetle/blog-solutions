# Article-local reproduction

Source: https://andreyobruchkov1996.substack.com/p/understanding-solana-part-5-transaction

## Scope

Upstream Transaction/Signature types, formulas, instruction names and pseudocode. No complete original program promised by blocks.

**No standalone author program is missing or required for this article.** The exact reference snippets, commands and illustrative outputs are retained in `published.md`; they are not presented as a complete application.

This classification concerns the displayed material, not a claim that the full prose has been technically audited. Optional supplementary demonstrations below are assistant-authored labs, not recovered author programs.

## Optional supplementary demonstrations

Run these commands from this article directory. They are optional, not requirements to complete the conceptual article.

### Accounts, PDAs, Borsh bytes, messages, signatures, fee math, and address lookup tables

Local source: `supplementary/fundamentals`.

Requires Go compatible with `supplementary/go/go.mod` (reproduction target Go 1.24.x). First build may fetch pinned modules. These package tests do not call a public blockchain.

```sh
cargo test --manifest-path supplementary/fundamentals/Cargo.toml
```

## Verification limits

Dated source freshness, source integrity and optional lab execution are separate. Historical reports retain historical paths/dates; moving this directory does not imply a new execution pass. No public-network transaction is authorized by these instructions.
