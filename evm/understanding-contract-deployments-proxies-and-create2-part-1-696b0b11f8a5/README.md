# Understanding Contract Deployments, Proxies, and CREATE2 — Part 1

[Read the article](https://andreyobruchkov1996.substack.com/p/understanding-contract-deployments-proxies-and-create2-part-1-696b0b11f8a5).

The article code is preserved; build configuration and focused tests are supplemental. Run commands from this folder.

## Run the Solidity examples

From this article folder, run `make build` and `make test`. Each nested project keeps its own compiler pin and focused tests:

- `storage-validation/`: [foundry.toml](storage-validation/foundry.toml), [src/](storage-validation/src/), [test/](storage-validation/test/).
- `transparent-proxy/`: [foundry.toml](transparent-proxy/foundry.toml), [src/](transparent-proxy/src/), [test/](transparent-proxy/test/).

These tests need only the installed Foundry toolchain.

### storage-validation

Tested toolchain: Foundry 1.4.4; compiler pinned to 0.8.30.

```sh
(cd storage-validation && forge test)
```

### transparent-proxy

Tested toolchain: Foundry 1.4.4; compiler pinned to 0.8.12.

```sh
(cd transparent-proxy && forge build && forge test)
```

## CREATE and CREATE2 address calculation

The original `storage-validation/src/Storage.sol` is the init-code input. From this article folder:

```sh
cd storage-validation
python3 addresses.py
python3 -m unittest discover -s tests -v
```

The supplemental calculator prints the minimally encoded RLP `[deployer, nonce]`, its Keccak hash and final 20-byte CREATE address. For CREATE2 it prints `0xff || deployer || salt || keccak(init_code)` and checks both calculations against `cast compute-address`. `forge inspect src/Storage.sol:Storage bytecode` supplies this contract's actual creation code. No wallet, RPC or transaction is used. The default deployer/nonce/salt are public worked-example inputs, not a historical deployment claim.

This project's pinned Solidity 0.8.30 compiler, settings, source paths and metadata determine the init-code hash. Historical article bytecode hashes can differ. The six tests include nonce RLP boundaries, EIP-1014 vectors, changed salt/code and actual Storage compilation. Existing transparent-proxy examples stay separate.
