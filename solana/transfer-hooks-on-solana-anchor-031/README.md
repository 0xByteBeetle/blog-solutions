# Token-2022 transfer-hook program

[Article](https://andreyobruchkov1996.substack.com/p/transfer-hooks-on-solana-anchor-031)

Requires Node 22+, Anchor **0.31.1**, Agave/Solana **3.1.9**, Rust/Cargo and SBF build tools. On the recorded Node 22.6 environment, set `NODE_OPTIONS=--experimental-require-module` for the Web3/UUID dependency. Install pinned JS dependencies with `npm ci --ignore-scripts`.

Use the local runner, not the historical Anchor provider/wallet settings. `--execute-local` creates disposable keys; even build-only is not credential-free. Runtime tests use a fresh local validator on 19899 (with 19901–20000 free), reject public-provider/external-wallet overrides and never use your normal wallet. Source files are copied to a temporary workspace; local program IDs/config are substituted there only.

`programs/transfer-hook-project/` and `scripts/published-client.ts` preserve the printed implementation (documented quote normalization/placeholders only). The printed Rust lacks two CHECK annotations and fails Anchor IDL lint. `check-annotations.rs` is the explicit two-comment variant; comments add no account-validation logic.

```sh
npm test
# Exact printed route: expected lint failure remains visible.
node scripts/run-local.mjs --execute-local --build-only
# Explicit comment-only variant:
node scripts/run-local.mjs --execute-local --regression --check-annotations
```

Only the temporary client copy receives local program/mint IDs, loopback endpoint and a guarded entrypoint. Regression checks metadata-PDA initialization, oversize-transfer rejection, unchanged rejected balances and successful-transfer balances. It does not substitute the historical original program's differently named error.

Anchor configuration is supplemental local-only setup: the checked-in wallet path deliberately does not exist. The runner creates and disposes its own keys and overrides the temporary config; no default/personal wallet is read.

Agave 3.1.9 [binds RPC/WebSocket listeners to all interfaces](https://github.com/anza-xyz/agave/blob/v3.1.9/test-validator/src/lib.rs#L1100-L1108), and its test faucet also uses an all-interface listener. The configured 127.0.0.1 URLs restrict these clients, not the server listeners. Before startup, use an appropriate existing development/isolation environment; reachability depends on your host/network controls. These scripts do not change firewall or security settings.
