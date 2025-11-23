#!/usr/bin/env node
// Build script for Cloudflare Workers deployment
// This script removes node_modules before deployment

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('Preparing for deployment...');

// Remove node_modules if it exists
const nodeModulesPath = path.join(__dirname, 'node_modules');
if (fs.existsSync(nodeModulesPath)) {
  console.log('Removing node_modules...');
  try {
    fs.rmSync(nodeModulesPath, { recursive: true, force: true });
    console.log('✓ node_modules removed');
  } catch (error) {
    console.warn('Warning: Could not remove node_modules:', error.message);
  }
}

// Deploy
console.log('Deploying to Cloudflare...');
try {
  execSync('npx wrangler deploy --assets=. --compatibility-date 2025-07-30', {
    stdio: 'inherit',
    cwd: __dirname
  });
  console.log('✓ Deployment complete!');
} catch (error) {
  console.error('✗ Deployment failed');
  process.exit(1);
}

