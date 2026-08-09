#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
FOUNDRY_ROOT="$ROOT/evm/foundry"
RPC_URL="${RPC_URL:-http://127.0.0.1:18545}"
PORT="${ANVIL_PORT:-18545}"
ANVIL_SENDER="0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266"
LOG_FILE="${TMPDIR:-/tmp}/bytebeetle-blog-anvil.log"

anvil --silent --port "$PORT" >"$LOG_FILE" 2>&1 &
ANVIL_PID=$!
trap 'kill "$ANVIL_PID" 2>/dev/null || true' EXIT

for _ in $(seq 1 50); do
  if cast block-number --rpc-url "$RPC_URL" >/dev/null 2>&1; then
    break
  fi
  sleep 0.1
done

DEPLOYMENT=$(forge create src/Tracing.sol:TraceStore \
  --root "$FOUNDRY_ROOT" \
  --rpc-url "$RPC_URL" \
  --from "$ANVIL_SENDER" \
  --unlocked \
  --broadcast \
  --json)

CONTRACT=$(node -e 'const value=JSON.parse(process.argv[1]); process.stdout.write(value.deployedTo)' "$DEPLOYMENT")
SUCCESS_DATA=$(cast calldata 'store((uint256,string))' '(25,"bob")')
FAILURE_DATA=$(cast calldata 'store((uint256,string))' '(0,"bob")')

cast call "$CONTRACT" "$SUCCESS_DATA" --rpc-url "$RPC_URL" >/dev/null

SUCCESS_TRACE=$(cast rpc --rpc-url "$RPC_URL" debug_traceCall \
  "{\"to\":\"$CONTRACT\",\"data\":\"$SUCCESS_DATA\"}" \
  latest)
FAILURE_TRACE=$(cast rpc --rpc-url "$RPC_URL" debug_traceCall \
  "{\"to\":\"$CONTRACT\",\"data\":\"$FAILURE_DATA\"}" \
  latest)

node -e '
const success = JSON.parse(process.argv[1]);
const failure = JSON.parse(process.argv[2]);
if (success.failed !== false || !Array.isArray(success.structLogs) || success.structLogs.length === 0) {
  throw new Error("successful debug_traceCall did not return an execution trace");
}
if (failure.failed !== true || !Array.isArray(failure.structLogs) || failure.structLogs.length === 0) {
  throw new Error("reverting debug_traceCall was not marked as failed");
}
console.log(`Anvil trace verified: ${success.structLogs.length} successful steps, ${failure.structLogs.length} reverting steps.`);
' "$SUCCESS_TRACE" "$FAILURE_TRACE"
