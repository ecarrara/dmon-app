#!/bin/sh
set -e

echo "🔄 Running database migrations..."
cd /app
mkdir -p data
bun --bun run drizzle-kit migrate

echo "✅ Migrations completed successfully"
echo "🚀 Starting application..."

# Start the Next.js application
exec bun --bun ./server.js
