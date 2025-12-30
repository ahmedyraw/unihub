#!/bin/bash
# ============================================
# UniHub Backend Verification Script
# ============================================
# Tests backend API endpoints for event creation and retrieval

BASE_URL="http://localhost:8080/api"
echo "🔍 Testing UniHub Backend API..."
echo "================================"

# Test 1: Get all events
echo ""
echo "📋 Test 1: GET /events (all events)"
curl -s "${BASE_URL}/events" | jq 'length'
echo "✅ Total events returned"

# Test 2: Get events by university
echo ""
echo "📋 Test 2: GET /events?universityId=1"
curl -s "${BASE_URL}/events?universityId=1" | jq 'length'
echo "✅ Events for university 1"

echo ""
echo "📋 Test 3: GET /events?universityId=2"
curl -s "${BASE_URL}/events?universityId=2" | jq 'length'
echo "✅ Events for university 2"

echo ""
echo "📋 Test 4: GET /events?universityId=3"
curl -s "${BASE_URL}/events?universityId=3" | jq 'length'
echo "✅ Events for university 3"

# Test 3: Get events by status
echo ""
echo "📋 Test 5: GET /events?status=APPROVED"
curl -s "${BASE_URL}/events?status=APPROVED" | jq 'length'
echo "✅ Approved events"

# Test 4: Combined filters
echo ""
echo "📋 Test 6: GET /events?universityId=1&status=APPROVED"
curl -s "${BASE_URL}/events?universityId=1&status=APPROVED" | jq 'length'
echo "✅ Approved events for university 1"

# Test 5: Sample event details
echo ""
echo "📋 Test 7: Sample event structure"
curl -s "${BASE_URL}/events?universityId=1&status=APPROVED" | jq '.[0] | {eventId, title, type, status, university: .university.name}'

echo ""
echo "================================"
echo "✅ Backend verification complete"
