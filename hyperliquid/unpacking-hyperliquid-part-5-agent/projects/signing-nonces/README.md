# Part 5: offline signing, signed bytes and nonce concurrency

Exact source: [Unpacking Hyperliquid Part 5](https://andreyobruchkov1996.substack.com/p/unpacking-hyperliquid-part-5-agent),
rendered article captured **2026-10-30 15:11:13 UTC**. The three `.py` programs
preserve native code-block text byte-for-byte, including whitespace and the absence
of a final newline. No algorithm, indentation, key, or constant was changed.

| File | Native block | SHA-256 |
| --- | --- | --- |
| `01_sign_and_recover.py` | 8 | `32ff6ba25233749f79509cd56bbdd0f7bf45e253d8c200d8885939f5d8499fbe` |
| `02_signed_preimage_mutations.py` | 10 | `7ddd021042bff830af40787d6b846d841c29b55ab7e1a836e0245a2fd2565497` |
| `03_nonce_allocator.py` | 17 | `319122b135ea3aa8de9d65f4841910835460fe3466945f9bb56ac4a5a872424c` |

**PUBLIC TEST KEYS — NEVER FUND.** Program01 uses only the deliberately public,
deterministic master/agent fixtures printed in the article. No fresh wallet is
created. The mainnet-domain comparison only computes a signature locally: it does
not submit or approve anything on any network. These fixtures are unsuitable for
any real funds or account authority.

## Setup and run

The article specifies Python **3.11+** and SDK **0.24.0** (setup block7).
`requirements.txt` is supplemental packaging of that exact SDK pin. The optional
`requirements-verified.txt` records the full dependency versions used by this audit
on Python3.12.14/Linux; it is not a published article dependency lock or a universal
cross-platform guarantee.

```sh
# From this directory; isolated environment only:
python3 -m venv .venv
.venv/bin/python -m pip install -r requirements.txt
.venv/bin/python 01_sign_and_recover.py
.venv/bin/python 02_signed_preimage_mutations.py
.venv/bin/python 03_nonce_allocator.py
.venv/bin/python -m unittest discover -s tests -v
```

Program03 needs only the standard library. Programs01/02 need the SDK and its
transitive dependencies. No RPC endpoint, funded account, wallet file, environment
secret, faucet, or network access is needed **after dependency installation**.

## Supplemental checks and actual result

`tests/test_offline.py` is new test orchestration, not author-source. It executes
all three unchanged programs and asserts signer recovery, distinct master/agent
addresses, testnet phantom source, network-domain signature difference, five
preimage hashes, the six-worker collision/uniqueness outputs, 1,000 allocations
across16 threads, and monotonic behavior under a regressing clock. Program subprocesses
reject DNS/socket-connection audit events as an extra offline test boundary.

**2026-10-30: all5 tests passed**, Python3.12.14, SDK0.24.0; `pip check` passed.
Dependencies were installed only in an ignored local virtualenv. No global packages
were changed. No chain actions, account approvals, transactions or random key
generation were performed.

These results establish local behavior, not HyperCore authorization or acceptance.
The nonce allocator remains an in-memory, single-process teaching example: it does
not coordinate multiple processes, persist restart state, enforce the server time
window, or solve key-rotation replay rules. No full blog prose is copied here.
