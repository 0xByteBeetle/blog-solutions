# Part 1: account types

[Article](https://andreyobruchkov1996.substack.com/p/hyperliquid-beyond-generic-vms-the)

`src/lib.rs` preserves the printed Rust types. Cargo configuration and tests are supplemental. `fixtures/clearinghouse.json` is the complete printed Part 2 response, retained here only because the Rust deserialization tests require it; unrelated spot fixtures are not copied.

Requires Rust/Cargo; dependencies are pinned in Cargo.toml and Cargo.lock. From this directory:

```sh
cargo test --locked
```

Three host tests cover response round-tripping, numeric-versus-string rejection, and required/unsigned timestamp fields. No API, wallet, or blockchain runtime is used. The moved package has not yet been rerun with Rust on this cloud host.
