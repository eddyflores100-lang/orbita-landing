#!/usr/bin/env bash
# Setup GitLab backup mirror for orbita-landing repo
#
# Usage:
#   GITLAB_TOKEN=glpat-xxxxxxxxxxxx bash setup_gitlab_mirror.sh
#
# What it does:
#   1. Creates a GitLab project (private) named orbita-landing
#   2. Adds gitlab.com as a new git remote (named 'gitlab')
#   3. Pushes main branch to GitLab
#   4. Sets up push to both remotes in future (via push-both alias)
#
# Prerequisites:
#   - GitLab account with Personal Access Token (scopes: api, write_repository)
#   - GitHub repo already pushed (we use the same commit history)
#   - Internet access to gitlab.com
#
# After first run, push to both remotes with:
#   git push --all

set -euo pipefail

# Validate env
if [ -z "${GITLAB_TOKEN:-}" ]; then
  echo "❌ GITLAB_TOKEN env var required"
  echo "   Get one from: https://gitlab.com/-/user_settings/personal_access_tokens"
  echo "   Scopes needed: api, write_repository"
  echo ""
  echo "   Usage: GITLAB_TOKEN=glpat-xxx bash setup_gitlab_mirror.sh"
  exit 1
fi

# Config
GITLAB_USERNAME="${GITLAB_USERNAME:-alicelabs-llc}"
PROJECT_NAME="orbita-landing"
PROJECT_VISIBILITY="private"  # or "public"
PROJECT_DESCRIPTION="AliceLabs orbita-landing — Shopify apps + research + projects"

REPO_DIR="/home/z/my-project"
cd "$REPO_DIR"

echo "=== 1. Verificar remotes actuales ==="
git remote -v

echo ""
echo "=== 2. Crear proyecto GitLab: $PROJECT_NAME ==="
# Use GitLab API to create project under user namespace
RESPONSE=$(curl -sS -X POST "https://gitlab.com/api/v4/projects" \
  -H "PRIVATE-TOKEN: $GITLAB_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"name\": \"$PROJECT_NAME\",
    \"description\": \"$PROJECT_DESCRIPTION\",
    \"visibility\": \"$PROJECT_VISIBILITY\",
    \"initialize_with_readme\": false
  }")

PROJECT_ID=$(echo "$RESPONSE" | python3 -c "import json,sys; d=json.load(sys.stdin); print(d.get('id', ''))" 2>/dev/null || echo "")

if [ -z "$PROJECT_ID" ]; then
  echo "❌ Failed to create GitLab project. Response:"
  echo "$RESPONSE" | head -200
  exit 1
fi

echo "✅ Project created: id=$PROJECT_ID"
GITLAB_URL="https://gitlab.com/$GITLAB_USERNAME/$PROJECT_NAME.git"
echo "   URL: $GITLAB_URL"

echo ""
echo "=== 3. Agregar remote 'gitlab' ==="
# Remove if exists
git remote remove gitlab 2>/dev/null || true
git remote add gitlab "https://oauth2:${GITLAB_TOKEN}@gitlab.com/$GITLAB_USERNAME/$PROJECT_NAME.git"

echo ""
echo "=== 4. Push a GitLab (rama main) ==="
git push -u gitlab main
echo "✅ Pushed to GitLab"

echo ""
echo "=== 5. Configurar push a ambos remotes ==="
# Add a 'both' remote that pushes to GitHub + GitLab simultaneously
git remote remove both 2>/dev/null || true
git remote add both "$(git remote get-url origin)"
# We can't push to multiple URLs with one remote in standard git, but we can use a script

cat > /home/z/my-project/scripts/push_both.sh << 'EOF'
#!/usr/bin/env bash
# Push to both GitHub and GitLab
set -e
cd /home/z/my-project
echo "=== Pushing to GitHub ==="
git push origin "$@"
echo ""
echo "=== Pushing to GitLab ==="
git push gitlab "$@"
echo ""
echo "✅ Pushed to both remotes"
EOF
chmod +x /home/z/my-project/scripts/push_both.sh

echo "✅ Created /home/z/my-project/scripts/push_both.sh"
echo "   Use it instead of 'git push' to push to both remotes:"
echo "   bash scripts/push_both.sh main"

echo ""
echo "=== 6. Limpieza del token del remote URL ==="
# For security: replace token-bearing URL with tokenless URL (we'll use credential helper or prompt)
git remote set-url gitlab "https://gitlab.com/$GITLAB_USERNAME/$PROJECT_NAME.git"

echo ""
echo "=== 7. Verificación final ==="
git remote -v

echo ""
echo "🎉 GitLab mirror setup completo!"
echo ""
echo "Remotes:"
echo "  origin → GitHub (eddyflores100-lang/orbita-landing)"
echo "  gitlab → GitLab ($GITLAB_USERNAME/$PROJECT_NAME)"
echo ""
echo "Para pushear a ambos a la vez:"
echo "  bash scripts/push_both.sh main"
echo ""
echo "O individualmente:"
echo "  git push origin main  # solo GitHub"
echo "  git push gitlab main  # solo GitLab"
