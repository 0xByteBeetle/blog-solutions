# 0xByteBeetle Blog Examples

This repository contains the runnable companions to Andrey Obruchkov's technical articles about EVM and Solana engineering.

The articles explain the ideas. This repository proves the examples.

The catalog covers all 53 Substack posts published at the time of the audit: 37 EVM posts and 16 Solana posts, containing 494 displayed code or output blocks. Every article appears in [ARTICLES.md](ARTICLES.md). Each entry points to the maintained source files, tests, and smallest useful command. Related posts share an implementation when they teach the same mechanism, so fixes do not drift across copied projects.

## Repository layout

```text
evm/
  foundry/          Solidity, bytecode, gas, deployment, proxy, and observability labs
  go/               RLP, transaction envelopes, signatures, blobs, and RPC clients
  rpc/              Local Anvil simulations and trace requests
solana/
  fundamentals/     Accounts, instructions, messages, signatures, fees, and ALTs
  anchor/           PDA, Borsh, zero-copy, and transfer-hook programs
  token-2022/       Local-validator exercises for Token-2022 extensions
  metadata/         Metaplex metadata PDA and instruction-construction examples
articles/
  evm/              One compact code map for every EVM article
  solana/           One compact code map for every Solana article
scripts/            Repository-wide verification and catalog checks
```

## Run everything

Install the two pinned JavaScript dependency trees once:

```bash
./scripts/setup.sh
```

The deterministic suite does not require funded accounts or a public RPC endpoint.

```bash
./scripts/verify.sh
```

The local-chain suite starts disposable local nodes and exercises requests that need a real runtime.

```bash
./scripts/verify-local-chains.sh
```

Individual article pages contain the smallest command for reproducing that article's examples.

The verified local suites include 24 Foundry tests, the Go package tests, seven Solana fundamentals tests, two Metaplex instruction tests, ten Anchor integration tests, Anvil traces, and six Token-2022 runtime scenarios.

## Verification policy

A displayed code example is covered only when its implementation is present in this repository and one of these checks exists:

1. A deterministic unit or integration test.
2. A local Anvil or Solana validator scenario.
3. A clearly marked network exercise when the behavior cannot be reproduced locally.

Expected output is never invented. Captured output records the command, tool version, date, and whether a local chain or public network was used.

Private keys, funded wallets, personal RPC keys, and deployment authorities do not belong in this repository. Test keys are generated for disposable local validators.

One current platform boundary is recorded rather than hidden: the confidential-transfer flow is complete, but the Zk ElGamal proof program reported that it was temporarily disabled during the 9 August 2026 verification. The repository therefore does not claim a successful confidential transfer. See [`solana/token-2022`](solana/token-2022) for the exact flow and compatibility notes.

## Article sources

The canonical writing remains on [Substack](https://andreyobruchkov1996.substack.com) and [Medium](https://medium.com/@andrey_obruchkov). This repository contains the supporting code, not copies of the articles.
