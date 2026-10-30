# Blog code examples

Runnable examples for [Andrey Obruchkov’s writing](https://andreyobruchkov1996.substack.com).

- [EVM](evm/)
- [Solana](solana/)
- [Hyperliquid](hyperliquid/)
- [Sui](sui/) — draft companions

Each article folder contains its code, required configuration, focused tests and a README with setup commands. Start there; installing every chain’s toolchain is not necessary to run one example.

Solidity examples keep `foundry.toml`, `src/` and `test/` in the article folder or a named subproject. In an article with nested projects, `make build` and `make test` run all of its Solidity examples; its README also lists commands for each subproject.

## Run repository checks

With the toolchains listed in the article READMEs installed:

```sh
make setup
make verify
```

These checks build and test locally; they do not invoke public-chain transaction examples. Local Solana validators and Sui Move tests have explicit commands in their article READMEs. Never run historical transaction examples with a personal or funded wallet.
