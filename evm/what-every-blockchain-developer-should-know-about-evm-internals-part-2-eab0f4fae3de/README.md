# What Every Blockchain Developer Should Know About EVM Internals – Part 2

[Read the article](https://andreyobruchkov1996.substack.com/p/what-every-blockchain-developer-should-know-about-evm-internals-part-2-eab0f4fae3de).

The article code is preserved; build configuration and focused tests are supplemental. Run commands from this folder.

## Run the Solidity examples

From this article folder, run `make build` and `make test`. Each nested project keeps its own compiler pin and focused tests:

- `calldata/`: [foundry.toml](calldata/foundry.toml), [src/](calldata/src/), [test/](calldata/test/).
- `storage/`: [foundry.toml](storage/foundry.toml), [src/](storage/src/), [test/](storage/test/).
- `workshop/`: [foundry.toml](workshop/foundry.toml), [src/](workshop/src/), [test/](workshop/test/).

These tests need only the installed Foundry toolchain.

### workshop

Tested toolchain: Foundry 1.4.4; compiler pinned to 0.8.30.

```sh
(cd workshop && forge test)
```

### calldata

Tested toolchain: Foundry 1.4.4; compiler pinned to 0.4.25.

```sh
(cd calldata && forge build && forge test)
```

### storage

Tested toolchain: Foundry 1.4.4; compiler pinned to 0.8.12.

```sh
(cd storage && forge build && forge test)
```

The Solidity 0.4.25 calldata tests retain its legacy behavior: selector-only input to `set(uint256)` is accepted and the missing word is read as zero. The compiler pin is intentional.

## Read the ABI words

```sh
cd storage
python3 abi_words.py
forge test --match-test testArticleWordsAndReturnData -vv
```

The article’s worked input, `123456789` / `"bob"`, uses the preserved 0.8.12 Storage ABI. The five literal words are: outer tuple offset `0x20`, number `0x075bcd15`, string offset `0x40` relative to the tuple, byte length `3`, and UTF-8 `626f62` padded to 32 bytes. `store((uint256,string))` has selector `0xddd356b3`; append the 160-byte body to obtain 164-byte calldata. The script compares these manually written words with Cast and an actual local contract call.

`retrieve()` returns a single dynamic struct: its return body includes the outer tuple offset and has no function selector. Decode it as that struct, not as two top-level outputs. The tests also show that a different selector cannot invoke `store`. These independently written words reproduce the known article example without changing the published contract.

The article’s Function Selector prose says `0xddd456b3`, while its final calldata correctly uses `0xddd356b3`. Keccak of `store((uint256,string))` begins `ddd356b3`; the test uses that correct selector and rejects the prose typo.
