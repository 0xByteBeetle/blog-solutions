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
