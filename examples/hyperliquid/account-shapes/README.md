# Parts 1–2: published account shapes and historical response excerpts

The original Rust structs in `src/lib.rs` are **exact Part1 native block1**, captured
from the rendered published article on2026-10-30. The fixtures preserve Part2 native
blocks2 and4 byte-for-byte. Setup and tests here are supplemental; no schema or
published implementation was rewritten.

| File | Source |
| --- | --- |
| `src/lib.rs` | [Part1](https://andreyobruchkov1996.substack.com/p/hyperliquid-beyond-generic-vms-the), block1 |
| `fixtures/clearinghouse.json` | [Part2](https://andreyobruchkov1996.substack.com/p/unpacking-hyperliquid-part-2-hyperbft), block2 |
| `fixtures/spot-response.json.txt` | Same Part2, block4, **abbreviated text, not valid JSON** |

The spot excerpt includes a literal `...` omission marker. It is deliberately not
renamed or silently repaired into a complete JSON response. Python tests assert its
parse failure and separately examine only the three displayed rows after explicitly
removing that marker in test memory. That limited view does not recover omitted
balances. There is no invented Rust spot-account schema.

These are historical published examples, not current account queries. The Rust
fixture has an empty positions array; passing its round-trip test does not establish
that every live position variant matches the author's simplified model. No wallet,
private key, RPC call, agent approval, transaction or funds are needed here. Part1's
illustrative approval payload is not a runnable submission and is not included.

## Supplemental setup

`Cargo.toml` pins serde **1.0.228** and serde_json **1.0.149**, taken from the existing
repository's `examples/solana/transfer-hook-original/Cargo.lock` as a compatible
starting point. These are **not claimed as the author's original article versions**.
The manifest is a host Rust2021 library with serde derive; Rust/Cargo and initial
registry access are required. A new project lockfile remains to be generated and
verified by the runtime-owning worker, not guessed by hand.

```sh
# From this directory:
cargo test
# Independent fixture checks, stdlib-only:
python3 -m unittest discover -s tests -p 'test_*.py' -v
```

Rust tests deserialize the unchanged complete clearinghouse fixture into the actual
published struct, compare serialized JSON round-trip values, reject numbers in
string-valued fields, and reject malformed unsigned timestamps/missing required
fields. They use no invented nonempty account sample.

## Verification — 2026-10-30

- **3 Python fixture tests passed**, Python3.12.14. This is independent JSON/shape
  checking, not Rust execution.
- **3 Rust integration tests prepared, NOT RUN here:** cloud Rust/Cargo unavailable.
  Parent will request the supported Mac runtime route after checkpointing. No Rust
  compile/pass or Cargo.lock is claimed yet.
- Exact-source SHA-256 checks passed for all three preserved files.

No full article prose is duplicated here. Do not use a sample balance or timestamp
as a live assertion, or assume sample consistency is a universal protocol invariant.
