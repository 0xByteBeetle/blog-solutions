# Part 5: signing and nonce allocation

[Article](https://andreyobruchkov1996.substack.com/p/unpacking-hyperliquid-part-5-agent)

The three numbered Python programs are unchanged printed blocks 8, 10 and 17. Tests and dependency files are supplemental; SDK 0.24.0 is the article's explicit pin.

Requires Python 3.11+. From this directory:

```sh
python3 -m venv .venv
.venv/bin/python -m pip install -r requirements-verified.txt
.venv/bin/python -m unittest discover -s tests -v
```

`requirements-verified.txt` pins the tested dependency closure; `requirements.txt` records the minimal SDK requirement. Tests check signer recovery, signed-preimage differences, and nonce uniqueness under concurrent callers/clock regression. The test subprocess blocks socket connections.

**All embedded keys are PUBLIC TEST FIXTURES — NEVER FUND THEM.** Programs sign/hash locally and print demonstrations; they do not submit actions or generate private wallets. A process-local nonce allocator is not cross-process/distributed coordination.
