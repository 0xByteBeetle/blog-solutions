# Reproduce the article's fee arithmetic

[Article](https://andreyobruchkov1996.substack.com/p/understanding-solana-part-5-transaction)

`fees.py` is a supplemental integer-only worked example, not a wallet or a current RPC fee quote. It uses the requested CU limit, CU price in micro-lamports, signer count and the article's 5000-lamport base per signature.

```sh
python3 fees.py
python3 fees.py --cu-limit 200000 --micro-lamports-per-cu 20000 --signatures 1
python3 -m unittest discover -s tests -v
```

The article example gives `ceil(200000 × 20000 / 1000000) = 4000` priority lamports. Add one 5000-lamport base fee: **9000 lamports = 0.000009000 SOL**. Fractional priority lamports round up; no floating-point arithmetic is used. `--base-per-signature` makes the worked example's base-fee assumption explicit.

Tests cover the article values, fractional rounding, zero priority price, multiple signers, large exact integers and invalid inputs. This illustrates fee arithmetic; it does not serialize/sign a transaction or verify every runtime/signature topic in the article.
