// Checks declared published-to-file links. Does not compile or execute examples.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

export function normalizePublishedText(text) {
  // This is the existing catalog's declared textual rule, not semantic equivalence.
  return text.replace(/[“”]/g, '"').replace(/[‘’]/g, "'").replace(/\s+/gu, '');
}

// Conservative lexer for the mapped Solidity/Go snippets. It preserves literal
// contents and token boundaries; it is not a parser or a semantic-equivalence proof.
export function literalPreservingTokens(text) {
  text = text.replace(/[“”]/g, '"').replace(/[‘’]/g, "'");
  const tokens = [];
  let i = 0;
  while (i < text.length) {
    if (/\s/u.test(text[i])) { i++; continue; }
    const start = i;
    if (text.startsWith('//', i)) {
      while (i < text.length && text[i] !== '\n') i++;
      // Comment whitespace is formatting; string contents below remain exact.
      tokens.push(text.slice(start, i).replace(/\s+/gu, ' ').trim());
    } else if (text.startsWith('/*', i)) {
      const end = text.indexOf('*/', i + 2);
      i = end < 0 ? text.length : end + 2;
      tokens.push(text.slice(start, i).replace(/\s+/gu, ' ').trim());
    } else if ('"\'`'.includes(text[i])) {
      const quote = text[i++];
      while (i < text.length) {
        if (quote !== '`' && text[i] === '\\') { i += 2; continue; }
        if (text[i++] === quote) break;
      }
      tokens.push(text.slice(start, i));
    } else if (/[A-Za-z0-9_$]/.test(text[i])) {
      while (i < text.length && /[A-Za-z0-9_$]/.test(text[i])) i++;
      tokens.push(text.slice(start, i));
    } else {
      // Keep adjacent operators together to distinguish '+ +' from '++'.
      const operator = text.slice(i).match(/^(?:>>=|<<=|\*\*=|=>|:=|==|!=|<=|>=|&&|\|\||\+\+|--|\+=|-=|\*=|\/=|%=|&=|\|=|\^=|<<|>>|\*\*|<-)/);
      if (operator) { tokens.push(operator[0]); i += operator[0].length; }
      else tokens.push(text[i++]);
    }
  }
  return tokens;
}

export function containsLiteralPreserving(source, published, equal = (a, b) => a === b) {
  const haystack = literalPreservingTokens(source);
  const needle = literalPreservingTokens(published);
  if (!needle.length) return false;
  return haystack.some((_, i) => needle.every((token, j) => equal(haystack[i + j], token)));
}

// These three mappings contain JSON ABI literals whose whitespace was changed
// during source recovery. Only JSON syntax whitespace is ignored for these links;
// whitespace inside JSON strings, field order, duplicate keys and all values stay exact.
const reviewedAbiFormatting = new Set([
  'evm-tx-setcode-transactions-eip-7702:11:examples/evm/transaction-types/eip7702/eip7702_batch.go',
  'understanding-ethereum-transactions-and-messages-from-state-changes-to-off-chain-messages-part-2-e8ef96b82768:13:examples/evm/transaction-types/eip7702/eip7702_batch.go',
  'ethereum-dev-hacks-catching-hidden-transfers-real-time-events-and-multicalls-bef7435b9397:8:examples/evm/multicall/main.go',
]);
export function jsonAbiLiteralEqual(left, right) {
  if (left === right) return true;
  function compact(token) {
    if (!token?.startsWith('`') || !token.endsWith('`')) return null;
    const value = token.slice(1, -1);
    try { if (!Array.isArray(JSON.parse(value))) return null; } catch { return null; }
    let result = '', quoted = false, escaped = false;
    for (const char of value) {
      if (quoted) {
        result += char;
        if (escaped) escaped = false;
        else if (char === '\\') escaped = true;
        else if (char === '"') quoted = false;
      } else if (char === '"') { quoted = true; result += char; }
      else if (!/[\t\n\r ]/.test(char)) result += char;
    }
    return result;
  }
  const a = compact(left), b = compact(right);
  return a !== null && b !== null && a === b;
}

export function auditEvm(root) {
  const articles = JSON.parse(fs.readFileSync(path.join(root, 'catalog/articles.json'), 'utf8'));
  const failures = [];
  const results = articles.filter(article => article.chain === 'evm').map(article => {
    const snapshotPath = `articles/evm/${article.slug}/published.md`;
    const snapshot = fs.readFileSync(path.join(root, snapshotPath), 'utf8');
    const blocks = new Map([...snapshot.matchAll(/## Block (\d+)\n\nSHA-256: `[a-f0-9]{64}`\n\n````text\n([\s\S]*?)\n````/g)].map(match => [Number(match[1]), match[2]]));
    const mappings = [];
    for (const block of article.sourceBlocks) {
      assert.ok(blocks.has(block.index), `${article.slug}: missing block ${block.index}`);
      for (const relative of block.implementations) {
        const filename = path.resolve(root, relative);
        assert.ok(filename.startsWith(path.resolve(root) + path.sep), 'Source must stay inside repository');
        const published = blocks.get(block.index);
        const source = fs.readFileSync(filename, 'utf8');
        const exactSubstring = source.includes(published);
        const normalizedSubstring = normalizePublishedText(source).includes(normalizePublishedText(published));
        const literalPreservingMatch = containsLiteralPreserving(source, published);
        const reviewedAbiFormattingMatch = !literalPreservingMatch && reviewedAbiFormatting.has(`${article.slug}:${block.index}:${relative}`) && containsLiteralPreserving(source, published, jsonAbiLiteralEqual);
        const result = {block: block.index, path: relative, exactSubstring, normalizedSubstring, literalPreservingMatch, reviewedAbiFormattingMatch, broadNormalizationOnly: normalizedSubstring && !literalPreservingMatch && !reviewedAbiFormattingMatch};
        mappings.push(result);
        if (!literalPreservingMatch && !reviewedAbiFormattingMatch) failures.push({article: article.slug, ...result});
      }
    }
    return {
      title: article.title, slug: article.slug, url: article.url, snapshot: snapshotPath,
      displayedBlocks: article.sourceBlocks.length,
      mappedBlocks: article.sourceBlocks.filter(block => block.implementations.length).length,
      originalVariantBlocks: article.sourceBlocks.filter(block => block.originalRepositoryFiles?.length).length,
      unmappedBlocks: article.sourceBlocks.filter(block => !block.implementations.length).map(block => ({index: block.index, kind: block.kind, originalRepositoryFiles: block.originalRepositoryFiles || []})),
      mappings, catalogStatus: article.verification.status,
      conclusion: article.sourceBlocks.length ? 'Declared implementation links checked; remaining fragments/output/variants and runtime coverage require individual review.' : 'No displayed code in the captured snapshot; prose correctness and live freshness are not checked.'
    };
  });
  return {scope: 'All cataloged EVM articles; committed snapshots, not fresh live Substack content.', comparisonRule: 'Full published block token sequence occurs in mapped file, with literal contents and token boundaries preserved, typographic quotes normalized, and comment whitespace collapsed. This is a conservative lexical comparison, not parsing or semantic/runtime verification. Three explicitly reviewed ABI raw-string mappings permit JSON syntax whitespace changes, preserving JSON string contents. Legacy broad whitespace comparison is recorded separately and does not determine pass/fail.', articles: results, failures};
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const root = path.resolve(import.meta.dirname, '..');
  const report = auditEvm(root);
  const mappings = report.articles.flatMap(article => article.mappings);
  console.log(`EVM alignment: ${report.articles.length} articles; ${mappings.length} implementation links; ${report.failures.length} mismatches. No examples executed.`);
  for (const failure of report.failures) console.error(`${failure.article} block ${failure.block} no longer matches ${failure.path}`);
  if (process.argv.includes('--report')) {
    fs.writeFileSync(path.join(root, 'verification/evm-alignment-2026-10-30.json'), JSON.stringify({date: '2026-10-30', ...report}, null, 2) + '\n');
  }
  if (report.failures.length) process.exitCode = 1;
}
