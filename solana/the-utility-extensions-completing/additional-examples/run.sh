#!/usr/bin/env bash
set -euo pipefail
source "$(cd "$(dirname "$0")" && pwd)/local-harness.sh"
MODE="${1:---preflight}"
[[ "$#" -le 1 && ( "$MODE" == --preflight || "$MODE" == --execute-local ) ]] || fail 'Usage: run.sh [--preflight|--execute-local]'
preflight
require_flag create-token --enable-permanent-delegate
require_flag create-token --enable-non-transferable
require_flag create-token --default-account-state
require_flag transfer --with-memo
if [[ "$MODE" == --preflight ]]; then echo 'Capabilities present; runtime NOT verified. Use --execute-local only in coordinated disposable local session.'; exit 0; fi
start_local
source "$ROOT/scenario.sh"
echo 'Article local scenario passed; no public network used.'
