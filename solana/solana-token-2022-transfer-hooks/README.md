# Run the article's Token-2022 fee-on-transfer example

[Article](https://andreyobruchkov1996.substack.com/p/solana-token-2022-transfer-hooks)

`run_local.py` executes the printed fee-on-transfer CLI workflow with a zero-decimal mint, 100 basis points and maximum fee 5. It is a supplemental local adaptation of the article's devnet commands. The hook section is conceptual: this folder does not invent a hook program.

Tested with Python 3, Agave/solana-keygen 3.1.9 and spl-token-cli 5.5.0 already installed:

```sh
python3 run_local.py --check
python3 run_local.py
python3 -m unittest discover -s tests -v
```

The runner creates temporary Alice/Bob wallets, explicitly derives Bob's public key (`solana-keygen pubkey bob.json`, missing from the article), creates both ATAs and mints 1000 to Alice. Sending 100 asserts **Alice 900, Bob 99 spendable, 1 withheld** in Bob's transfer-fee extension. A supplemental second send of 600 verifies the maximum fee: 5 withheld, leaving Alice 300, Bob 694 and total withheld 6; supply remains 1000.

It uses only its owned loopback validator, temporary config and keys, then removes them on exit. It never changes the active CLI config or uses public funds. Default RPC port 30200 can be changed with `--rpc-port`; URL overrides and unsupported tool versions fail before wallet/ledger creation. Unit tests cover the guards; runtime assertions run only with `run_local.py`.
