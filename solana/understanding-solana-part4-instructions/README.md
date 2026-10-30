# Decode the article's System Program transfer

[Article](https://andreyobruchkov1996.substack.com/p/understanding-solana-part4-instructions)

`instruction.py` is a supplemental executable form of the exact displayed instruction data. It encodes/decodes a little-endian u32 discriminator followed by a little-endian u64 lamport amount. Python 3 standard library only; no wallet or RPC.

```sh
python3 instruction.py
python3 instruction.py --lamports 10000000
python3 -m unittest discover -s tests -v
```

Expected bytes: `020000008096980000000000` (12 bytes). Discriminator `2` selects System Program Transfer; the remaining eight bytes encode `10000000` lamports, or `0.010000000` SOL. The System Program ID is `11111111111111111111111111111111`. As in the article, a real transfer also needs a writable signing sender and writable recipient in its account metas; these data bytes alone are not a signed transaction.

Tests assert the literal article bytes, integer boundaries, wrong variants, truncated/extra data and invalid amounts. The rest of the article's messages/ALT/CPI discussion is conceptual here; no substitute application is deployed.
