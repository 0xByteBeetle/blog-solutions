# EVM source-alignment checkpoint — 30 October 2026

## What was checked

All **37 EVM articles**, containing **338 displayed blocks**, were inspected structurally against the committed article snapshots. **59 blocks** declare direct implementation links, totaling **65 block-to-file links**; 21 are exact substrings; 62 pass a stronger literal-preserving token comparison. The remaining three require an explicitly reviewed ABI-JSON formatting exception. All 65 pass these scoped checks. This is a link-level result, **not full article verification**. Original-repository variants are retained as variants and are not automatically claimed identical to excerpts.

The new check closes a real gap: `check-catalog.mjs` verifies file hashes and that linked files exist, but previously did not check that a linked file actually contained the block it purported to implement. The regression suite includes a valid but incorrect mapping, which the new check rejects.

The old broad whitespace normalization can discard meaningful spaces in string literals. It remains a diagnostic, not the pass/fail rule. The stronger comparison preserves string contents, token boundaries and adjacent operators; it normalizes typographic quotes and comment whitespace. This is still a conservative lexer, not a compiler or semantic-equivalence proof. Exact, literal-preserving and reviewed-ABI results are recorded separately in [the machine-readable audit](evm-alignment-2026-10-30.json).

Run from repository root:

```sh
node scripts/check-evm-alignment.mjs
node --test scripts/evm-alignment.test.mjs
```

The four new tests passed on this checkpoint. No authored implementations, publication snapshots, source hashes, or article completion statuses were changed. Fresh Foundry/Go runtime tests were **not run** here: Foundry is absent, and the available `/usr/bin/go` is not the Go programming-language toolchain (`go version` exits with `Go: Unknown option: version`). Prior runtime evidence stays separately dated in its existing reports; it is not a result from this audit.

## Per-article result

“Links matched” reports declared mappings only. An unmapped block can be output, a command, a fragment, or an unimplemented program; the count alone does not identify which and must not become a coverage percentage. The JSON report lists every unmapped block and its classification for follow-up.

| Article | Displayed blocks | Blocks with direct mapping | Links matched | Remaining boundary |
| --- | ---: | ---: | ---: | --- |
| [Proxies and Upgradability - Minimal Proxy (EIP-1167)](https://andreyobruchkov1996.substack.com/p/proxies-and-upgradability-minimal) | 6 | 1 | 1 / 1 | Mappings match; unmapped blocks require type-aware review |
| [Factories - How Smart Contracts Deploy Other Contracts](https://andreyobruchkov1996.substack.com/p/factories-how-smart-contracts-deploy) | 3 | 1 | 1 / 1 | Mappings match; unmapped blocks require type-aware review |
| [Proxies and Upgradability - UUPS proxy (EIP-1822)](https://andreyobruchkov1996.substack.com/p/proxies-and-upgradability-uups-proxy) | 5 | 2 | 2 / 2 | Mappings match; unmapped blocks require type-aware review |
| [Proxies and Upgradability - Transparent Proxy (EIP-1967)](https://andreyobruchkov1996.substack.com/p/proxies-and-upgradability) | 11 | 3 | 3 / 3 | Export differs in blocks 5/7/10; see capture caveat below |
| [Deployments & Deterministic Addresses (CREATE vs CREATE2)](https://andreyobruchkov1996.substack.com/p/deployments-and-deterministic-addresses) | 11 | 1 | 1 / 1 | Mappings match; unmapped blocks require type-aware review |
| [Batching Calls Efficiently with Multicall and RPC batch](https://andreyobruchkov1996.substack.com/p/batching-calls-efficiently-with-multicall) | 2 | 1 | 1 / 1 | Mappings match; unmapped blocks require type-aware review |
| [Catching ETH (Native) Transfers Without Events](https://andreyobruchkov1996.substack.com/p/catching-eth-native-transfers-without) | 3 | 0 | 0 / 0 | No exact implementation links; not a runnable-coverage claim |
| [Streaming On-Chain Activity in Real Time](https://andreyobruchkov1996.substack.com/p/streaming-on-chain-activity-in-real) | 1 | 1 | 1 / 1 | Mappings match; unmapped blocks require type-aware review |
| [Understanding Events - The EVM's Built-In Log System](https://andreyobruchkov1996.substack.com/p/understanding-events-the-evms-built) | 3 | 0 | 0 / 0 | No exact implementation links; not a runnable-coverage claim |
| [eth_call vs debug_traceCall: How to Simulate, Trace, and Debug Ethereum Transactions](https://andreyobruchkov1996.substack.com/p/eth_call-vs-debug_tracecall-how-to) | 7 | 0 | 0 / 0 | Block 4 contains an incomplete RPC command |
| [What's Behind Your RPC: Node Types, Clients, and Why It Matters](https://andreyobruchkov1996.substack.com/p/whats-behind-your-rpc-node-types) | 0 | 0 | 0 / 0 | No displayed code; prose-only snapshot |
| [EVM Message — SignTypedData EIP-712 Secure Off-Chain Signatures for Real-World Ethereum Apps Explained](https://andreyobruchkov1996.substack.com/p/evm-message-signtypeddata-eip-712) | 5 | 1 | 2 / 2 | 2 block(s) also have original-repository variants; not asserted identical |
| [EVM Message — Signed Data EIP-191 and the Ethereum Message Prefix](https://andreyobruchkov1996.substack.com/p/evm-message-signed-data-eip-191-and) | 6 | 0 | 0 / 0 | 1 block(s) also have original-repository variants; not asserted identical |
| [EVM Tx — SetCode Transactions EIP-7702 Temporary Smart-Account Power for EOAs Explained](https://andreyobruchkov1996.substack.com/p/evm-tx-setcode-transactions-eip-7702) | 12 | 3 | 5 / 5 | 3 block(s) also have original-repository variants; not asserted identical |
| [EVM Tx — Blob Transactions EIP-4844 (Type 0x03) and the First Step Toward Data Sharding](https://andreyobruchkov1996.substack.com/p/evm-tx-blob-transactions-eip-4844) | 2 | 0 | 0 / 0 | 1 block(s) also have original-repository variants; not asserted identical |
| [EVM Tx — Dynamic Fee Transactions EIP-1559 (Type 0x02) Explained](https://andreyobruchkov1996.substack.com/p/evm-tx-dynamic-fee-transactions-eip) | 6 | 0 | 0 / 0 | 1 block(s) also have original-repository variants; not asserted identical |
| [EVM Tx — Access List Transactions EIP-2930 (Type 0x01) Explained](https://andreyobruchkov1996.substack.com/p/evm-tx-access-list-transactions-eip) | 6 | 0 | 0 / 0 | 1 block(s) also have original-repository variants; not asserted identical |
| [EVM Tx — Understanding Legacy Ethereum Transactions (Type 0x0)](https://andreyobruchkov1996.substack.com/p/evm-tx-understanding-legacy-ethereum) | 4 | 1 | 1 / 1 | 2 block(s) also have original-repository variants; not asserted identical |
| [What is Recursive-length prefix (RLP) serialization](https://andreyobruchkov1996.substack.com/p/what-is-recursive-length-prefix-rlp) | 4 | 2 | 2 / 2 | 4 block(s) also have original-repository variants; not asserted identical |
| [Tracing Ethereum Transactions: How to Read and Understand EVM Execution Step-by-Step](https://andreyobruchkov1996.substack.com/p/tracing-ethereum-transactions-how) | 11 | 3 | 3 / 3 | Mappings match; unmapped blocks require type-aware review |
| [EVM Developer Tools Explained + Foundry Setup](https://andreyobruchkov1996.substack.com/p/evm-developer-tools-explained-foundry) | 7 | 1 | 1 / 1 | Mappings match; unmapped blocks require type-aware review |
| [Solidity Execution Overview: Payable, Fallback, Calls Types, and Reverts Explained](https://andreyobruchkov1996.substack.com/p/solidity-execution-overview-payable) | 10 | 0 | 0 / 0 | No exact implementation links; not a runnable-coverage claim |
| [ABI Encoding Deep Dive: How Solidity Turns Your Data into Bytes](https://andreyobruchkov1996.substack.com/p/abi-encoding-deep-dive-how-solidity) | 5 | 1 | 1 / 1 | Previously recorded selector typo in block 3 remains |
| [What Actually Happens When Calldata Hits the EVM](https://andreyobruchkov1996.substack.com/p/what-actually-happens-when-calldata) | 6 | 1 | 1 / 1 | Mappings match; unmapped blocks require type-aware review |
| [Ethereum Calldata and Bytecode: How the EVM Knows Which Function to Call](https://andreyobruchkov1996.substack.com/p/ethereum-calldata-and-bytecode-how) | 10 | 1 | 1 / 1 | Mappings match; unmapped blocks require type-aware review |
| [Introduction to the Ethereum Virtual Machine (EVM)](https://andreyobruchkov1996.substack.com/p/introduction-to-the-ethereum-virtual) | 1 | 0 | 0 / 0 | No exact implementation links; not a runnable-coverage claim |
| [Diamonds in EVM: The Proxy That Scales Beyond Limits](https://andreyobruchkov1996.substack.com/p/diamonds-in-evm-the-proxy-that-scales-beyond-limits-2fedc282cadf) | 25 | 10 | 10 / 10 | Previously recorded repeated selector query in block 24 remains |
| [Understanding Contract Deployments, Proxies, and CREATE2 — Part 2](https://andreyobruchkov1996.substack.com/p/understanding-contract-deployments-proxies-and-create2-part-2-df8f05998d5e) | 14 | 4 | 4 / 4 | Mappings match; unmapped blocks require type-aware review |
| [Understanding Contract Deployments, Proxies, and CREATE2 — Part 1](https://andreyobruchkov1996.substack.com/p/understanding-contract-deployments-proxies-and-create2-part-1-696b0b11f8a5) | 22 | 4 | 4 / 4 | Mappings match; unmapped blocks require type-aware review |
| [Ethereum Dev Hacks: Catching Hidden Transfers, Real-Time Events, and Multicalls](https://andreyobruchkov1996.substack.com/p/ethereum-dev-hacks-catching-hidden-transfers-real-time-events-and-multicalls-bef7435b9397) | 9 | 2 | 2 / 2 | Mappings match; unmapped blocks require type-aware review |
| [Ethereum Node Types Explained (And Why They Can Make or Break Your Debugging)](https://andreyobruchkov1996.substack.com/p/ethereum-node-types-explained-and-why-they-can-make-or-break-your-debugging-fc8d89b724cc) | 7 | 0 | 0 / 0 | Block 4 contains an incomplete RPC command |
| [Gas Matters: How to Reduce Transaction Costs in Your Solidity Code](https://andreyobruchkov1996.substack.com/p/gas-matters-how-to-reduce-transaction-costs-in-your-solidity-code-0c0303d61a4f) | 22 | 2 | 2 / 2 | Mappings match; unmapped blocks require type-aware review |
| [Understanding Ethereum Transactions and Messages: From State Changes to Off-Chain Messages — Part 2](https://andreyobruchkov1996.substack.com/p/understanding-ethereum-transactions-and-messages-from-state-changes-to-off-chain-messages-part-2-e8ef96b82768) | 19 | 4 | 7 / 7 | Mappings match; unmapped blocks require type-aware review |
| [Understanding Ethereum Transactions and Messages: From State Changes to Off-Chain Messages — Part 1](https://andreyobruchkov1996.substack.com/p/understanding-ethereum-transactions-and-messages-from-state-changes-to-off-chain-messages-part-1-54130865e71e) | 24 | 2 | 2 / 2 | Mappings match; unmapped blocks require type-aware review |
| [What Every Blockchain Developer Should Know About EVM Internals — Part 3](https://andreyobruchkov1996.substack.com/p/what-every-blockchain-developer-should-know-about-evm-internals-part-3-b6813d964592) | 18 | 4 | 4 / 4 | Mappings match; unmapped blocks require type-aware review |
| [What Every Blockchain Developer Should Know About EVM Internals – Part 2](https://andreyobruchkov1996.substack.com/p/what-every-blockchain-developer-should-know-about-evm-internals-part-2-eab0f4fae3de) | 20 | 2 | 2 / 2 | Mappings match; unmapped blocks require type-aware review |
| [What Every Blockchain Developer Should Know About EVM Internals— Part 1.](https://andreyobruchkov1996.substack.com/p/what-every-blockchain-developer-should-know-about-evm-internals-part-1-83a93c618257) | 11 | 1 | 1 / 1 | Mappings match; unmapped blocks require type-aware review |

## Reviewed ABI formatting differences

The stronger check exposed three mappings hidden by the old whitespace-only comparison:

- `evm-tx-setcode-transactions-eip-7702`, block 11 → `examples/evm/transaction-types/eip7702/eip7702_batch.go`.
- `understanding-ethereum-transactions-and-messages-from-state-changes-to-off-chain-messages-part-2-e8ef96b82768`, block 13 → the same EIP-7702 file.
- `ethereum-dev-hacks-catching-hidden-transfers-real-time-events-and-multicalls-bef7435b9397`, block 8 → `examples/evm/multicall/main.go`.

The snippets parse these raw strings as JSON ABI data. The source recovery pretty-printed or reflowed that JSON. For **only these three links**, the checker permits JSON syntax whitespace differences after checking valid JSON arrays. It preserves JSON string contents, field order, duplicate keys and values. Tests reject changed string contents and duplicate-key changes. No implementation or snapshot was altered, and these three are not reported as exact literal matches.

## Source freshness and publication discrepancies

The committed snapshots were captured in September. The October 29 authenticated handover export is useful corroboration but loses indentation, block boundaries, and some angle-bracket text. Direct live Substack retrieval was unavailable in this environment, so this audit does not certify current live text.

In `proxies-and-upgradability`, exported text omits `<PRIVATE-KEY-FROM-ANVIL>` in block 5 and `<YOUR-PRIVATE-KEY>` in blocks 7 and 10. This is consistent with lossy extraction and is not enough evidence to alter preserved sources. Block 10 also uses `http://localhost:8545` in the export versus `http://127.0.0.1:8545` in the snapshot. Both are loopback endpoints, but this remains a textual discrepancy requiring a live source check. No attempt was made to repair the snapshot from lossy text.

The existing [review findings](REVIEW-FINDINGS.md) still record the ABI selector typo and diamond inspection-command discrepancy. They were not recalculated in this environment and remain explicit editorial decisions rather than silent code changes.

## Next work

1. Compare live block boundaries/text when available, preserving captured versions rather than overwriting uncertain differences.
2. Review unmapped **program** and **program-with-omitted-imports/pragma** blocks first. Supply clearly labeled setup only; request author source or a semantic decision when the missing code cannot be established.
3. Run the recovered EVM projects with a real Go/Foundry toolchain and disposable local Anvil, with exact source/harness hashes. Build-only checks of transaction programs must stay separate from execution.
4. Preserve intentional failures and original variants. Do not replace article snippets with passing topic-level labs or mark an entire article complete because one mapped contract runs.

## Reproduction runner health

The build and local-EVM runners now check tool identity before creating temporary state or replacing reports. A command merely named `go` is not enough: `go version` must identify the Go compiler. Missing Foundry/Go/Rust tools are setup blockers, not failed author examples.

Three preflight regression tests passed. Both runners were also invoked in this tool-limited environment and rejected the unavailable toolchain before running examples. SHA-256 checks confirmed that `restored-builds.json` and `restored-evm.json` remained unchanged. These were preflight checks, not fresh EVM build/runtime results.
