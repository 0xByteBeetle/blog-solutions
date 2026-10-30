# Interest-bearing Token-2022 tokens

[Article](https://andreyobruchkov1996.substack.com/p/engineering-native-yield-a-deep-dive)

Interest-rate setup/update and decoded account checks. Synthetic checker tests are not chain observations.

Requires Python 3, Bash, curl, `spl-token` **5.5.0** and Agave/Solana **3.1.9**. Other versions are rejected rather than silently treated as compatible.

```sh
python3 -m unittest discover -s tests -v
bash run.sh --preflight
bash run.sh --execute-local
```

These scripts are supplemental runnable setup for this article, not a second generic workshop. Preflight checks flags/versions only. Execution creates disposable local keys/accounts and a fresh loopback validator; no default wallet, external RPC or public-network fallback is used. Choose an unused port with `WORKSHOP_RPC_PORT`; keys/logs remain under ignored `.local/`.
