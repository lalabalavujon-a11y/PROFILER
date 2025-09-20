#!/bin/bash

# ABM System Deployment Script
# This script deploys the ABM system with proper Node.js version management

set -e

echo "🚀 ABM System Deployment"
echo "========================"

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Please run from project root."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node --version | cut -d'v' -f2)
REQUIRED_VERSION="18.18.0"

echo "📋 Current Node.js version: $NODE_VERSION"
echo "📋 Required Node.js version: $REQUIRED_VERSION"

# Function to compare versions
version_compare() {
    if [ "$(printf '%s\n' "$REQUIRED_VERSION" "$1" | sort -V | head -n1)" = "$REQUIRED_VERSION" ]; then
        return 0
    else
        return 1
    fi
}

# Check if Node.js version is sufficient
if ! version_compare "$NODE_VERSION"; then
    echo "⚠️  Node.js version $NODE_VERSION is below required $REQUIRED_VERSION"
    echo "💡 Please upgrade Node.js to version 22.12.0+ for full ABM functionality"
    echo "   You can use: nvm install 22.12.0 && nvm use 22.12.0"
    echo ""
    echo "🔄 Continuing with limited functionality..."
fi

# Create environment file if it doesn't exist
if [ ! -f ".env" ]; then
    echo "📝 Creating .env file from template..."
    cp env.abm.example .env
    echo "✅ Created .env file. Please edit it with your actual values."
fi

# Check if required environment variables are set
echo "🔍 Checking environment configuration..."

if [ -f ".env" ]; then
    source .env
    
    if [ -z "$ABM_TOKEN" ] || [ "$ABM_TOKEN" = "your_secure_abm_token_here" ]; then
        echo "⚠️  ABM_TOKEN not configured. Please set it in .env"
    fi
    
    if [ -z "$ABM_HMAC_SECRET" ] || [ "$ABM_HMAC_SECRET" = "your_hmac_secret_for_webhooks" ]; then
        echo "⚠️  ABM_HMAC_SECRET not configured. Please set it in .env"
    fi
    
    if [ -z "$NEXT_PUBLIC_SITE_URL" ] || [ "$NEXT_PUBLIC_SITE_URL" = "https://your-domain.com" ]; then
        echo "⚠️  NEXT_PUBLIC_SITE_URL not configured. Please set it in .env"
    fi
else
    echo "❌ .env file not found. Please create it from env.abm.example"
fi

echo ""
echo "📦 ABM System Components Deployed:"
echo "=================================="
echo "✅ Prisma schema with ABM models"
echo "✅ ABM Hub dashboard (/abm/hub)"
echo "✅ Account detail pages (/abm/[accountId])"
echo "✅ Executive insights (/abm/insights)"
echo "✅ API endpoints (/api/abm/*)"
echo "✅ n8n workflow templates"
echo "✅ GoHighLevel integration scripts"
echo "✅ ClickUp task templates"
echo "✅ Environment configuration"

echo ""
echo "🚀 Next Steps:"
echo "=============="
echo "1. Configure your .env file with real values"
echo "2. Upgrade Node.js to 22.12.0+ for full functionality"
echo "3. Run: npx prisma generate && npx prisma migrate dev"
echo "4. Run: npm run seed-abm (to create sample data)"
echo "5. Start development: npm run dev"
echo "6. Visit: http://localhost:3000/abm/hub"

echo ""
echo "📚 Documentation:"
echo "================="
echo "- ABM_README.md - Complete system overview"
echo "- ABM_DEPLOYMENT_SUMMARY.md - Deployment summary"
echo "- docs/ABM_QUICK_START_GUIDE.md - Quick start guide"

echo ""
echo "🎉 ABM System Ready for Configuration!"
echo "======================================"
echo ""
echo "Your PROFILER system now has both:"
echo "• Mass lead generation (existing capabilities)"
echo "• High-value account management (new ABM capabilities)"
echo ""
echo "This creates a hybrid system perfect for luxury yacht industry! 🛥️⚓"
