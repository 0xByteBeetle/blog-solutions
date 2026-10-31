# Borsh account serialization

[Article](https://andreyobruchkov1996.substack.com/p/solana-deep-dive-unpacking-borsh)

Requires Node 22+, Anchor **0.31.1**, Agave/Solana **3.1.9**, Rust/Cargo and SBF build tools. On the recorded Node 22.6 environment, set `NODE_OPTIONS=--experimental-require-module` for the Web3/UUID dependency. Install pinned JS dependencies with `npm ci --ignore-scripts`.

Use the local runner, not the historical Anchor provider/wallet settings. `--execute-local` creates disposable keys; even build-only is not credential-free. Runtime tests use a fresh local validator on 19899 (with 19901–20000 free), reject public-provider/external-wallet overrides and never use your normal wallet. Source files are copied to a temporary workspace; local program IDs/config are substituted there only.

`profile/` demonstrates the fixed-size age/balance account; `proposal/` demonstrates dynamic fields and allocation. Both are article-related examples, not interchangeable variants.

```sh
npm test
node scripts/run-local.mjs borsh-profile --execute-local
node scripts/run-local.mjs borsh-proposal --execute-local
(cd proposal && cargo test --locked -p borsh_deep_dive --test allocation)
```

Add `--build-only` to compile without a validator. The sample Proposal payload is 44 bytes, plus its 8-byte discriminator (52 bytes total); dynamic inputs require their own sizing. Host allocation tests do not replace local-chain tests.

Anchor configuration is supplemental local-only setup: the checked-in wallet path deliberately does not exist. The runner creates and disposes its own keys and overrides the temporary config; no default/personal wallet is read.

Agave 3.1.9 [binds RPC/WebSocket listeners to all interfaces](https://github.com/anza-xyz/agave/blob/v3.1.9/test-validator/src/lib.rs#L1100-L1108), and its test faucet also uses an all-interface listener. The configured 127.0.0.1 URLs restrict these clients, not the server listeners. Before startup, use an appropriate existing development/isolation environment; reachability depends on your host/network controls. These scripts do not change firewall or security settings.
