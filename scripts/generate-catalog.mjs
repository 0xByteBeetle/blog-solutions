import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const sourcePath = process.argv[2];
if (!sourcePath) {
  throw new Error("Usage: node scripts/generate-catalog.mjs /path/to/substack-analysis.json");
}

const source = JSON.parse(fs.readFileSync(sourcePath, "utf8"));
const articles = source.articles;
if (!Array.isArray(articles) || articles.length !== 53) {
  throw new Error(`Expected the audited 53-article export, found ${articles?.length ?? 0}`);
}

const labs = {
  foundryInternals: {
    path: "evm/foundry/src/Internals.sol",
    command: "cd evm/foundry && forge test --offline --match-contract InternalsTest",
    description: "Calldata, ABI decoding, storage, call context, fallback behavior, and revert propagation",
  },
  foundryDeployments: {
    path: "evm/foundry/src/Deployments.sol",
    command: "cd evm/foundry && forge test --offline --match-contract DeploymentsTest",
    description: "CREATE, CREATE2, clones, transparent proxies, ERC-1967 slots, and UUPS upgrades",
  },
  foundryDiamond: {
    path: "evm/foundry/src/Diamond.sol",
    command: "cd evm/foundry && forge test --offline --match-contract DiamondTest",
    description: "Diamond cuts, loupe inspection, selector routing, shared storage, and facet replacement",
  },
  foundryObservability: {
    path: "evm/foundry/src/Observability.sol",
    command: "cd evm/foundry && forge test --offline --match-contract ObservabilityTest",
    description: "Events, native-value accounting, metadata calls, and multicall behavior",
  },
  foundryTracing: {
    path: "evm/foundry/src/Tracing.sol",
    command: "cd evm/foundry && forge test --offline --match-contract TracingTest",
    description: "Successful and reverting call paths designed for opcode-level tracing",
  },
  foundryGas: {
    path: "evm/foundry/src/GasPatterns.sol",
    command: "cd evm/foundry && forge test --offline --match-contract GasPatternsTest",
    description: "Storage packing, cached reads, unchecked increments, and batch writes",
  },
  goRlp: {
    path: "evm/go/rlpmanual",
    command: "cd evm/go && go test ./rlpmanual",
    description: "Canonical RLP strings, lists, integers, malformed inputs, and trailing-data checks",
  },
  goTransactions: {
    path: "evm/go/transactions",
    command: "cd evm/go && go test ./transactions",
    description: "Legacy, EIP-2930, EIP-1559, EIP-4844, and EIP-7702 transaction envelopes",
  },
  goSigning: {
    path: "evm/go/signing",
    command: "cd evm/go && go test ./signing",
    description: "EIP-191 personal messages and EIP-712 typed-data hashing and recovery",
  },
  goObservability: {
    path: "evm/go/observability",
    command: "cd evm/go && go test ./observability",
    description: "Log topics, event decoding, and native-transfer trace interpretation",
  },
  goRpc: {
    path: "evm/go/rpcbatch",
    command: "cd evm/go && go test ./rpcbatch",
    description: "JSON-RPC request validation, batch correlation, and partial-error handling",
  },
  anvilTracing: {
    path: "evm/rpc/run-local.sh",
    command: "./evm/rpc/run-local.sh",
    description: "Real eth_call and debug_traceCall responses from a disposable Anvil node",
  },
  solanaFundamentals: {
    path: "solana/fundamentals",
    command: "cargo test --manifest-path solana/fundamentals/Cargo.toml",
    description: "Accounts, PDAs, Borsh bytes, messages, signatures, fee math, and address lookup tables",
  },
  anchorAccounts: {
    path: "solana/anchor/programs/accounts",
    command: "cd solana/anchor && ./scripts/test.sh",
    description: "PDA creation, byte-bounded names, ownership constraints, updates, and account closure",
  },
  anchorBorsh: {
    path: "solana/anchor/programs/borsh_lab",
    command: "cd solana/anchor && ./scripts/test.sh",
    description: "Fixed and dynamic Borsh layouts inspected from raw account buffers",
  },
  anchorZeroCopy: {
    path: "solana/anchor/programs/zero_copy",
    command: "cd solana/anchor && ./scripts/test.sh",
    description: "repr(C), explicit padding, AccountLoader, direct mutation, and accounts larger than 10 KB",
  },
  anchorTransferHook: {
    path: "solana/anchor/programs/transfer_hook",
    command: "cd solana/anchor && ./scripts/test.sh",
    description: "A deployed Token-2022 transfer hook with ExtraAccountMetaList and accepted and rejected transfers",
  },
  token2022: {
    path: "solana/token-2022/run-local.sh",
    command: "./solana/token-2022/run-local.sh",
    description: "Classic Token plus metadata, fees, permanent delegate, non-transferable, frozen, memo, and interest extensions",
  },
  confidential: {
    path: "solana/token-2022/run-confidential-devnet.sh",
    command: "./solana/token-2022/run-confidential-devnet.sh",
    description: "The complete confidential deposit, apply, transfer, apply, and withdraw sequence using disposable devnet keys",
  },
  metaplexMetadata: {
    path: "solana/metadata",
    command: "cd solana/metadata && npm test && npm run check",
    description: "Canonical Metaplex metadata PDA derivation and CreateMetadataAccountV3 instruction construction",
  },
};

function coverageFor(article) {
  const slug = article.slug;
  if (article.chain === "solana") {
    if (slug.includes("zero-copy")) return [labs.anchorZeroCopy];
    if (slug.includes("borsh")) return [labs.anchorBorsh];
    if (slug === "the-utility-extensions-completing") return [labs.token2022];
    if (slug === "native-zk-on-solana-the-architecture") return [labs.confidential];
    if (slug === "engineering-native-yield-a-deep-dive") return [labs.token2022];
    if (slug === "transfer-hooks-on-solana-anchor-031") return [labs.anchorTransferHook];
    if (slug === "solana-token-2022-transfer-hooks") return [labs.token2022, labs.anchorTransferHook];
    if (slug === "from-convention-to-explicit-state") return [labs.token2022];
    if (slug === "where-token-metadata-lives-on-solana") return [labs.metaplexMetadata, labs.token2022];
    if (slug === "spl-token-program-architecture-a") return [labs.token2022, labs.solanaFundamentals];
    if (slug === "understanding-solana-part-3-anchor") return [labs.anchorAccounts];
    return [labs.solanaFundamentals];
  }

  if (slug.includes("diamond")) return [labs.foundryDiamond];
  if (
    slug.includes("proxies-and-upgradability") ||
    slug.includes("factories-how") ||
    slug.includes("deployments-and-deterministic") ||
    slug.includes("contract-deployments-proxies")
  ) return [labs.foundryDeployments];
  if (slug.includes("gas-matters")) return [labs.foundryGas];
  if (slug.includes("rlp")) return [labs.goRlp];
  if (slug.includes("signtypeddata") || slug.includes("signed-data-eip-191")) return [labs.goSigning];
  if (
    slug.includes("evm-tx-") ||
    slug.includes("ethereum-transactions-and-messages")
  ) return [labs.goTransactions, labs.goSigning];
  if (
    slug.includes("eth_call") ||
    slug.includes("tracing-ethereum") ||
    slug.includes("node-types") ||
    slug.includes("whats-behind-your-rpc") ||
    slug.includes("developer-tools")
  ) return [labs.foundryTracing, labs.anvilTracing, labs.goRpc];
  if (
    slug.includes("batching-calls") ||
    slug.includes("catching-eth") ||
    slug.includes("streaming-on-chain") ||
    slug.includes("understanding-events") ||
    slug.includes("ethereum-dev-hacks")
  ) return [labs.foundryObservability, labs.goObservability, labs.goRpc];
  return [labs.foundryInternals, labs.foundryTracing];
}

function verificationFor(article) {
  if (article.slug === "native-zk-on-solana-the-architecture") {
    return {
      status: "cluster-limited",
      note: "The full flow is implemented. On 9 August 2026, the current local runtime reached the Zk ElGamal proof program, which returned that it was temporarily disabled. No successful output is claimed.",
    };
  }
  if (article.slug === "where-token-metadata-lives-on-solana") {
    return {
      status: "offline-verified",
      note: "PDA derivation and instruction construction execute in tests. The network scripts are type-checked and require a funded devnet-only mint authority to submit.",
    };
  }
  return {
    status: "verified",
    note: "The mapped deterministic tests or disposable local-chain scenario passed on 9 August 2026.",
  };
}

const catalog = articles.map((article) => ({
  sequence: article.sequence,
  title: article.title,
  slug: article.slug,
  url: article.url,
  publishedAt: article.publishedAt,
  chain: article.chain,
  wordCount: article.wordCount,
  displayedBlockCount: article.codeBlockCount,
  coverage: coverageFor(article),
  verification: verificationFor(article),
}));

fs.mkdirSync(path.join(root, "catalog"), { recursive: true });
fs.writeFileSync(path.join(root, "catalog", "articles.json"), `${JSON.stringify(catalog, null, 2)}\n`);

for (const article of catalog) {
  const directory = path.join(root, "articles", article.chain, article.slug);
  fs.mkdirSync(directory, { recursive: true });
  const coverage = article.coverage.map((item) => [
    `### ${item.description}`,
    "",
    `Code: \`${item.path}\``,
    "",
    "Run:",
    "",
    "```bash",
    item.command,
    "```",
  ].join("\n")).join("\n\n");
  const page = [
    `# ${article.title}`,
    "",
    `[Read the article on Substack](${article.url})`,
    "",
    `Published: ${article.publishedAt.slice(0, 10)}`,
    "",
    `The article contains ${article.displayedBlockCount} displayed code or output blocks. This page maps those examples to maintained implementations and checks; it does not duplicate the article itself.`,
    "",
    "## Companion implementation",
    "",
    coverage,
    "",
    "## Verification boundary",
    "",
    article.verification.note,
    "",
  ].join("\n");
  fs.writeFileSync(path.join(directory, "README.md"), page);
}

function listFor(chain) {
  return catalog
    .filter((article) => article.chain === chain)
    .map((article) => `- [${article.title}](${article.url}) · [code map](articles/${chain}/${article.slug}/README.md) · ${article.verification.status}`)
    .join("\n");
}

const index = [
  "# Article and code index",
  "",
  "Every published Substack article is represented here. The status describes the companion code, not the editorial state of the article.",
  "",
  "## EVM",
  "",
  listFor("evm"),
  "",
  "## Solana",
  "",
  listFor("solana"),
  "",
  "## Status meanings",
  "",
  "- `verified`: deterministic tests or a disposable local-chain flow passed.",
  "- `offline-verified`: transaction construction and types passed; sending requires a funded devnet authority.",
  "- `cluster-limited`: the implementation reaches a cluster capability that is currently disabled or externally unavailable, and no successful output is asserted.",
  "",
].join("\n");
fs.writeFileSync(path.join(root, "ARTICLES.md"), index);

console.log(`Generated ${catalog.length} article maps.`);
