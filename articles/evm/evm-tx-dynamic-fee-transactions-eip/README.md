# EVM Tx — Dynamic Fee Transactions EIP-1559 (Type 0x02) Explained

[Read the article on Substack](https://andreyobruchkov1996.substack.com/p/evm-tx-dynamic-fee-transactions-eip)

Published: 2025-11-08

The article contains 6 displayed code or output blocks. This page maps those examples to maintained implementations and checks; it does not duplicate the article itself.

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
