# EVM Tx — Blob Transactions EIP-4844 (Type 0x03) and the First Step Toward Data Sharding

[Read the article on Substack](https://andreyobruchkov1996.substack.com/p/evm-tx-blob-transactions-eip-4844)

Published: 2025-11-08

The article contains 2 displayed code or output blocks. This page maps those examples to maintained implementations and checks; it does not duplicate the article itself.

## Companion implementation

### Legacy, EIP-2930, EIP-1559, EIP-4844, and EIP-7702 transaction envelopes

Code: `evm/go/transactions`

Run:

```bash
cd evm/go && go test ./transactions
```

### EIP-191 personal messages and EIP-712 typed-data hashing and recovery

Code: `evm/go/signing`

Run:

```bash
cd evm/go && go test ./signing
```

## Verification boundary

The mapped deterministic tests or disposable local-chain scenario passed on 9 August 2026.
