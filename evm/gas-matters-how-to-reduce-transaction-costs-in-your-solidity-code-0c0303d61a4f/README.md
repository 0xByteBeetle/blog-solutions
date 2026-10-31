# Gas Matters: How to Reduce Transaction Costs in Your Solidity Code

[Read the article](https://andreyobruchkov1996.substack.com/p/gas-matters-how-to-reduce-transaction-costs-in-your-solidity-code-0c0303d61a4f).

The article code is preserved; build configuration and focused tests are supplemental. Run commands from this folder.

Install the dependencies actually imported by these examples (Node.js/npm and Git):

```sh
node setup.mjs
```


Tested toolchain: Foundry 1.4.4; compiler pinned to 0.8.30.

```sh
# From this article directory
forge test
```

## Foundry project

The runnable project is here: [foundry.toml](foundry.toml), [src/](src/) and [test/](test/). Run `forge build` and `forge test` from this article folder after `node setup.mjs`.

## Reproduce Measuring Your Gas

With existing Foundry 1.4.4 and Python 3.10+, after `node setup.mjs`:

```sh
forge test --gas-report
python3 measure_local.py
```

The supplemental runner uses Solidity 0.8.30, optimizer disabled and **Cancun** for both compilation and its fresh owned Anvil. It runs the gas report, deploys the original Storage with public Anvil account 0, checks exact deployed code and empty initial state, independently checks the calldata for `store((25,"bob"))`, then estimates, sends locally, reads `eth_getTransactionReceipt.gasUsed`, and verifies `retrieve()`. It prints the actual estimate and receipt value and always stops its node. No external RPC, personal key or pre-existing node is accepted. Anvil's known public keys must never be funded on a public network.

The gas report attributes costs to calls observed inside the test harness; a transaction receipt includes intrinsic transaction/calldata cost and execution after applicable refunds. `eth_estimateGas` finds a sufficient limit against the selected state and may add a margin; it need not equal receipt gas used. The runner asserts `21000 < gasUsed <= estimate` and verifies estimation did not mutate storage. A repeated store starts from a different state and is not the same measurement. The article's historical 67,908 is an observation, not a universal expected value.

For this fork, [EIP-2929](https://eips.ethereum.org/EIPS/eip-2929) specifies cold SLOAD **2100** and warm SLOAD **100**. [EIP-3529](https://eips.ethereum.org/EIPS/eip-3529) changes the storage-clear refund to **4800** and caps refunds at **one fifth** of pre-refund gas used. The article's EIP-2200-era pseudocode predates those changes; do not combine its 800/15,000 constants with the Cancun schedule. Accessing calldata via CALLDATALOAD also differs from intrinsic transaction byte pricing (4 for zero, 16 for nonzero bytes under Cancun).
