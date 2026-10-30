# Zero-copy account layout

[Article](https://andreyobruchkov1996.substack.com/p/architecting-high-performance-solana)

Requires Node 22+, Anchor **0.31.1**, Agave/Solana **3.1.9**, Rust/Cargo and SBF build tools. On the recorded Node 22.6 environment, set `NODE_OPTIONS=--experimental-require-module` for the Web3/UUID dependency. Install pinned JS dependencies with `npm ci --ignore-scripts`.

Use the local runner, not the historical Anchor provider/wallet settings. `--execute-local` creates disposable keys; even build-only is not credential-free. Runtime tests use a fresh loopback validator on 19899 (with 19901–20000 free), reject public-provider/external-wallet overrides and never use your normal wallet. Source files are copied to a temporary workspace; local program IDs/config are substituted there only.

`published/` contains the printed zero-copy program; `original/` is the materially different repository example. `layout/` is the small standalone layout check. They are not three copies of one program.

```sh
npm test
node scripts/run-local.mjs zero-copy --execute-local
node scripts/run-local.mjs zero-copy-original --execute-local
(cd layout && cargo test --locked)
```

Add `--build-only` to either local runner to compile without a validator. Layout tests check size, alignment, field offsets and bytes; local Anchor tests check account initialization. They do not establish production-safe authority constraints.

Anchor configuration is supplemental local-only setup: the checked-in wallet path deliberately does not exist. The runner creates and disposes its own keys and overrides the temporary config; no default/personal wallet is read.

## Supplemental two-step allocation above 10 KiB

Both preserved programs allocate only **32 bytes** with `init`; they demonstrate the small layout, not the article’s large-account allocation pattern. `large-account/` is a labeled supplemental variant with a 16,448-byte account and the same pinned Anchor 0.31.1 toolchain:

```sh
(cd large-account && cargo test --locked)
node scripts/run-local.mjs large-account --execute-local
```

The client first sends a separate System Program `createAccount` transaction with explicit space, rent and program owner. It verifies the buffer is owned by the program, all-zero and larger than 10,240 bytes. A second transaction, signed by the allocated account as well as the authority, invokes the `zero`-constrained initializer and `load_init`; later updates use `load_mut`. The runtime tests verify exact size, owner, discriminator-backed state, volume updates and unchanged payload, then reject initialization without the allocated account’s signature, reinitialization, wrong sizes (10,240; 16,440; 16,456), wrong owner and an unauthorized updater. Host tests verify size/alignment/offsets. This avoids using an inner `init` allocation above its 10,240-byte CPI increase limit; [Anchor’s zero-copy documentation](https://www.anchor-lang.com/docs/features/zero-copy) describes the two-step pattern.

The supplemental variant records an authority and returns a checked overflow error; those are explicit fixture guards, not edits to the original programs or a claim that their access control is production-safe. The existing local runner supplies disposable keys/IDs and an owned loopback validator, then removes its temporary workspace. No public-chain execution is needed.
