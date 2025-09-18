#!/bin/bash

# 🧹 PROFILER Lead Recon - System Purge & Cleanup Script
# Cleans up temporary files, caches, and optimizes the system

set -e

echo "🧹 PROFILER System Purge & Cleanup"
echo "=================================="

# Function to get directory size
get_size() {
    if [ -d "$1" ]; then
        du -sh "$1" 2>/dev/null | cut -f1 || echo "0B"
    else
        echo "0B"
    fi
}

# Function to safely remove directory
safe_remove() {
    if [ -d "$1" ]; then
        local size=$(get_size "$1")
        echo "🗑️  Removing $1 ($size)..."
        rm -rf "$1"
        echo "✅ Removed $1"
    else
        echo "⚪ $1 not found (already clean)"
    fi
}

# Function to safely remove file
safe_remove_file() {
    if [ -f "$1" ]; then
        local size=$(ls -lh "$1" 2>/dev/null | awk '{print $5}' || echo "0B")
        echo "🗑️  Removing $1 ($size)..."
        rm -f "$1"
        echo "✅ Removed $1"
    else
        echo "⚪ $1 not found (already clean)"
    fi
}

echo ""
echo "📊 Current disk usage:"
df -h . | tail -n 1

echo ""
echo "🔍 Analyzing cleanup targets..."

# Check sizes before cleanup
echo "📏 Current sizes:"
echo "   node_modules: $(get_size node_modules)"
echo "   dist: $(get_size dist)"
echo "   coverage: $(get_size coverage)"
echo "   .pnpm cache: $(get_size ~/.pnpm)"
echo "   npm cache: $(get_size ~/.npm)"

echo ""
echo "🧹 Starting cleanup..."

# 1. Remove build artifacts
echo ""
echo "1️⃣  Cleaning build artifacts..."
safe_remove "dist"
safe_remove "build"
safe_remove ".next"
safe_remove ".nuxt"
safe_remove_file ".tsbuildinfo"

# 2. Remove test artifacts
echo ""
echo "2️⃣  Cleaning test artifacts..."
safe_remove "coverage"
safe_remove ".nyc_output"
safe_remove "test-results"
safe_remove "playwright-report"
safe_remove_file "test-results.xml"

# 3. Remove cache directories
echo ""
echo "3️⃣  Cleaning cache directories..."
safe_remove ".cache"
safe_remove ".parcel-cache"
safe_remove ".rpt2_cache"
safe_remove ".rts2_cache_cjs"
safe_remove ".rts2_cache_es"
safe_remove ".rts2_cache_umd"
safe_remove ".eslintcache"

# 4. Remove temporary files
echo ""
echo "4️⃣  Cleaning temporary files..."
safe_remove "tmp"
safe_remove "temp"
find . -name "*.tmp" -type f -delete 2>/dev/null || true
find . -name "*.temp" -type f -delete 2>/dev/null || true
find . -name ".DS_Store" -type f -delete 2>/dev/null || true

# 5. Remove log files
echo ""
echo "5️⃣  Cleaning log files..."
safe_remove "logs"
find . -name "*.log" -type f -delete 2>/dev/null || true
find . -name "npm-debug.log*" -type f -delete 2>/dev/null || true
find . -name "pnpm-debug.log*" -type f -delete 2>/dev/null || true
find . -name "lerna-debug.log*" -type f -delete 2>/dev/null || true

# 6. Clean package manager caches (optional - ask user)
echo ""
echo "6️⃣  Package manager cache cleanup..."
read -p "🤔 Clean package manager caches? This will slow down next install. (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "🧹 Cleaning pnpm cache..."
    pnpm store prune 2>/dev/null || echo "⚠️  pnpm not available"
    
    echo "🧹 Cleaning npm cache..."
    npm cache clean --force 2>/dev/null || echo "⚠️  npm cache clean failed"
    
    # Clean global caches
    echo "🧹 Cleaning global caches..."
    safe_remove "$HOME/.pnpm/.pnpm-store"
    safe_remove "$HOME/.npm/_cacache"
else
    echo "⚪ Skipping package manager cache cleanup"
fi

# 7. Remove node_modules (ask user)
echo ""
echo "7️⃣  Node modules cleanup..."
read -p "🤔 Remove node_modules? You'll need to run 'pnpm install' after. (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    safe_remove "node_modules"
    echo "⚠️  Remember to run 'pnpm install' to restore dependencies"
else
    echo "⚪ Keeping node_modules"
fi

# 8. Clean Docker (if available)
echo ""
echo "8️⃣  Docker cleanup..."
if command -v docker &> /dev/null; then
    read -p "🤔 Clean Docker images and containers? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo "🧹 Cleaning Docker..."
        docker system prune -f 2>/dev/null || echo "⚠️  Docker cleanup failed"
        docker image prune -f 2>/dev/null || echo "⚠️  Docker image cleanup failed"
    else
        echo "⚪ Skipping Docker cleanup"
    fi
else
    echo "⚪ Docker not available"
fi

# 9. Git cleanup
echo ""
echo "9️⃣  Git cleanup..."
if [ -d ".git" ]; then
    echo "🧹 Cleaning git..."
    git gc --prune=now --aggressive 2>/dev/null || echo "⚠️  Git cleanup failed"
    git remote prune origin 2>/dev/null || echo "⚠️  Git remote prune failed"
else
    echo "⚪ Not a git repository"
fi

# Final summary
echo ""
echo "🎉 Cleanup completed!"
echo "==================="

echo ""
echo "📊 Final disk usage:"
df -h . | tail -n 1

echo ""
echo "📏 Final sizes:"
echo "   node_modules: $(get_size node_modules)"
echo "   dist: $(get_size dist)"
echo "   coverage: $(get_size coverage)"

echo ""
echo "🎯 Recommendations:"
if [ ! -d "node_modules" ]; then
    echo "   • Run: pnpm install"
fi
echo "   • Run: pnpm build (if needed)"
echo "   • Run: pnpm test (to verify everything works)"

echo ""
echo "✨ System is now optimized and ready for deployment!"
