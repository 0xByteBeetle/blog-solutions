#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

node "$ROOT/scripts/check-catalog.mjs"
node --test "$ROOT/scripts/source-integrity.test.mjs"
node "$ROOT/scripts/verify-restored-builds.mjs"

echo "Recovered-source integrity and build/unit checks passed. See article statuses for runtime coverage."
