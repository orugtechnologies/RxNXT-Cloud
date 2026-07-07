#!/bin/bash
# scripts/validate_deploy.sh

URL=$1
MAX_RETRIES=5
RETRY_COUNT=0

echo "Starting Post-Deployment Smoke Test for $URL"

while [ $RETRY_COUNT -lt $MAX_RETRIES ]; do
  echo "Ping attempt $(($RETRY_COUNT + 1))..."
  
  # Fetch health endpoint, timeout after 5 seconds
  RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" "$URL/api/health" --max-time 5)
  
  if [ "$RESPONSE" = "200" ]; then
    echo "✅ Health check passed! Database is connected and responding."
    exit 0
  fi
  
  echo "⚠️ Health check returned $RESPONSE. Waiting 10 seconds..."
  sleep 10
  RETRY_COUNT=$(($RETRY_COUNT + 1))
done

echo "❌ Deployment Validation Failed: Application or Database is unreachable."
exit 1
