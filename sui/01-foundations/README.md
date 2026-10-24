# Sui foundations

Draft companion for **Understanding Sui Part 1: Objects, Tokenomics, and Storage**.

The Move package makes object rules observable through compilation and local tests. Python reads an existing public Testnet object, decodes its saved Move value locally, and reads its producing transaction's fee summary. The local verification command does not create keys, request faucet funds, publish a package, or submit transactions.

While the companion is under review, clone its feature branch so the Sui directory is included:

```sh
git clone --branch codex/sui-foundations https://github.com/0xByteBeetle/blog-solutions.git
cd blog-solutions/sui/01-foundations
```

## Requirements

- Python 3.10 or newer, with normal HTTPS trust configuration
- Git for the Move package manager
- Sui CLI from the pinned official `mainnet-v1.82.3` release
- Network access for the initial CLI download and package dependency resolution

The release label selects the toolchain. It does not select a network for the local Move tests. The chain-read scripts explicitly use Testnet.

The recorded Move run uses macOS ARM64. The other official release assets are pinned for setup, but have not been executed in this checkpoint.

From the companion directory, install the CLI into its ignored `.tools/` folder:

```sh
python3 install_sui.py
```

The installer chooses a pinned official asset for macOS, Ubuntu, or Windows, verifies its recorded SHA-256, and extracts only the `sui` executable. Download URLs and checksums are in [toolchain.json](toolchain.json). It does not change a global installation. Unsupported platforms can install the same [official release](https://github.com/MystenLabs/sui/releases/tag/mainnet-v1.82.3) manually.

If the archive is already available, reuse it instead of downloading it again:

```sh
python3 install_sui.py --archive /path/to/the/platform-specific-archive.tgz
```

On Windows, use `py -3` in place of `python3` when needed.

## Compile and test locally

From `sui/01-foundations`:

```sh
python3 verify.py
```

To select an existing installation explicitly:

```sh
python3 verify.py --sui /absolute/path/to/sui
```

The runner first creates an isolated client configuration with an empty keystore. This prevents the CLI's first-run wallet setup. It checks that the keystore stays empty after every command. It then checks the pinned CLI version, builds the valid package, runs its tests, inspects the compiled module artifact, and checks that the isolated deliberately invalid package is rejected for the intended copy rule. A network or dependency error does not count as the expected compiler rejection. Fresh local output is written under the ignored `evidence/local/` directory.

For direct CLI use, prepare the same keyless environment from `sui/01-foundations` before invoking Sui:

```sh
python3 local_cli.py
export SUI_CONFIG_DIR="$PWD/.local/sui-config"
export MOVE_HOME="$PWD/.local/move-cache"
export NO_COLOR=1
export PATH="$PWD/.tools/bin:$PATH"
cd move
```

The manual export block assumes a POSIX shell. On Windows, use the Python installer and verifier above instead.

Then run:

```sh
sui move build
sui move test
sui move build --path negative/copy_object
```

The last command is an intentional compile failure. The main package remains valid. [Move.lock](move/Move.lock) retains its resolved dependencies.

To inspect the compiler's generated module and disassembly, run this before the test build:

```sh
sui move build --disassemble
```

The production module is written to `build/sui_foundations/bytecode_modules/notebook.mv`. Its disassembly is written to `build/sui_foundations/disassembly/notebook.mvb`. A later test build can include test-only code, so production-artifact inspection is recorded before running tests.

## Read and inspect existing chain data

This optional inspection sequence has two network queries and one local decoder. The object and fee queries need access to the official public Testnet GraphQL service. Run the programs from `sui/01-foundations` in this order:

```sh
python3 client/01_read_object.py
python3 client/02_decode_coin.py
python3 client/03_read_storage_costs.py
```

The first script saves the response to `evidence/object.json`. The second reads that saved response without contacting the network, decodes the UID and balance, and compares the results with the service's parsed fields. It deliberately truncates the 40-byte value to 39 bytes to demonstrate its local shape check. That rejection is not a validator rejection. The third script follows the saved object's producing transaction and reconstructs its fee.

All three programs use only Python's standard library. The two network queries retain TLS verification. No signing material is needed.

The selected object already existed before these reads. A Testnet reset or service retention change can make it unavailable. The programs report that condition instead of replacing it with invented data. Network responses can change, so the recorded checkpoint is not an expected constant for a new read.

## Files and evidence

- `move/`: Move manifest, locked dependencies, source, local tests, and an isolated negative fixture
- `client/`: two chain-read programs and the original local Move-value decoder
- `evidence/recorded-move/`: actual compiler and local-test captures from the author run
- `evidence/recorded-chain/`: actual public responses, stdout, stderr, and read-only checks from October 24, 2026
- `provenance.json`: source hashes and the boundaries of the recorded checks
- `verify.py`: local build/test orchestration, separate from the author implementation
- `local_cli.py`: isolated keyless client configuration and dependency-cache setup
- `install_sui.py` and `toolchain.json`: pinned CLI setup

Files ending in `.stderr.plain.txt` are ANSI-stripped display copies. The original `.stderr.txt` captures remain alongside them. Source files were moved into the companion's `move/` and `client/` directories without changing their bodies.

Builds and local Move tests are distinct from public-network execution. An expected local abort demonstrates the tested Move guard. It does not prove validator acceptance, network sequencing, physical persistence, or actual gas charges. The recorded fee query observes a transaction that had already executed.

This draft companion is not added to the historical 53-article published-source catalog. Existing published snapshots and recovered source hashes remain unchanged.
