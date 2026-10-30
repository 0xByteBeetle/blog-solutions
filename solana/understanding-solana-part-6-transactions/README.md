# Versioned transactions and address lookup tables

[Article](https://andreyobruchkov1996.substack.com/p/understanding-solana-part-6-transactions)

Requires Node 22+, Anchor **0.31.1**, Agave/Solana **3.1.9**, Rust/Cargo and SBF build tools. On the recorded Node 22.6 environment, set `NODE_OPTIONS=--experimental-require-module` for the Web3/UUID dependency. Install pinned JS dependencies with `npm ci --ignore-scripts`.

Use the local runner, not the historical Anchor provider/wallet settings. `--execute-local` creates disposable keys; even build-only is not credential-free. Runtime tests use a fresh loopback validator on 19899 (with 19901–20000 free), reject public-provider/external-wallet overrides and never use your normal wallet. Source files are copied to a temporary workspace; local program IDs/config are substituted there only.

`programs/` and `scripts/client.ts` contain the printed implementation. `scripts/client-alt-ready.ts` is the explicit supplemental correction: wait for confirmed ALT contents/context, use minContextSlot, and preserve the RPC default rebroadcast policy. No duplicate historical workspace is needed.

```sh
npm test
node scripts/run-local.mjs --execute-local --build-only
node scripts/run-local.mjs --execute-local --regression --alt-ready
```

The regression creates local token fixtures, verifies balances and exercises ALT extension/use. Without `--alt-ready`, the original client remains selected and may reproduce its cold-ALT failure. `--prepared-alt` is a separate prepopulated-ALT experiment, not proof that cold extension works. The runner creates an IDL filename alias only in the temporary build output. Never run the original clients against their historical addresses blindly.

Anchor configuration is supplemental local-only setup: the checked-in wallet path deliberately does not exist. The runner creates and disposes its own keys and overrides the temporary config; no default/personal wallet is read.
