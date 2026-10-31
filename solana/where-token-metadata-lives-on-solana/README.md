# Token metadata clients

[Article](https://andreyobruchkov1996.substack.com/p/where-token-metadata-lives-on-solana)

The two TypeScript files are the article's metadata creation and read examples. They contain historical endpoints/addresses and wallet-dependent operations; type-checking does not execute them.

```sh
npm ci --ignore-scripts
npm run check
```

Tested with the installed Node 20.19.6 and 22.6.0 plus the pinned TypeScript/Metaplex dependencies in package-lock.json. The compatible `rpc-websockets` 9.0.4 override avoids the newer CommonJS/ESM mismatch on Node 22.6. Review credentials, addresses and network before separately authorizing any creation transaction. No key or wallet is included.

## Reproduce mint → token account → 1000 tokens → metadata → readback

`reproduce.mjs` is a supplemental explicit-input route; the two printed TypeScript files are unchanged. Restore the pinned dependencies, then run the offline builder/decoder and owned mock-RPC tests:

```sh
npm ci --ignore-scripts
npm run check
npm test
# Plan only: public addresses, no key reads, RPC calls or signing.
node reproduce.mjs --rpc-url http://127.0.0.1:8899 --payer PAYER_PUBLIC_KEY --mint NEW_MINT_PUBLIC_KEY
```

The execution route requires installed **SPL CLI 5.5.0 / Solana and solana-test-validator 3.1.9**. An ordinary fresh validator lacks Metaplex. The runner checks for an executable program first and stops before key reads or token creation; provisioning is a separate opt-in step.

### Provision a disposable local validator (opt-in)

Use the official program ID declared in [Metaplex's source](https://github.com/metaplex-foundation/mpl-token-metadata/blob/024a6f45a443389815cbfa8855fc1796bc89e4b3/programs/token-metadata/program/src/lib.rs). The recipe exports the program deployed at that ID from the canonical Solana **Devnet RPC** using read-only `program show`/`program dump`, then loads those bytes only into a fresh local ledger. It requires existing Solana CLI tools and `shasum`/`cmp`, not a new installer or an unknown binary-download URL.

The on-chain deployment is **live and upgradeable, not a version-pinned release artifact**. The source link establishes the program identity, not a reproducible-build match for its deployed bytes. Inspect and keep the two `program show` outputs (cluster, ProgramData address, last deployment slot and authority) with the exported SHA-256. Matching before/after outputs guard against an observed upgrade during export. The first recorded hash is an observation, not an independent trust anchor; review that source/observation and reuse only the reviewed hash.

From this article directory, after restoring the npm dependencies above, use one Bash session. Fail-fast mode and the explicit checks below stop before loading if any read/export fails or produces empty/invalid results:

```sh
set -eu
# All configs, binary bytes, ledger and disposable keys stay outside Git.
LAB_DIR=$(mktemp -d "${TMPDIR:-/tmp}/metaplex-local.XXXXXX")
METADATA_PROGRAM=metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s
SOURCE_RPC=https://api.devnet.solana.com
LOCAL_RPC=http://127.0.0.1:8899
CONFIG="$LAB_DIR/cli.yml"
solana --version
solana-test-validator --version
spl-token --version
# This config names a nonexistent signer. Explicit public --buffer-authority
# avoids Agave 3.1.9's default-signer resolution, even for a concrete program lookup.
solana --config "$CONFIG" config set --url "$SOURCE_RPC" --keypair "$LAB_DIR/no-signer.json"
solana --config "$CONFIG" --url "$SOURCE_RPC" genesis-hash > "$LAB_DIR/source-genesis.txt"
test "$(cat "$LAB_DIR/source-genesis.txt")" = EtWTRABZaYq6iMfeYKouRu166VU2xqa1wcaWoxPkrZBG
solana --config "$CONFIG" --url "$SOURCE_RPC" --commitment finalized program show "$METADATA_PROGRAM" --buffer-authority "$METADATA_PROGRAM" --output json > "$LAB_DIR/program-before.json"
test -s "$LAB_DIR/program-before.json"
solana --config "$CONFIG" --url "$SOURCE_RPC" --commitment finalized program dump "$METADATA_PROGRAM" "$LAB_DIR/token-metadata.so"
test -s "$LAB_DIR/token-metadata.so"
solana --config "$CONFIG" --url "$SOURCE_RPC" --commitment finalized program show "$METADATA_PROGRAM" --buffer-authority "$METADATA_PROGRAM" --output json > "$LAB_DIR/program-after.json"
test -s "$LAB_DIR/program-after.json"
cmp "$LAB_DIR/program-before.json" "$LAB_DIR/program-after.json" || exit 1
node --input-type=module - "$LAB_DIR/program-before.json" "$LAB_DIR/token-metadata.so" "$METADATA_PROGRAM" <<'JS'
import fs from 'node:fs';
import assert from 'node:assert/strict';
const [provenance, binary, program] = process.argv.slice(2);
const p = JSON.parse(fs.readFileSync(provenance, 'utf8'));
const bytes = fs.readFileSync(binary);
assert.equal(p.programId, program);
assert.equal(p.owner, 'BPFLoaderUpgradeab1e11111111111111111111111');
assert.ok(p.programdataAddress && Number.isInteger(p.lastDeploySlot));
assert.ok(p.dataLen > 0 && p.dataLen === bytes.length);
assert.deepEqual([...bytes.subarray(0, 4)], [127, 69, 76, 70]); // ELF header
JS
shasum -a 256 "$LAB_DIR/token-metadata.so" > "$LAB_DIR/token-metadata.sha256"
cat "$LAB_DIR/program-after.json" "$LAB_DIR/token-metadata.sha256"
```

**Stop and review that provenance/hash before loading.** An unavailable RPC/program, changed deployment or untrusted export is a failure; do not substitute another download. For later reuse, retain the reviewed checksum file and check it against the same binary before loading. A different path needs the same reviewed hash, not a newly accepted value.

The following reader steps explicitly create disposable local keypairs. They do not use a personal/default wallet. Use unused RPC/WebSocket/faucet ports **8899/8900/9900** (or consistently replace them). The payer receives only local genesis SOL through `--mint`, so no public faucet is needed:

**Check listener exposure before starting:** Agave 3.1.9 [hardcodes RPC and WebSocket listeners to all interfaces](https://github.com/anza-xyz/agave/blob/v3.1.9/test-validator/src/lib.rs#L1100), even with `--bind-address 127.0.0.1`; its test faucet also listens on all interfaces. That flag does not make these services loopback-only. All client requests below explicitly use the owned loopback URL, but the host/network must be appropriate for disposable development services. If these listeners are unacceptable on your network, use existing isolation before startup. This recipe does not change your firewall or install an isolation tool.

The startup and run block is a subshell, so its traps do not change your interactive shell. The guarded cleanup stops only its still-running owned child and waits for it on success, error, Ctrl-C or TERM, preserving the original exit status. The readiness loop is bounded. Inspect the log and require `cluster-version` to report 3.1.9; stop on occupied ports. The ledger path must be new because genesis loading flags are ignored for an existing ledger. `--bpf-program` disables upgrades in this local fixture, not on the public program.

```sh
(
set -eu
cleanup_validator() {
  result=$?
  trap - EXIT INT TERM
  for child in $(jobs -pr); do
    if [ "$child" = "$VALIDATOR_PID" ]; then
      kill "$child" 2>/dev/null || true
    fi
  done
  wait "$VALIDATOR_PID" 2>/dev/null || true
  exit "$result"
}
shasum -a 256 -c "$LAB_DIR/token-metadata.sha256" || exit 1
solana-keygen new --no-bip39-passphrase --silent --outfile "$LAB_DIR/payer.json"
solana-keygen new --no-bip39-passphrase --silent --outfile "$LAB_DIR/new-mint.json"
PAYER_PUBLIC_KEY=$(solana-keygen pubkey "$LAB_DIR/payer.json")
NEW_MINT_PUBLIC_KEY=$(solana-keygen pubkey "$LAB_DIR/new-mint.json")
solana --config "$CONFIG" config set --url "$LOCAL_RPC" --keypair "$LAB_DIR/payer.json"
solana-test-validator --config "$CONFIG" --bind-address 127.0.0.1 \
  --rpc-port 8899 --faucet-port 9900 --ledger "$LAB_DIR/ledger" \
  --mint "$PAYER_PUBLIC_KEY" --bpf-program "$METADATA_PROGRAM" "$LAB_DIR/token-metadata.so" \
  > "$LAB_DIR/validator.log" 2>&1 &
VALIDATOR_PID=$!
trap cleanup_validator EXIT
trap 'exit 130' INT
trap 'exit 143' TERM
ATTEMPT=0
until solana --config "$CONFIG" --url "$LOCAL_RPC" cluster-version; do
  kill -0 "$VALIDATOR_PID" || exit 1
  ATTEMPT=$((ATTEMPT + 1))
  [ "$ATTEMPT" -lt 60 ] || exit 1
  sleep 1
done
kill -0 "$VALIDATOR_PID"
# Verify the expected program is executable through the existing fail-closed guard.
node --input-type=module -e 'import {requireMetadataProgram} from "./reproduce.mjs"; await requireMetadataProgram(process.argv[1]); console.log("Executable metadata program found");' "$LOCAL_RPC"
node reproduce.mjs --rpc-url "$LOCAL_RPC" --payer "$PAYER_PUBLIC_KEY" --mint "$NEW_MINT_PUBLIC_KEY"
# Opt-in: mint and metadata transactions go only to this explicit loopback node.
node reproduce.mjs --execute-local --rpc-url "$LOCAL_RPC" \
  --payer-keypair "$LAB_DIR/payer.json" --mint-keypair "$LAB_DIR/new-mint.json"
)
```

The final runner output must show raw supply and owner balance `1000000000000`, alongside the verified metadata fields. Keep the exported artifact/provenance only if you need the reviewed local fixture again; otherwise remove your disposable lab directory after stopping its node. The commands and flags match the installed 3.1.9 CLI help and [read-only CLI source](https://github.com/anza-xyz/agave/blob/v3.1.9/cli/src/program.rs). The runner performs no automatic provisioning or public-network fallback.

It creates a legacy SPL mint with nine decimals, creates the payer’s associated token account, mints 1000 tokens, submits `CreateMetadataAccountV3` with `Example Token / EXMPL / https://example.com/metadata.json`, then verifies metadata owner/PDA/mint/fields/update authority, raw supply `1000000000000`, and the owner’s token balance. Each CLI call uses an explicit temporary config and loopback URL. No default wallet path is used; the caller owns the disposable keys/validator and removes them afterward. Temporary config files are deleted by the runner. Steps are separate transactions, so a later failure can leave earlier local fixture accounts created.

The supplemental route consistently uses **confirmed** commitment for Umi submission and metadata/token readback, matching the SPL CLI's confirmed writes. On a fresh validator the finalized bank can still be at slot 0 after the mint is confirmed; mixing these views caused a metadata simulation failure. The runner checks the confirmed transaction result and prints its signature, metadata address, decoded fields, authority, decimals and balances.

**Verified on 2026-10-31:** the keyless canonical Devnet export and local re-export had matching SHA-256; a fresh article-only copy with Agave 3.1.9, SPL 5.5.0 and Node 22.6.0 completed mint → associated token account → 1000 tokens → metadata creation → readback. The successful local metadata receipt and independently decoded account bytes matched the fields above; supply and owner balance were both `1000000000000`, with nine decimals and the disposable payer as update authority. Six offline tests also cover encoding/decoding, rejection guards and confirmed-bank RPC readback. This is a local test of a live exported program, not an immutable-release or public-network deployment claim. Owned processes, temporary keys, ledger and executable bytes were removed. No public faucet/transaction or personal wallet was used; the URI's off-chain JSON content is not fetched or validated.
