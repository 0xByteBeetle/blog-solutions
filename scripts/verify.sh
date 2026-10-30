#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
node --test scripts/toolchain.test.mjs
node scripts/verify-minimal.mjs
