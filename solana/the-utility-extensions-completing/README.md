# Token-2022 utility extensions

[Article](https://andreyobruchkov1996.substack.com/p/the-utility-extensions-completing)

Utility-extension scenarios include a direct instruction fixture proving a missing-memo program rejection, rather than accepting a CLI precheck as the on-chain result.

Requires Python 3, Bash, curl, `spl-token` **5.5.0** and Agave/Solana **3.1.9**. Other versions are rejected rather than silently treated as compatible. The pinned Node dependencies support the memo-rejection fixture.

```sh
npm ci --ignore-scripts
python3 -m unittest discover -s tests -v
bash run.sh --preflight
bash run.sh --execute-local
```

These scripts are supplemental runnable setup for this article, not a second generic workshop. Preflight checks flags/versions only. Execution creates disposable local keys/accounts and a fresh local validator; no default wallet, external RPC or public-network fallback is used. Choose an unused port with `WORKSHOP_RPC_PORT`; keys/logs remain under ignored `.local/`.

Agave 3.1.9 [binds RPC/WebSocket listeners to all interfaces](https://github.com/anza-xyz/agave/blob/v3.1.9/test-validator/src/lib.rs#L1100-L1108), and its test faucet also uses an all-interface listener. The configured 127.0.0.1 URLs restrict these clients, not the server listeners. Before startup, use an appropriate existing development/isolation environment; reachability depends on your host/network controls. These scripts do not change firewall or security settings.
