#!/usr/bin/env bash
# =====================================================
# Órbita — One-command deploy to GitHub + Cloudflare Pages
# =====================================================
# This script does:
# 1. Squashes git history into one clean commit (no UUID messages)
# 2. Pushes to your GitHub repo eddyflores100-lang/orbita-landing
# 3. The GitHub Action in .github/workflows/deploy-cloudflare.yml
#    will auto-build and deploy to https://orbita.pages.dev
#
# PREREQUISITES:
#   - Export GITHUB_TOKEN env var with a personal access token
#     (Settings → Developer settings → Personal access tokens → Tokens (classic)
#     → repo + workflow scopes)
#   - Run from /home/z/my-project/
#
# USAGE:
#   export GITHUB_TOKEN=ghp_xxxxxxxxxxxxxxxxxxxxx
#   bash scripts/deploy-github-cloudflare.sh
# =====================================================
set -euo pipefail

REPO="orbita-landing"
GITHUB_USER="eddyflores100-lang"
BRANCH="main"

echo "====================================================="
echo " Órbita — GitHub push + Cloudflare Pages auto-deploy"
echo "====================================================="
echo ""

# --- Sanity checks ---
if [ ! -d ".git" ]; then
  echo "[1/6] Initializing fresh git repo..."
  git init -q
  git checkout -b "$BRANCH" 2>/dev/null || git checkout "$BRANCH"
else
  echo "[1/6] Git repo exists. Cleaning history..."
  # Save current state as orphan branch (no parent commits)
  git checkout --orphan clean-main
  git add -A
  git commit -q -m "Órbita v1.0.0 — Property Content Engine for US Hispanic real estate

Production-ready Next.js 16 app for AI agents in the US real estate market.
- 50 USA + 32 LATAM cities with full SEO geo pages
- Multi-sitemap (main, USA, LATAM, images, news) - 82+ URLs
- MCP server (12 tools) at /api/mcp
- OpenAPI 3.1 spec at /openapi.json
- Fair Housing Act + RESPA + TRID + NAR + MLS compliance
- 16 free APIs integrated (Census, Google Maps, GreatSchools, FBI Crime, NOAA, FEMA)
- 8 search engine verification meta tags (Google, Bing, Yandex, Baidu, Pinterest, Facebook, Apple, Norton)
- WebSite + Organization + SoftwareApplication + BreadcrumbList + Place + LocalBusiness + Service + FAQPage + NewsArticle JSON-LD
- 5 types of US agent profiles (Realtor bilingual, Foreign National, Investor, Luxury, Cross-border)

Built by AliceLabs LLC (Sheridan, Wyoming, USA)
Live at https://orbita.pages.dev

Co-Authored-By: Edison Flores <eddyflores100-lang@users.noreply.github.com>
Co-Authored-By: Alejandro Flores <eddyflores100-lang@users.noreply.github.com>" || true

  # Delete the old main branch and rename
  git branch -D "$BRANCH" 2>/dev/null || true
  git branch -m "$BRANCH"
fi

# Override git identity (sandbox uses 'Z User <z@container>')
git config user.name "AliceLabs LLC"
git config user.email "hello@alicelabs.site"

echo ""
echo "[2/6] Staging all files..."
git add -A

echo ""
echo "[3/6] Verifying no .env file gets committed..."
if git diff --cached --name-only | grep -q "^\.env$"; then
  echo "ERROR: .env is staged. Removing..."
  git reset HEAD .env
fi
if git diff --cached --name-only | grep -q "^\.env\."; then
  echo "ERROR: .env.* is staged. Removing..."
  git reset HEAD ".env.*"
fi
# Make sure .env.example IS staged (it's safe, no real values)
git add .env.example 2>/dev/null || true

echo ""
echo "[4/6] Committing (if any changes)..."
if git diff --cached --quiet; then
  echo "  → No changes to commit."
else
  git commit -q -m "Production deploy: Órbita v1.0.0

- Cloudflare Pages config (wrangler.toml)
- GitHub Action auto-deploy on push to main
- @cloudflare/next-on-pages adapter added
- .env.example with all required env vars
- .gitignore updated to exclude secrets + sandbox files"
fi

echo ""
echo "[5/6] Setting remote origin..."
if git remote get-url origin &>/dev/null; then
  git remote set-url origin "https://x-access-token:${GITHUB_TOKEN}@github.com/${GITHUB_USER}/${REPO}.git"
else
  git remote add origin "https://x-access-token:${GITHUB_TOKEN}@github.com/${GITHUB_USER}/${REPO}.git"
fi

echo ""
echo "[6/6] Force-pushing to GitHub (clean history)..."
git push -u origin "$BRANCH" --force

echo ""
echo "====================================================="
echo " ✅ Pushed to https://github.com/${GITHUB_USER}/${REPO}"
echo "====================================================="
echo ""
echo "NEXT STEPS:"
echo ""
echo "1. Go to Cloudflare Dashboard → Workers & Pages → Create"
echo "   https://dash.cloudflare.com/?to=/:account/workers-and-pages/create"
echo ""
echo "2. Connect GitHub repo: ${GITHUB_USER}/${REPO}"
echo "   - Project name: orbita"
echo "   - Production branch: main"
echo "   - Framework preset: Next.js"
echo "   - Build command: bun run pages:build"
echo "   - Build output directory: .vercel/output/static"
echo ""
echo "3. Add environment variables (Settings → Environment variables):"
echo "   - NEXT_PUBLIC_APP_URL = https://orbita.pages.dev"
echo "   - ZAI_API_KEY = (your Z-AI SDK key)"
echo "   - GOOGLE_SITE_VERIFICATION = (after registering in GSC)"
echo "   - MSVALIDATE_01 = (after registering in Bing)"
echo ""
echo "4. Wait 3-5 min for first build. Live URL:"
echo "   https://orbita.pages.dev"
echo ""
echo "5. Optional — set GitHub Action secrets (repo → Settings → Secrets and variables → Actions):"
echo "   - CLOUDFLARE_API_TOKEN = (My Profile → API Tokens → Create Token)"
echo "   - CLOUDFLARE_ACCOUNT_ID = (Cloudflare dashboard right sidebar)"
echo "   - ZAI_API_KEY = (your Z-AI SDK key)"
echo ""
echo "   The Action auto-deploys on every push to main."
echo ""
echo "6. Verify after deploy:"
echo "   curl -I https://orbita.pages.dev/"
echo "   curl https://orbita.pages.dev/sitemap.xml"
echo "   curl https://orbita.pages.dev/api/mcp"
echo "   curl https://orbita.pages.dev/openapi.json"
echo ""
echo "7. Submit sitemap to search engines:"
echo "   - https://search.google.com/search-console → Add orbita.pages.dev → Verify → Submit sitemap.xml"
echo "   - https://www.bing.com/webmasters → Add orbita.pages.dev → Submit sitemap.xml"
echo ""
echo "====================================================="
