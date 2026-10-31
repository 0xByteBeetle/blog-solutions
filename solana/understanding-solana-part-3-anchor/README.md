# Anchor accounts

[Article](https://andreyobruchkov1996.substack.com/p/understanding-solana-part-3-anchor)

Requires Node 22+, Anchor **0.31.1**, Agave/Solana **3.1.9**, Rust/Cargo and SBF build tools. On the recorded Node 22.6 environment, set `NODE_OPTIONS=--experimental-require-module` for the Web3/UUID dependency. Install pinned JS dependencies with `npm ci --ignore-scripts`.

Use the local runner, not the historical Anchor provider/wallet settings. `--execute-local` creates disposable keys; even build-only is not credential-free. Runtime tests use a fresh local validator on 19899 (with 19901–20000 free), reject public-provider/external-wallet overrides and never use your normal wallet. Source files are copied to a temporary workspace; local program IDs/config are substituted there only.

The program is in `programs/solana_accounts/`; its original TypeScript account test is in `tests/`. The scripts beside the runner are original client examples, not automatic setup commands.

```sh
npm test
node scripts/run-local.mjs anchor-accounts --execute-local
# Compile only (still creates disposable local keys):
node scripts/run-local.mjs anchor-accounts --execute-local --build-only
```

Anchor configuration is supplemental local-only setup: the checked-in wallet path deliberately does not exist. The runner creates and disposes its own keys and overrides the temporary config; no default/personal wallet is read.

Agave 3.1.9 [binds RPC/WebSocket listeners to all interfaces](https://github.com/anza-xyz/agave/blob/v3.1.9/test-validator/src/lib.rs#L1100-L1108), and its test faucet also uses an all-interface listener. The configured 127.0.0.1 URLs restrict these clients, not the server listeners. Before startup, use an appropriate existing development/isolation environment; reachability depends on your host/network controls. These scripts do not change firewall or security settings.

The supported runner also executes supplemental `tests/readback.ts`: it fetches the derived PDA after create/update, verifies owner/name/time/bump, and requires actual account absence after close. The printed client and original signature-only tests remain unchanged.
