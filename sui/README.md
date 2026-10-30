# Sui code companions — unpublished drafts

These two drafts are **not** part of the 58 published articles. The original source branch is preserved separately; this import contains only code, setup, exact code/command/output blocks and essential historical verification fixtures, not complete blog text.

| Draft | Article-local code/setup | Current evidence |
|---|---|---|
| Foundations, 221819065 | [Part 1](understanding-sui-part-1-objects-tokenomics-and-storage/) | 35 exact native blocks; 9 offline tests; fresh Move checks pending existing Sui 1.82.3 |
| Ownership, 222510085 | [Part 2](understanding-sui-part-2-ownership/) | 72 exact native blocks; 15 offline tests; fresh Move checks require recorded Sui 1.83.0 |

All 107 blocks were captured read-only on October 30, 2026. Six Python files match their current draft blocks exactly; ten Move/config files preserve their source text with recorded final-newline differences. Supplemental wrappers/tests are identified separately. Historical receipts and 109 passing receipt-consistency checks establish fixture consistency, not fresh transactions or consensus behavior. Real gRPC reflection/transport and live object retention have not been verified. No public-network transactions, personal wallets, or funding are part of default tests.

Run all offline checks from the repository root:

```sh
python3 scripts/check-sui-drafts.py
python3 -m unittest discover -s sui/understanding-sui-part-1-objects-tokenomics-and-storage/projects/current-draft/tests -v
python3 -m unittest discover -s sui/understanding-sui-part-2-ownership/projects/current-draft/tests -v
```
