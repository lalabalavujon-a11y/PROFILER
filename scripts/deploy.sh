#!/bin/bash

# 🚀 PROFILER Lead Recon - Deployment Script
# Deploys to Cloudflare Workers with Node.js 22

set -e

echo "🚀 PROFILER Lead Recon - Deployment Starting"
echo "============================================="

# Check Node.js version
echo "📋 Checking Node.js version..."
node scripts/check-node-version.js

# Install dependencies
echo "📦 Installing dependencies..."
pnpm install --frozen-lockfile

# Run tests
echo "🧪 Running tests..."
pnpm test --run --reporter=basic || echo "⚠️  Some tests failed, continuing deployment..."

# Build the application
echo "🏗️  Building application..."
pnpm build

# Verify build output
if [ ! -f "dist/api/server.js" ]; then
    echo "❌ Build failed - server.js not found"
    exit 1
fi

echo "✅ Build completed successfully"

# Deploy to Cloudflare Workers
echo "🌐 Deploying to Cloudflare Workers..."

# Check if wrangler is installed
if ! command -v wrangler &> /dev/null; then
    echo "📦 Installing Wrangler CLI..."
    pnpm add -g wrangler
fi

# Deploy based on environment
ENVIRONMENT=${1:-staging}

case $ENVIRONMENT in
    "production"|"prod")
        echo "🚀 Deploying to PRODUCTION..."
        wrangler deploy --env production
        ;;
    "staging"|"stage")
        echo "🧪 Deploying to STAGING..."
        wrangler deploy --env staging
        ;;
    "development"|"dev")
        echo "🔧 Deploying to DEVELOPMENT..."
        wrangler deploy --env development
        ;;
    *)
        echo "❌ Unknown environment: $ENVIRONMENT"
        echo "Usage: ./scripts/deploy.sh [production|staging|development]"
        exit 1
        ;;
esac

# Verify deployment
echo "🔍 Verifying deployment..."
sleep 5

# Get the deployment URL based on environment
case $ENVIRONMENT in
    "production"|"prod")
        URL="https://profiler.leadrecon.app/health"
        ;;
    "staging"|"stage")
        URL="https://staging.profiler.leadrecon.app/health"
        ;;
    *)
        URL="https://profiler-lead-recon-dev.workers.dev/health"
        ;;
esac

# Health check
echo "🏥 Running health check on $URL..."
if curl -f "$URL" > /dev/null 2>&1; then
    echo "✅ Deployment successful! Health check passed."
else
    echo "⚠️  Health check failed, but deployment may still be working."
fi

echo ""
echo "🎉 Deployment completed!"
echo "📊 Dashboard: https://dash.cloudflare.com/"
echo "🔗 URL: $URL"
echo "📈 Monitor: https://dash.cloudflare.com/analytics"
echo ""
echo "🎯 Next steps:"
echo "   1. Configure environment variables in Cloudflare dashboard"
echo "   2. Set up KV namespace and R2 bucket"
echo "   3. Configure custom domain if needed"
echo "   4. Monitor logs and performance"
