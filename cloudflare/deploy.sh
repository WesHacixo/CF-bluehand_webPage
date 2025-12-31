#!/bin/bash
# Cloudflare Pages Deployment Script
# Usage: ./deploy.sh [--api-token TOKEN]

set -e

PROJECT_NAME="bluehand-solutions"
DEPLOY_DIR="./"

# Check for API token
if [ -n "$CLOUDFLARE_API_TOKEN" ]; then
  echo "✅ Using CLOUDFLARE_API_TOKEN from environment"
  export CLOUDFLARE_API_TOKEN
elif [ "$1" == "--api-token" ] && [ -n "$2" ]; then
  echo "✅ Using API token from command line"
  export CLOUDFLARE_API_TOKEN="$2"
else
  echo "⚠️  No API token found. Checking authentication..."
  bunx wrangler whoami || {
    echo "❌ Not authenticated. Please either:"
    echo "   1. Set CLOUDFLARE_API_TOKEN environment variable, or"
    echo "   2. Run: bunx wrangler login"
    exit 1
  }
fi

echo ""
echo "🚀 Deploying to Cloudflare Pages..."
echo "   Project: $PROJECT_NAME"
echo "   Directory: $DEPLOY_DIR"
echo ""

bunx wrangler pages deploy "$DEPLOY_DIR" \
  --project-name="$PROJECT_NAME" \
  --commit-dirty=true

echo ""
echo "✅ Deployment complete!"
