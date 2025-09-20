#!/bin/bash

echo "🧪 Testing PROFILER Production Deployment"
echo "========================================"
echo ""

# Test 1: Health Check
echo "1. Health Check Test:"
echo "   URL: https://profiler.leadrecon.app/health"
curl -s https://profiler.leadrecon.app/health || echo "   ❌ Health check failed"
echo ""

# Test 2: API Status  
echo "2. API Status Test:"
echo "   URL: https://profiler.leadrecon.app/api/status"
curl -s https://profiler.leadrecon.app/api/status || echo "   ❌ API status failed"
echo ""

# Test 3: Monaco Yacht Demo Test
echo "3. Monaco Yacht Demo Test:"
echo "   URL: https://profiler.leadrecon.app/api/run-event"
curl -s -X POST https://profiler.leadrecon.app/api/run-event \
  -H "Content-Type: application/json" \
  -d '{
    "packet": {
      "eventId": "production-monaco-test",
      "industry": "luxury-marine",
      "client": "Monaco Yacht Solutions",
      "demo": "production-verification"
    }
  }' || echo "   ❌ Demo API failed"
echo ""

echo "✅ Production testing complete!"
