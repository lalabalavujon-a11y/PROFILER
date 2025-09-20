#!/bin/bash

# ABM System Purge Script
# This script cleans up temporary files and resets the ABM system

set -e

echo "🧹 ABM System Purge"
echo "==================="

# Confirm before purging
read -p "Are you sure you want to purge ABM system files? This will remove temporary files and reset the system. (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ Purge cancelled."
    exit 1
fi

echo "🗑️  Purging temporary files..."

# Remove temporary files
echo "   Removing temporary build files..."
rm -rf dist/
rm -rf .next/
rm -rf node_modules/.cache/
rm -rf .turbo/

# Remove log files
echo "   Removing log files..."
rm -f *.log
rm -f npm-debug.log*
rm -f yarn-debug.log*
rm -f yarn-error.log*

# Remove environment files (but keep templates)
echo "   Removing environment files..."
rm -f .env
rm -f .env.local
rm -f .env.development.local
rm -f .env.test.local
rm -f .env.production.local

# Remove Prisma generated files
echo "   Removing Prisma generated files..."
rm -rf prisma/migrations/
rm -rf node_modules/.prisma/

# Remove lock files
echo "   Removing lock files..."
rm -f package-lock.json
rm -f yarn.lock
rm -f pnpm-lock.yaml

# Remove TypeScript build info
echo "   Removing TypeScript build info..."
rm -f tsconfig.tsbuildinfo
rm -rf dist/

# Remove any temporary ABM files
echo "   Removing temporary ABM files..."
rm -f abm-temp-*
rm -f *.tmp
rm -f .DS_Store

# Clean up git
echo "   Cleaning up git..."
git clean -fd
git reset --hard HEAD

echo ""
echo "✅ Purge Complete!"
echo "=================="
echo ""
echo "🧹 Cleaned up:"
echo "   - Build artifacts and cache files"
echo "   - Log files"
echo "   - Environment files (templates preserved)"
echo "   - Prisma generated files"
echo "   - Lock files"
echo "   - Temporary ABM files"
echo ""
echo "📋 To restore ABM system:"
echo "   1. Run: ./scripts/deploy-abm.sh"
echo "   2. Configure .env file"
echo "   3. Install dependencies: npm install"
echo "   4. Generate Prisma client: npx prisma generate"
echo "   5. Run migrations: npx prisma migrate dev"
echo ""
echo "🎯 ABM system purged and ready for fresh deployment!"
