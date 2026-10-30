# Supplemental fixture-allocation checks

The preserved program explicitly allocates **54 bytes** for its teaching fixture:
`Some(true)`, title `"GM"`, and one voter. It accepts dynamic instruction arguments,
but that allocation is not sufficient for every possible title/voter input. This
is a fixture limitation, not a claim that the article promises a general allocator.

`allocation.rs` imports the original `DaoProposal` unchanged and serializes it on
the host using Anchor's account serialization (including the discriminator). It
asserts the original fixture's exact byte layout and compares sizes for longer,
Unicode, empty, None, and multiple-voter inputs. This does not execute `init` or
prove the precise on-chain error for an oversized account write.

Run from `examples/solana/borsh-proposal`:

```sh
cargo test -p borsh_deep_dive --test allocation
```

For other inputs, account-space planning is `8 + (1 + active.is_some() as usize)
+ 4 + title.len() + 4 + 32 * voters.len()` for this original discriminator and
field schema. `title.len()` is UTF-8 byte length. This is explanatory sizing, not
a replacement program. A general application should choose bounded input limits,
checked arithmetic, and an allocation strategy before changing the teaching code.

Do not run the original Anchor/TypeScript transaction test as a host unit test:
it expects generated IDL/types, a local validator and a funded disposable wallet.
No keys or transactions are required by these new serialization checks.

**2026-10-30: not run** — Rust/Cargo are absent from the audit environment. No
Rust compilation, serialization test pass, or on-chain behavior is claimed.
