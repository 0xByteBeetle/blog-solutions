# CREATE and CREATE2 address calculations

[Article](https://andreyobruchkov1996.substack.com/p/deployments-and-deterministic-addresses)

`src/Storage.sol` is the article contract. It supplies the init code for CREATE2; storing a number is not the main lesson. `addresses.py` implements the article's manual address-calculation workflow. The CLI and tests are supplemental.

From this folder, with Python 3 and Foundry 1.4.4:

```sh
forge build
python3 addresses.py
python3 -m unittest discover -s tests -v
forge test -vv
```

The runner prints the RLP preimage and hash for CREATE, then the init-code hash, 85-byte preimage and address for CREATE2. It independently constructs both preimages, uses Ethereum Keccak via `cast keccak`, and compares the results with `cast compute-address`. No node or wallet is used.

Defaults are the article's Anvil example address, nonce 1 and salt `0x...0042`. CREATE yields `0xe7f1725e7734ce288f8367e1bb143e90bb3f0512`. Override with `--deployer`, `--nonce` or a full 32-byte `--salt`.

The config pins solc 0.8.30. Source paths, compiler version, optimizer and metadata options affect init code, its hash and the CREATE2 address; the article's historical hash is not a fixed expected output. Storage has no constructor arguments; contracts with arguments must append their ABI encoding to creation bytecode before hashing.

`test/Addresses.t.sol` adds a test-only deployer to check the formulas against actual local CREATE/CREATE2 execution, installed runtime code and salt collisions. That deployment harness is supplemental; the article prints address calculations, not a factory implementation. The original Storage behavior tests remain.
