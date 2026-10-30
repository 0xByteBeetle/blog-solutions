# ABI encoding: a dynamic struct, word by word

[Article](https://andreyobruchkov1996.substack.com/p/abi-encoding-deep-dive-how-solidity)

`src/Storage.sol` is the unchanged article contract. The runner and tests reproduce its `123456789, "bob"` example with literal, independently written ABI words.

From this folder, with Python 3 and Foundry 1.4.4 (solc 0.8.12):

```sh
forge build
python3 abi_words.py
forge test -vv
```

The runner prints the selector, each word, full 164-byte calldata and 160-byte return data. It compares manual calldata with Cast and executes the word-level contract test in Foundry's local EVM. No RPC or wallet is needed.

| Word | Value | Meaning |
| --- | --- | --- |
| 0 | `0x20` | Offset from arguments start to the dynamic tuple |
| 1 | `0x075bcd15` | 123456789 |
| 2 | `0x40` | Offset from tuple start to string tail |
| 3 | `3` | UTF-8 byte length |
| 4 | `0x626f62` plus padding | bob |

The canonical selector is **`0xddd356b3`**, matching the article's final calldata. Its earlier `0xddd456b3` prose value is a typo. The actual `retrieve()` result contains one dynamic tuple, including the outer `0x20` offset. Decode raw bytes as `abi.decode(data, (Storage.my_storage_struct))`; decoding them as two top-level outputs `(uint256, string)` is different and fails for this example. The tests check that distinction, long/empty strings, uint256 boundaries and truncated calldata.
