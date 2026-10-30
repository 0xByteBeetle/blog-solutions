#!/usr/bin/env bash
# Supplemental article-local harness adapted from existing token-2022 local lab.
set -euo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
RPC_PORT="${WORKSHOP_RPC_PORT:-22999}"
[[ "$RPC_PORT" =~ ^[0-9]+$ ]] && (( RPC_PORT >= 1024 && RPC_PORT <= 64000 )) || { echo 'Invalid loopback port' >&2; exit 2; }
RPC="http://127.0.0.1:$RPC_PORT"
# Reject ambiguous/external overrides BEFORE any tool invocation or key generation.
[[ -z "${SOLANA_URL:-}" && -z "${SOLANA_RPC_URL:-}" && -z "${ANCHOR_PROVIDER_URL:-}" && -z "${WORKSHOP_RPC_URL:-}" ]] || { echo 'URL overrides forbidden; this workshop is strict loopback-only' >&2; exit 2; }
unset HTTP_PROXY HTTPS_PROXY ALL_PROXY http_proxy https_proxy all_proxy
export NO_PROXY=127.0.0.1,localhost no_proxy=127.0.0.1,localhost

fail() { echo "$*" >&2; exit 1; }
require_flag() {
  local command="$1" flag="$2" help
  help="$(spl-token "$command" --help)" || fail "Cannot inspect spl-token $command"
  grep -Fq -- "$flag" <<< "$help" || fail "Required CLI capability absent: $command $flag"
}
preflight() {
  for tool in python3 solana solana-keygen solana-test-validator spl-token curl; do
    command -v "$tool" >/dev/null || fail "Missing $tool; no automatic install or public fallback"
  done
  local version solana_version validator_version global_help flag
  version="$(spl-token --version)"
  solana_version="$(solana --version)"
  validator_version="$(solana-test-validator --version)"
  if [[ "$version" =~ ^spl-token-cli[[:space:]]5\.5\.0([[:space:]]|$) ]]; then
    [[ "$solana_version" =~ ^solana-cli[[:space:]]3\.1\.9([[:space:]]|$) && "$validator_version" =~ ^solana-test-validator[[:space:]]3\.1\.9([[:space:]]|$) ]] || fail "CLI5.5.0 requires the reviewed Agave3.1.9 pair; got $solana_version / $validator_version"
  elif [[ ! "$version" =~ ^spl-token-cli[[:space:]]5\.6\.1([[:space:]]|$) ]]; then
    fail "Unsupported CLI version: $version; reviewed options are CLI5.5.0/Agave3.1.9 or the documented CLI5.6.1 reference"
  fi
  python3 --version
  printf '%s\n' "$solana_version" "$validator_version" "$version"
  global_help="$(spl-token --help)" || fail 'Cannot inspect spl-token global options'
  for flag in --url -C --config --program-2022 --fee-payer --with-compute-unit-limit; do
    grep -Fq -- "$flag" <<< "$global_help" || fail "Required CLI capability absent: global $flag"
  done
  # Full used flag surface across these three nonconfidential workshops.
  for flag in --decimals --enable-permanent-delegate --enable-non-transferable --default-account-state --enable-freeze --interest-rate --enable-metadata --metadata-address; do require_flag create-token "$flag"; done
  for flag in --owner --fee-payer; do require_flag create-account "$flag"; done
  for flag in --owner --addresses-only; do require_flag accounts "$flag"; done
  for flag in --mint-authority --fee-payer; do require_flag mint "$flag"; done
  require_flag balance --address
  for flag in --from --owner --fee-payer --with-memo; do require_flag transfer "$flag"; done
  for flag in --owner --fee-payer; do require_flag burn "$flag"; done
  for flag in --freeze-authority --fee-payer; do require_flag thaw "$flag"; done
  for flag in --owner --fee-payer; do require_flag enable-required-transfer-memos "$flag"; done
  for flag in --rate-authority --fee-payer; do require_flag set-interest-rate "$flag"; done
  for flag in --mint-authority --update-authority --fee-payer; do require_flag initialize-metadata "$flag"; done
  for flag in --authority --fee-payer; do require_flag update-metadata "$flag"; done
}
start_local() {
  # Each execution owns a fresh directory; no existing wallet/config/ledger read.
  mkdir -p "$ROOT/.local"
  LOCAL="$(mktemp -d "$ROOT/.local/run-XXXXXXXX")"
  CONFIG="$LOCAL/solana.yml"
  PAYER="$LOCAL/payer.json"; ALICE="$LOCAL/alice.json"; BOB="$LOCAL/bob.json"
  cleanup() { if [[ -n "${VALIDATOR_PID:-}" ]]; then kill "$VALIDATOR_PID" 2>/dev/null || true; wait "$VALIDATOR_PID" 2>/dev/null || true; fi; }
  trap cleanup EXIT
  # Fail if selected port already has a listener; never attach to another worker's validator.
  python3 - "$RPC_PORT" <<'PY'
import socket,sys
s=socket.socket();s.bind(('127.0.0.1',int(sys.argv[1])));s.close()
PY
  solana-test-validator --reset --ledger "$LOCAL/ledger" --bind-address 127.0.0.1 \
    --rpc-port "$RPC_PORT" --gossip-port "$((RPC_PORT+2))" --faucet-port "$((RPC_PORT+3))" \
    --dynamic-port-range "$((RPC_PORT+4))-$((RPC_PORT+104))" >"$LOCAL/validator.log" 2>&1 &
  VALIDATOR_PID=$!
  for _ in {1..60}; do
    kill -0 "$VALIDATOR_PID" 2>/dev/null || fail 'Owned local validator stopped'
    if solana cluster-version --url "$RPC" >/dev/null 2>&1; then break; fi
    sleep 1
  done
  solana cluster-version --url "$RPC" >/dev/null || fail 'Local validator readiness timed out'
  for key in "$PAYER" "$ALICE" "$BOB"; do solana-keygen new --silent --no-bip39-passphrase -o "$key" >/dev/null; done
  PAYER_PUB="$(solana-keygen pubkey "$PAYER")"; ALICE_PUB="$(solana-keygen pubkey "$ALICE")"; BOB_PUB="$(solana-keygen pubkey "$BOB")"
  solana config set --config "$CONFIG" --url "$RPC" --keypair "$PAYER" >/dev/null
  solana airdrop 100 "$PAYER_PUB" --url "$RPC" >/dev/null
  printf 'Local fixtures only: %s\n' "$LOCAL"
}
token22() { spl-token --url "$RPC" -C "$CONFIG" --program-2022 "$@"; }
new_mint_keypair() {
  local path="$LOCAL/$1.json"
  solana-keygen new --silent --no-bip39-passphrase -o "$path" >/dev/null
  printf '%s\n' "$path"
}
ata22() { token22 accounts "$1" --owner "$2" --addresses-only | tail -n 1; }
assert_eq() { [[ "$1" == "$2" ]] || fail "$3: expected $2, got $1"; printf 'PASS %s\n' "$3"; }
assert_contains() { [[ "$1" == *"$2"* ]] || fail "$3: missing expected text $2"; printf 'PASS %s\n' "$3"; }
expect_failure() {
  local label="$1" expected="$2"; shift 2
  local slug="${label// /-}"
  local failure_log="$LOCAL/expected-failure-$slug.log"
  if "$@" >"$failure_log" 2>&1; then fail "$label unexpectedly succeeded"; fi
  # Classify the Token-2022 program rejection, not a CLI/RPC/signing failure.
  grep -Fq 'Program TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb failed:' "$failure_log" || fail "$label did not identify Token-2022 program failure; inspect $failure_log"
  grep -Fq "$expected" "$failure_log" || fail "$label failed for an unexpected program reason; inspect $failure_log"
  printf 'PASS expected local rejection: %s (inspect %s)\n' "$label" "$failure_log"
}

expect_cli_memo_precheck() {
  local failure_log="$LOCAL/expected-cli-memo-precheck.log"
  if "$@" >"$failure_log" 2>&1; then fail 'Memo-less CLI transfer unexpectedly succeeded'; fi
  grep -Fq 'Recipient expects a transfer memo, but none was provided' "$failure_log" || fail "Unexpected CLI memo failure; inspect $failure_log"
  printf 'PASS expected CLI memo precheck (not program execution)\n'
}
