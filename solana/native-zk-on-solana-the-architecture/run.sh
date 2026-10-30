#!/usr/bin/env bash
set -euo pipefail
source "$(cd "$(dirname "$0")" && pwd)/local-harness.sh"
MODE="${1:---preflight}"
[[ "$#" -le 1 && ( "$MODE" == --preflight || "$MODE" == --execute-local ) ]] || fail 'Usage: run.sh [--preflight|--execute-local]'
preflight
require_flag create-token --enable-confidential-transfers
require_flag configure-confidential-transfer-account --address
require_flag deposit-confidential-tokens --address
require_flag apply-pending-balance --address
require_flag transfer --confidential
require_flag withdraw-confidential-tokens --address
echo 'BLOCKED: CLI flags do not prove compatible Token-2022/proof-program/runtime. No complete confidential lifecycle has passed for this workshop.' >&2
echo 'Do not run scenario.sh manually; review the deposit failure in README.md before selecting a compatible local runtime.' >&2
exit 3
