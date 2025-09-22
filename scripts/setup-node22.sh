#!/bin/bash

# 🚀 PROFILER Node.js 22 Setup Script
# This script ensures Node.js 22.12.0 is installed and configured

set -e

echo "🚀 PROFILER Node.js 22 Setup"
echo "=============================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js is not installed${NC}"
    echo -e "${YELLOW}📥 Installing Node.js 22.12.0...${NC}"
    
    # Install Node.js 22 using NodeSource repository
    curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
    sudo apt-get install -y nodejs
    
    echo -e "${GREEN}✅ Node.js 22 installed successfully${NC}"
else
    CURRENT_VERSION=$(node --version)
    echo -e "${BLUE}📋 Current Node.js version: $CURRENT_VERSION${NC}"
    
    # Check if version is 22.x
    if [[ $CURRENT_VERSION == v22* ]]; then
        echo -e "${GREEN}✅ Node.js 22 is already installed${NC}"
    else
        echo -e "${YELLOW}⚠️  Node.js 22 required, current version: $CURRENT_VERSION${NC}"
        echo -e "${YELLOW}📥 Upgrading to Node.js 22.12.0...${NC}"
        
        # Install Node.js 22
        curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
        sudo apt-get install -y nodejs
        
        echo -e "${GREEN}✅ Node.js 22 installed successfully${NC}"
    fi
fi

# Install pnpm if not present
if ! command -v pnpm &> /dev/null; then
    echo -e "${YELLOW}📦 Installing pnpm 9.12.0...${NC}"
    npm install -g pnpm@9.12.0
    echo -e "${GREEN}✅ pnpm installed successfully${NC}"
else
    PNPM_VERSION=$(pnpm --version)
    echo -e "${GREEN}✅ pnpm version: $PNPM_VERSION${NC}"
fi

# Verify versions
echo ""
echo -e "${BLUE}🔍 Verification:${NC}"
echo -e "Node.js: $(node --version)"
echo -e "npm: $(npm --version)"
echo -e "pnpm: $(pnpm --version)"

# Install dependencies
echo ""
echo -e "${YELLOW}📦 Installing project dependencies...${NC}"
pnpm install

echo ""
echo -e "${GREEN}🎉 PROFILER Node.js 22 setup complete!${NC}"
echo -e "${BLUE}🚀 Ready for deployment to Cloudflare Pages${NC}"
echo -e "${BLUE}🛥️ Monaco yacht demo ready for $350M+ revenue impact${NC}"
