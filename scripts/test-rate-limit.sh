#!/bin/bash

# Test de Rate Limiting
# Uso: bash scripts/test-rate-limit.sh

echo "🧪 Testing Rate Limiting..."
echo "Endpoint: http://localhost:3000/api/recursos"
echo "Expected: 60 requests OK, then 429 Too Many Requests"
echo ""

SUCCESS=0
RATE_LIMITED=0

for i in {1..70}; do
  RESPONSE=$(curl -s -w "\n%{http_code}" http://localhost:3000/api/recursos)
  STATUS=$(echo "$RESPONSE" | tail -n1)
  
  if [ "$STATUS" = "200" ]; then
    SUCCESS=$((SUCCESS + 1))
    echo "[$i] ✅ 200 OK (remaining: $((60 - SUCCESS)))"
  elif [ "$STATUS" = "429" ]; then
    RATE_LIMITED=$((RATE_LIMITED + 1))
    echo "[$i] 🚫 429 RATE LIMITED"
  else
    echo "[$i] ⚠️  Unexpected status: $STATUS"
  fi
  
  # Pequeña pausa para no saturar
  sleep 0.05
done

echo ""
echo "📊 Results:"
echo "  ✅ Successful: $SUCCESS"
echo "  🚫 Rate Limited: $RATE_LIMITED"
echo ""

if [ $RATE_LIMITED -gt 0 ]; then
  echo "✅ Rate limiting is WORKING!"
else
  echo "⚠️  Rate limiting might not be configured correctly"
fi
