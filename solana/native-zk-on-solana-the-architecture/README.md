# Confidential Token-2022 transfers

[Article](https://andreyobruchkov1996.substack.com/p/native-zk-on-solana-the-architecture)

**Blocked by default:** with spl-token 5.5.0/Agave 3.1.9, setup/create/configure/mint passed, then phase 06 deposit simulation failed with `InvalidInstructionData` in Token-2022 Deposit. Apply/transfer/withdraw/destination checks did not run. The last observed public balance was 100; there was no post-failure balance query. This is a specific failed attempt, not proof the feature is universally unsupported.

The historical script preflight requires `spl-token` **5.6.1** and rejects the installed **5.5.0** CLI with exit 1. Python 3, Bash, curl and Solana tools are also required. Passing the version and flag checks does not establish runtime compatibility.

```sh
python3 -m unittest discover -s tests -v
bash run.sh --preflight
```

These scripts are supplemental runnable setup for this article, not a second generic workshop. Preflight checks flags/versions only. Execution creates disposable local keys/accounts and a fresh loopback validator; no default wallet, external RPC or public-network fallback is used. Choose an unused port with `WORKSHOP_RPC_PORT`; keys/logs remain under ignored `.local/`.

After a passing preflight, `--execute-local` still exits 3 before starting a validator. Do not source `scenario.sh` directly. Enabling it requires a proof-enabled compatible local runtime and successful deposit/apply/transfer/withdraw validation, not just changing the version gate.
