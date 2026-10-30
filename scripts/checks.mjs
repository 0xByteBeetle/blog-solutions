// Build and offline-test commands. Does not run public-chain entrypoints.
export const checks = [
  {
    "cwd": "solana/where-token-metadata-lives-on-solana",
    "command": [
      "npm",
      "run",
      "check"
    ]
  },
  {
    "cwd": "solana/architecting-high-performance-solana/published",
    "command": [
      "cargo",
      "test",
      "--locked"
    ]
  },
  {
    "cwd": "solana/architecting-high-performance-solana/layout",
    "command": [
      "cargo",
      "test",
      "--locked"
    ]
  },
  {
    "cwd": "solana/architecting-high-performance-solana",
    "command": [
      "npm",
      "test"
    ]
  },
  {
    "cwd": "solana/solana-deep-dive-unpacking-borsh/profile",
    "command": [
      "cargo",
      "test",
      "--locked"
    ]
  },
  {
    "cwd": "solana/solana-deep-dive-unpacking-borsh",
    "command": [
      "npm",
      "test"
    ]
  },
  {
    "cwd": "solana/the-utility-extensions-completing",
    "command": [
      "python3",
      "-m",
      "unittest",
      "discover",
      "-s",
      "tests",
      "-v"
    ]
  },
  {
    "cwd": "solana/native-zk-on-solana-the-architecture",
    "command": [
      "python3",
      "-m",
      "unittest",
      "discover",
      "-s",
      "tests",
      "-v"
    ]
  },
  {
    "cwd": "solana/engineering-native-yield-a-deep-dive",
    "command": [
      "python3",
      "-m",
      "unittest",
      "discover",
      "-s",
      "tests",
      "-v"
    ]
  },
  {
    "cwd": "solana/transfer-hooks-on-solana-anchor-031",
    "command": [
      "npm",
      "test"
    ]
  },
  {
    "cwd": "solana/from-convention-to-explicit-state",
    "command": [
      "python3",
      "-m",
      "unittest",
      "discover",
      "-s",
      "tests",
      "-v"
    ]
  },
  {
    "cwd": "solana/understanding-solana-part-6-transactions",
    "command": [
      "npm",
      "test"
    ]
  },
  {
    "cwd": "solana/understanding-solana-part-3-anchor",
    "command": [
      "npm",
      "test"
    ]
  },
  {
    "cwd": "evm/proxies-and-upgradability-minimal",
    "command": [
      "forge",
      "test"
    ]
  },
  {
    "cwd": "evm/factories-how-smart-contracts-deploy",
    "command": [
      "forge",
      "test"
    ]
  },
  {
    "cwd": "evm/proxies-and-upgradability-uups-proxy/uups",
    "command": [
      "forge",
      "test"
    ]
  },
  {
    "cwd": "evm/proxies-and-upgradability-uups-proxy/corrected",
    "command": [
      "forge",
      "test"
    ]
  },
  {
    "cwd": "evm/proxies-and-upgradability",
    "command": [
      "forge",
      "test"
    ]
  },
  {
    "cwd": "evm/deployments-and-deterministic-addresses",
    "command": [
      "forge",
      "test"
    ]
  },
  {
    "cwd": "evm/batching-calls-efficiently-with-multicall",
    "command": [
      "go",
      "test",
      "./..."
    ]
  },
  {
    "cwd": "evm/streaming-on-chain-activity-in-real",
    "command": [
      "go",
      "test",
      "./..."
    ]
  },
  {
    "cwd": "evm/eth_call-vs-debug_tracecall-how-to",
    "command": [
      "python3",
      "local_rpc.py"
    ]
  },
  {
    "cwd": "evm/evm-message-signtypeddata-eip-712/permit-verifier",
    "command": [
      "forge",
      "test"
    ]
  },
  {
    "cwd": "evm/evm-message-signtypeddata-eip-712/transaction-types",
    "command": [
      "go",
      "test",
      "-run",
      "^$",
      "./..."
    ]
  },
  {
    "cwd": "evm/evm-message-signed-data-eip-191-and/transaction-types",
    "command": [
      "go",
      "test",
      "-run",
      "^$",
      "./..."
    ]
  },
  {
    "cwd": "evm/evm-tx-setcode-transactions-eip-7702/delegation",
    "command": [
      "forge",
      "test"
    ]
  },
  {
    "cwd": "evm/evm-tx-setcode-transactions-eip-7702/transaction-types",
    "command": [
      "go",
      "test",
      "-run",
      "^$",
      "./..."
    ]
  },
  {
    "cwd": "evm/evm-tx-blob-transactions-eip-4844/transaction-types",
    "command": [
      "go",
      "test",
      "-run",
      "^$",
      "./..."
    ]
  },
  {
    "cwd": "evm/evm-tx-dynamic-fee-transactions-eip/transaction-types",
    "command": [
      "go",
      "test",
      "-run",
      "^$",
      "./..."
    ]
  },
  {
    "cwd": "evm/evm-tx-access-list-transactions-eip/transaction-types",
    "command": [
      "go",
      "test",
      "-run",
      "^$",
      "./..."
    ]
  },
  {
    "cwd": "evm/evm-tx-understanding-legacy-ethereum/transaction-types",
    "command": [
      "go",
      "test",
      "-run",
      "^$",
      "./..."
    ]
  },
  {
    "cwd": "evm/what-is-recursive-length-prefix-rlp/rlp",
    "command": [
      "go",
      "test",
      "./..."
    ]
  },
  {
    "cwd": "evm/what-is-recursive-length-prefix-rlp/corrected",
    "command": [
      "go",
      "test",
      "./..."
    ]
  },
  {
    "cwd": "evm/tracing-ethereum-transactions-how",
    "command": [
      "forge",
      "test"
    ]
  },
  {
    "cwd": "evm/evm-developer-tools-explained-foundry",
    "command": [
      "forge",
      "test"
    ]
  },
  {
    "cwd": "evm/solidity-execution-overview-payable",
    "command": [
      "forge",
      "test"
    ]
  },
  {
    "cwd": "evm/abi-encoding-deep-dive-how-solidity",
    "command": [
      "forge",
      "test"
    ]
  },
  {
    "cwd": "evm/what-actually-happens-when-calldata",
    "command": [
      "forge",
      "test"
    ]
  },
  {
    "cwd": "evm/ethereum-calldata-and-bytecode-how",
    "command": [
      "forge",
      "test"
    ]
  },
  {
    "cwd": "evm/introduction-to-the-ethereum-virtual",
    "command": [
      "forge",
      "test"
    ]
  },
  {
    "cwd": "evm/diamonds-in-evm-the-proxy-that-scales-beyond-limits-2fedc282cadf/workshop",
    "command": [
      "forge",
      "test"
    ]
  },
  {
    "cwd": "evm/diamonds-in-evm-the-proxy-that-scales-beyond-limits-2fedc282cadf/diamond",
    "command": [
      "forge",
      "test"
    ]
  },
  {
    "cwd": "evm/understanding-contract-deployments-proxies-and-create2-part-2-df8f05998d5e/uups",
    "command": [
      "forge",
      "test"
    ]
  },
  {
    "cwd": "evm/understanding-contract-deployments-proxies-and-create2-part-2-df8f05998d5e/minimal-proxy",
    "command": [
      "forge",
      "test"
    ]
  },
  {
    "cwd": "evm/understanding-contract-deployments-proxies-and-create2-part-2-df8f05998d5e/factory",
    "command": [
      "forge",
      "test"
    ]
  },
  {
    "cwd": "evm/understanding-contract-deployments-proxies-and-create2-part-1-696b0b11f8a5/storage-validation",
    "command": [
      "forge",
      "test"
    ]
  },
  {
    "cwd": "evm/understanding-contract-deployments-proxies-and-create2-part-1-696b0b11f8a5/transparent-proxy",
    "command": [
      "forge",
      "test"
    ]
  },
  {
    "cwd": "evm/ethereum-dev-hacks-catching-hidden-transfers-real-time-events-and-multicalls-bef7435b9397/multicall",
    "command": [
      "go",
      "test",
      "./..."
    ]
  },
  {
    "cwd": "evm/ethereum-dev-hacks-catching-hidden-transfers-real-time-events-and-multicalls-bef7435b9397/streaming",
    "command": [
      "go",
      "test",
      "./..."
    ]
  },
  {
    "cwd": "evm/ethereum-node-types-explained-and-why-they-can-make-or-break-your-debugging-fc8d89b724cc",
    "command": [
      "python3",
      "local_rpc.py"
    ]
  },
  {
    "cwd": "evm/gas-matters-how-to-reduce-transaction-costs-in-your-solidity-code-0c0303d61a4f",
    "command": [
      "forge",
      "test"
    ]
  },
  {
    "cwd": "evm/understanding-ethereum-transactions-and-messages-from-state-changes-to-off-chain-messages-part-2-e8ef96b82768/permit-verifier",
    "command": [
      "forge",
      "test"
    ]
  },
  {
    "cwd": "evm/understanding-ethereum-transactions-and-messages-from-state-changes-to-off-chain-messages-part-2-e8ef96b82768/delegation",
    "command": [
      "forge",
      "test"
    ]
  },
  {
    "cwd": "evm/understanding-ethereum-transactions-and-messages-from-state-changes-to-off-chain-messages-part-2-e8ef96b82768/transaction-types",
    "command": [
      "go",
      "test",
      "-run",
      "^$",
      "./..."
    ]
  },
  {
    "cwd": "evm/understanding-ethereum-transactions-and-messages-from-state-changes-to-off-chain-messages-part-1-54130865e71e/rlp",
    "command": [
      "go",
      "test",
      "./..."
    ]
  },
  {
    "cwd": "evm/understanding-ethereum-transactions-and-messages-from-state-changes-to-off-chain-messages-part-1-54130865e71e/transaction-types",
    "command": [
      "go",
      "test",
      "-run",
      "^$",
      "./..."
    ]
  },
  {
    "cwd": "evm/what-every-blockchain-developer-should-know-about-evm-internals-part-3-b6813d964592",
    "command": [
      "forge",
      "test"
    ]
  },
  {
    "cwd": "evm/what-every-blockchain-developer-should-know-about-evm-internals-part-2-eab0f4fae3de/workshop",
    "command": [
      "forge",
      "test"
    ]
  },
  {
    "cwd": "evm/what-every-blockchain-developer-should-know-about-evm-internals-part-2-eab0f4fae3de/calldata",
    "command": [
      "forge",
      "test"
    ]
  },
  {
    "cwd": "evm/what-every-blockchain-developer-should-know-about-evm-internals-part-2-eab0f4fae3de/storage",
    "command": [
      "forge",
      "test"
    ]
  },
  {
    "cwd": "evm/what-every-blockchain-developer-should-know-about-evm-internals-part-1-83a93c618257/bytecode",
    "command": [
      "forge",
      "test"
    ]
  },
  {
    "cwd": "evm/what-every-blockchain-developer-should-know-about-evm-internals-part-1-83a93c618257/workshop",
    "command": [
      "forge",
      "test"
    ]
  },
  {
    "cwd": "hyperliquid/hyperliquid-beyond-generic-vms-the",
    "command": [
      "cargo",
      "test",
      "--locked"
    ]
  },
  {
    "cwd": "hyperliquid/unpacking-hyperliquid-part-2-hyperbft",
    "command": [
      "python3",
      "-m",
      "unittest",
      "discover",
      "-s",
      "tests",
      "-v"
    ]
  },
  {
    "cwd": "hyperliquid/unpacking-hyperliquid-part-3-hyperevm",
    "command": [
      "forge",
      "test"
    ]
  },
  {
    "cwd": "hyperliquid/unpacking-hyperliquid-part-4-hip/original-cli",
    "command": [
      "python3",
      "-m",
      "unittest",
      "discover",
      "-s",
      "tests",
      "-v"
    ]
  },
  {
    "cwd": "hyperliquid/unpacking-hyperliquid-part-4-hip",
    "command": [
      "python3",
      "-m",
      "unittest",
      "discover",
      "-s",
      "tests",
      "-v"
    ]
  },
  {
    "cwd": "hyperliquid/unpacking-hyperliquid-part-5-agent",
    "command": [
      "python3",
      "-m",
      "unittest",
      "discover",
      "-s",
      "tests",
      "-v"
    ]
  },
  {
    "cwd": "solana/solana-deep-dive-unpacking-borsh/proposal",
    "command": [
      "cargo",
      "test",
      "--locked",
      "-p",
      "borsh_deep_dive",
      "--test",
      "allocation"
    ]
  },
  {
    "cwd": "sui/understanding-sui-part-2-ownership",
    "command": [
      "python3",
      "-m",
      "unittest",
      "discover",
      "-s",
      "tests",
      "-v"
    ]
  },
  {
    "cwd": "sui/understanding-sui-part-1-objects-tokenomics-and-storage",
    "command": [
      "python3",
      "-m",
      "unittest",
      "discover",
      "-s",
      "tests",
      "-v"
    ]
  }
];
