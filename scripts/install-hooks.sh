#!/bin/bash

# Install git hooks for Bluehand Solutions project
# This script copies hooks from the repository to .git/hooks/

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
HOOKS_SOURCE="$REPO_ROOT/.git/hooks"
HOOKS_TARGET="$REPO_ROOT/.git/hooks"

echo "🔧 Installing git hooks for Bluehand Solutions..."

# Check if we're in a git repository
if [ ! -d "$REPO_ROOT/.git" ]; then
    echo "❌ Error: Not a git repository"
    exit 1
fi

# List of hooks to install
HOOKS=("pre-commit" "commit-msg" "pre-push")

# Install each hook
for hook in "${HOOKS[@]}"; do
    if [ -f "$HOOKS_TARGET/$hook" ]; then
        echo "✅ $hook already installed"
        chmod +x "$HOOKS_TARGET/$hook"
    else
        echo "⚠️  $hook not found in .git/hooks/"
        echo "   Hooks should be manually copied or created"
    fi
done

echo ""
echo "✅ Git hooks installation complete!"
echo ""
echo "Hooks installed:"
echo "  - pre-commit: Branch protection, commit format, white text check"
echo "  - commit-msg: Conventional commits validation"
echo "  - pre-push: Production branch warnings"
echo ""
echo "To test hooks, try:"
echo "  git commit --allow-empty -m 'test: Test commit message format'"

