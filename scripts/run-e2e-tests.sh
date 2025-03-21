#!/bin/bash
set -e

echo "🚀 Starting test database..."
npm run test:db:up

echo "⏳ Waiting for database to be ready..."
for i in {1..30}; do
  if docker inspect --format='{{json .State.Health.Status}}' meal-plan-test-db | grep -q "healthy"; then
    echo "✅ Database is ready!"
    break
  fi
  if [ $i -eq 30 ]; then
    echo "❌ Database failed to start within timeout."
    npm run test:db:down
    exit 1
  fi
  echo "⏳ Still waiting for database... ($i/30)"
  sleep 2
done

echo "⏳ Giving the database a moment to fully initialize..."
sleep 5

echo "🧪 Running E2E tests..."
NODE_ENV=test npm run test:e2e:ci -- --runInBand

TEST_EXIT_CODE=$?

echo "🧹 Cleaning up - stopping test database..."
npm run test:db:down

exit $TEST_EXIT_CODE