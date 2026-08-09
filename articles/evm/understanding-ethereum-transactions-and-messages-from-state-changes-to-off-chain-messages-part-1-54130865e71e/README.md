# Understanding Ethereum Transactions and Messages: From State Changes to Off-Chain Messages — Part 1

[Read the article on Substack](https://andreyobruchkov1996.substack.com/p/understanding-ethereum-transactions-and-messages-from-state-changes-to-off-chain-messages-part-1-54130865e71e)

Published: 2025-07-22

The article contains 24 displayed code or output blocks. This page maps those examples to maintained implementations and checks; it does not duplicate the article itself.

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
