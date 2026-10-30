# Run the article's SPL Token CLI walkthrough locally

[Article](https://andreyobruchkov1996.substack.com/p/spl-token-program-architecture-a)

`run_local.py` executes the article's create-mint → create-account → mint 1000 → balance → transfer 100 sequence. The article uses devnet and an active CLI wallet. This supplemental runner uses a fresh owned loopback validator, temporary Alice/Bob/mint keypairs and an explicit temporary config instead.

Tested with Python 3, Agave/solana-keygen 3.1.9 and spl-token-cli 5.5.0 already installed:

```sh
python3 run_local.py --check
python3 run_local.py
python3 -m unittest discover -s tests -v
```

The mint has six decimals. Assertions read raw RPC account data and CLI balances: supply `1000000000` base units = 1000 tokens, Alice 900, Bob 100. Bob's ATA is funded by the transfer's `--fund-recipient` flag.

The runner prints the CLI operations and removes its owned validator, ledger, config and keys on exit. It never changes the active Solana config or selects a public endpoint. Default RPC port is 30000; use `--rpc-port` to select a free local port. URL overrides are rejected before any tool/key/ledger creation; no tool installation or public fallback occurs. The unit tests check those runner guards; the runtime assertions execute only with `run_local.py`.
