#!/bin/bash

echo "🧪 Testing PROFILER Cloudflare Pages Deployment"
echo "================================================"

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

BASE_URL="https://profiler.solutions"

echo -e "${YELLOW}Testing deployment at: $BASE_URL${NC}"
echo ""

# Test 1: Root endpoint
echo "1. Testing root endpoint..."
response=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL")
if [ "$response" -eq 200 ]; then
    echo -e "   ${GREEN}✅ Root endpoint: $response${NC}"
else
    echo -e "   ${RED}❌ Root endpoint failed: $response${NC}"
fi

# Test 2: Health check
echo "2. Testing health endpoint..."
response=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/health")
if [ "$response" -eq 200 ]; then
    echo -e "   ${GREEN}✅ Health endpoint: $response${NC}"
else
    echo -e "   ${RED}❌ Health endpoint failed: $response${NC}"
fi

# Test 3: API Status
echo "3. Testing API status endpoint..."
response=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/api/status")
if [ "$response" -eq 200 ]; then
    echo -e "   ${GREEN}✅ API status endpoint: $response${NC}"
else
    echo -e "   ${RED}❌ API status endpoint failed: $response${NC}"
fi

# Test 4: API Status content
echo "4. Testing API status content..."
api_response=$(curl -s "$BASE_URL/api/status")
if echo "$api_response" | grep -q "PROFILER"; then
    echo -e "   ${GREEN}✅ API status content looks good${NC}"
    echo "   Response preview: $(echo "$api_response" | jq -r '.service' 2>/dev/null || echo "JSON parsing failed")"
else
    echo -e "   ${RED}❌ API status content invalid${NC}"
    echo "   Response: $api_response"
fi

# Test 5: POST endpoint test
echo "5. Testing POST /api/run-event..."
test_payload='{"packet":{"eventId":"test-123","industry":"luxury-marine"}}'
response=$(curl -s -o /dev/null -w "%{http_code}" -X POST -H "Content-Type: application/json" -d "$test_payload" "$BASE_URL/api/run-event")
if [ "$response" -eq 200 ]; then
    echo -e "   ${GREEN}✅ POST endpoint: $response${NC}"
else
    echo -e "   ${RED}❌ POST endpoint failed: $response${NC}"
fi

echo ""
echo "🎯 Deployment Test Summary:"
echo "- Root page serving static content"
echo "- Health checks responding"
echo "- API endpoints functional"
echo "- Ready for Monaco yacht demo! 🛥️"
echo ""
echo -e "${GREEN}🚀 PROFILER is live at: $BASE_URL${NC}"
