# Hyperliquid source and execution audit — 2026-10-30

## Exact source recovery

Five live rendered articles, 79 native blocks. Consumer verified source bundle
SHA256 `b853bfdffbf101877f61ee1ba98ae94f89cd327345d8cc144666067d78f195ef`
and every extracted text hash before snapshot creation. Browser collection used
`pre.textContent` without trimming; full article prose remains outside the repo.
Surrounding source context distinguishes code, intentional negatives, outputs,
commands, abbreviated responses and diagrams. Screenshots are not fabricated.

The catalog now has 58 articles / 573 blocks (37 EVM + 16 Solana + 5 Hyperliquid).
The first 53 snapshots remain unchanged. Their separate live browser audit
verified all 494 blocks exactly on October 30; see
`live-source-freshness-2026-10-30.json`.
29 Hyperliquid links are exact literal substrings, including supplemental wrappers
around exact Solidity source and exact output fixtures. No broad whitespace matcher
is accepted. The linked Part4 original repository is independently pinned at
`cdd5e21b6e22229f83661f125cabb68ded9d1061`, with seven byte-exact files.

## Actual verification

- Part1/2: 3 Python fixture checks and 3 Rust integration tests pass. The Rust
  tests ran on the publishing Mac with Rust/Cargo1.92.0, using cached dependencies
  offline; the generated Cargo.lock is retained. The earlier cloud fixture-only
  result remains historical.
- Part3: Foundry1.4.4 / solc0.8.30 build and 10 mock-VM tests pass. Tests validate
  ABI/header/body encoding and original local behavior, not actual precompile
  availability, HyperCore account semantics or asynchronous CoreWriter acceptance.
- Part4: 10 tests of recovered original pure builders pass; 8 tests of exact
  excerpts pass using real offline payload construction or explicitly fake Info/
  exchange fixtures. Credential preparation and signing/submission blocks8/9 are
  never executed. `Infinity` acceptance is characterized in originals; optional
  finite-price wrappers reject nonfinite strings without changing originals.
- Part5: all three exact programs run offline; 5 assertion tests and `pip check`
  pass on Python3.12.14 with SDK0.24.0. Only published deterministic public fixture
  keys are used. The runner rejects socket connection/DNS events. This verifies
  local signatures/hash/nonce behavior, not account authorization or server state.

See each companion's README and verification JSON for exact commands and hashes.
No public-chain reads, transaction submissions, new wallets or funds were needed.
No article is automatically elevated to fully verified because an offline test passes.

The publishing Mac also passed all 17 Node regression tests, the catalog/source
checks (58 articles, 573 blocks, 143 recovered files), all 29 literal Hyperliquid
links, 10 Foundry mock tests, and Python suites with 3/8/10/5 tests. The SDK suite
used an isolated Python3.12.1 venv with every version from
`requirements-verified.txt`, including SDK0.24.0; `pip check` passed. Its child
interpreters reject network connection/DNS events. No original source, fixture
whitespace, or published EOF was repaired. See
[Mac verification](hyperliquid-mac-checks-2026-10-30.json) for actual outputs and limits.

## Preserved limits

The spot response contains literal `...`; it is saved as `.json.txt`, not silently
repaired. WrongOracle stays an intentional negative. Price normalization's input
bounds and unvalidated order fields are explicitly tested/documented, not claimed
as native acceptance. Nonce allocation is single-process/in-memory, not a durable
multi-worker service. HIP-3 TypeScript union snippets omit referenced types and
are not claimed to compile. Linked original runnable files remain separate from
printed excerpts and their minimal supplemental harnesses.
