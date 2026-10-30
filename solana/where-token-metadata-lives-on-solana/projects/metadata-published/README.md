# Published metadata clients — setup, not a network-run approval

`metadata.ts` and `read.ts` are exact copies of blocks 4 and 5 from the preserved
[article snapshot](../../published.md).
The snapshot was captured September 6, 2026; exact live block text was verified
on October 30 in `verification/live-source-freshness-2026-10-30.json`.
No imports, API calls, historical addresses, or error-handling logic were changed.
Hashes and block provenance are in `catalog/source-files.json`.

## Type-check safely

From this directory, with Node 22 or later:

```sh
npm ci --ignore-scripts
npm run check
```

The lockfile and TypeScript config are supplemental reproduction scaffolding, not
claimed original dependency versions. Dependencies pin Metaplex metadata 3.4.0,
Umi packages 1.5.1, TypeScript 5.9.3 and Node types 24.10.1. Catch variables are
allowed as `any` solely to type-check the preserved article's `error.message` access;
other strict checks remain enabled. No JavaScript is emitted, imported, or executed
by `check`.

## Do not execute unchanged scripts blindly

- `metadata.ts` immediately reads `~/.config/solana/id.json`, then its main function
  constructs and submits a devnet transaction. No wallet is included or created here.
- `read.ts` immediately invokes its main function and queries devnet. Its historical
  mint may no longer exist or have the expected authority/metadata.
- Metadata creation requires control of the selected mint authority, an existing
  compatible mint, funded transaction payer, reachable RPC and the deployed Metaplex
  program. Type-checking establishes none of these.
- `https://example.com/metadata.json` is a placeholder, not a usable uploaded asset.
- The original read client's string-matched error handling is not a universal
  missing-account classification guarantee.

No network-run command or npm `start` task is provided. A runnable isolated local
fixture requires separate explicit configuration/program setup; it must be labeled
supplemental and must not silently replace these author snippets.

## Verification — 2026-10-30

Fresh `npm ci --ignore-scripts` and `npm run check` passed on Node24.22.1.
The locked Umi dependency family is consistently 1.5.1, reusing the existing
repository metadata-lab lock as the baseline rather than pulling incompatible
newer transitive versions. npm emitted a transitive uuid8 deprecation notice.
This is a type-check result only; see `verification/metadata-published.json`.
