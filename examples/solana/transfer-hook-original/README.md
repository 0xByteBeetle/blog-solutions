# Original transfer-hook project

Recovered byte-for-byte from Andrey's `~/clones/transfer-hook-project`. The source manifest records the original files and hashes. Personal wallets, keypairs and build artifacts are excluded. This repository variant is distinct from the printed article excerpt.

From the repository root:

```sh
npm ci --prefix solana/anchor --ignore-scripts
node scripts/run-original-anchor.mjs transfer-hook-original --regression
```

Requires Anchor 0.31.1 and the Solana build toolchain. The runner uses a temporary copy, fresh disposable keys and a local validator. It never deploys to a public network or uses the author's wallet.

The original program and original test remain unchanged. A [separate regression](../../../scripts/regressions/transfer-hook.ts) is derived from the original test and strengthens its assertions:

- A 1,500-token transfer must fail with the hook's amount-limit error, leaving both balances unchanged.
- A 500-token transfer must succeed, leaving 1,500 tokens at the source and 500 at the destination.

This avoids the original test's catch-all handling of its own failure assertion. The [recorded result](../../../verification/transfer-hook-original-regression.json) applies to this original project and this separate regression, not every example in the article.
