# Native ZK on Solana: The Architecture of Confidential Transfers

[Read the article on Substack](https://andreyobruchkov1996.substack.com/p/native-zk-on-solana-the-architecture)

Published: 2026-04-15

The article contains 12 displayed code or output blocks. This page maps those examples to maintained implementations and checks; it does not duplicate the article itself.

## Companion implementation

### The complete confidential deposit, apply, transfer, apply, and withdraw sequence using disposable devnet keys

Code: `solana/token-2022/run-confidential-devnet.sh`

Run:

```bash
./solana/token-2022/run-confidential-devnet.sh
```

## Verification boundary

The full flow is implemented. On 9 August 2026, the current local runtime reached the Zk ElGamal proof program, which returned that it was temporarily disabled. No successful output is claimed.
