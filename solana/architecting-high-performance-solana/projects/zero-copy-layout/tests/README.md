# Supplemental host-layout assertions

`layout.rs` imports the original `published_zero_copy_layout::MarketState` from
`src/lib.rs`; no implementation, layout, or source hash was changed. It turns the
published print-only demonstration into size/alignment/offset assertions, checks
all zero/default bytes, and shows that explicit padding fields are real data.

Run from this project's directory with Rust >=1.77 (`offset_of!` stabilization):

```sh
cargo test --test layout
```

Dependencies remain those declared by the original project: Anchor 0.31.1 and
bytemuck. A first build may require registry downloads. The expected 8-byte
alignment is a host/target assumption checked by the test, not a universal Rust
ABI guarantee. The fixed little-endian byte map runs only on little-endian hosts;
the native-endian padding test is separate. No discriminator/account wrapper is
part of this 24-byte struct test. No validator, wallet, or network transaction.

**2026-10-30: 4 host tests passed** on macOS arm64 with Rust/Cargo 1.92.0,
using the locked dependencies offline. This validates the host layout only;
no Solana program build or validator execution was performed.
