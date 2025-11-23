#!/bin/bash
# Build script for Cloudflare Workers deployment
# This script prepares assets excluding node_modules

set -e

echo "Cleaning previous build..."
rm -rf .wrangler-build

echo "Creating build directory..."
mkdir -p .wrangler-build

echo "Copying assets (excluding node_modules)..."
# Copy all files except node_modules
rsync -av --exclude='node_modules' \
          --exclude='.git' \
          --exclude='.wrangler' \
          --exclude='.wrangler-build' \
          --exclude='package-lock.json' \
          --exclude='*.log' \
          --exclude='.DS_Store' \
          --exclude='.env*' \
          --exclude='.vscode' \
          --exclude='.idea' \
          ./ .wrangler-build/

echo "Deploying from build directory..."
cd .wrangler-build
npx wrangler deploy --assets=. --compatibility-date 2025-07-30

echo "Deployment complete!"

