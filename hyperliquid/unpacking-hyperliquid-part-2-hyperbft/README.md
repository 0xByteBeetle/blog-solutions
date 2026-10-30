# Part 2: API response examples

[Article](https://andreyobruchkov1996.substack.com/p/unpacking-hyperliquid-part-2-hyperbft)

The fixtures preserve the printed clearinghouse response and abbreviated spot response. The latter contains `...` and is intentionally `.json.txt`: it is not valid complete JSON. No omitted balances or Rust implementation have been invented.

Requires Python 3.10+; standard library only. From this directory:

```sh
python3 -m unittest discover -s tests -v
```

Three supplemental tests check clearinghouse field types, reject the incomplete spot JSON, and examine only explicitly displayed spot rows after test-only removal of the omission marker. These are historical fixtures, not fresh API observations.
