#!/bin/bash

echo "🚀 Building PROFILER for Cloudflare Pages..."

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Build TypeScript
echo "🔨 Building TypeScript..."
npm run build

# Verify build output
echo "✅ Verifying build output..."
if [ -d "dist" ]; then
    echo "   ✓ dist directory created"
    if [ -f "dist/api/simple-server.js" ]; then
        echo "   ✓ simple-server.js built successfully"
    else
        echo "   ❌ simple-server.js not found"
        exit 1
    fi
else
    echo "   ❌ dist directory not found"
    exit 1
fi

echo "🎯 Build completed successfully!"
echo "📁 Output directory: dist"
echo "🌐 Ready for Cloudflare Pages deployment"
