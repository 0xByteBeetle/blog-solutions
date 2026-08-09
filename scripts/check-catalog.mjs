import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const catalogPath = path.join(root, "catalog", "articles.json");
const catalog = JSON.parse(fs.readFileSync(catalogPath, "utf8"));

if (catalog.length !== 53) {
  throw new Error(`Expected 53 Substack articles, found ${catalog.length}`);
}

const slugs = new Set();
const urls = new Set();
for (const article of catalog) {
  if (!article.slug || slugs.has(article.slug)) throw new Error(`Duplicate or missing slug: ${article.slug}`);
  if (!article.url || urls.has(article.url)) throw new Error(`Duplicate or missing URL: ${article.url}`);
  if (!["evm", "solana"].includes(article.chain)) throw new Error(`Invalid chain for ${article.slug}`);
  if (!Array.isArray(article.coverage) || article.coverage.length === 0) throw new Error(`No coverage for ${article.slug}`);

  slugs.add(article.slug);
  urls.add(article.url);

  const page = path.join(root, "articles", article.chain, article.slug, "README.md");
  if (!fs.existsSync(page)) throw new Error(`Missing article map: ${path.relative(root, page)}`);

  for (const item of article.coverage) {
    const target = path.join(root, item.path);
    if (!fs.existsSync(target)) throw new Error(`Missing coverage path for ${article.slug}: ${item.path}`);
  }
}

const evm = catalog.filter((article) => article.chain === "evm").length;
const solana = catalog.filter((article) => article.chain === "solana").length;
if (evm !== 37 || solana !== 16) {
  throw new Error(`Expected 37 EVM and 16 Solana articles, found ${evm} EVM and ${solana} Solana`);
}

console.log(`Catalog verified: ${catalog.length} articles (${evm} EVM, ${solana} Solana).`);
