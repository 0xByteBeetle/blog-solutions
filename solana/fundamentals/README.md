# Solana fundamentals lab

This crate turns the architecture, account, instruction, message, signature, fee, and address lookup table examples into deterministic tests. It does not contact a cluster and never needs a funded keypair.

Run the checks:

```bash
cargo test
```

Inspect one signed transaction, PDA, and fee calculation:

```bash
cargo run --example inspect
```

The generated keys exist only in memory and are different on every run.
