#!/usr/bin/env bash
# Build locally; publish through the explicit production workflow.
# Does not alter git history, push branches, or print credentials.
set -euo pipefail
cd "$(dirname "$0")/.."
npm ci
npm run build
npm run typecheck
printf '%s\n' 'Validated static output: out/' 'Publish via the Verify and publish pilot workflow on main with deploy=true after configuring Cloudflare secrets.'
