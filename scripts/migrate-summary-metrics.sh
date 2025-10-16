#!/bin/bash

# Migration script to update summary_metrics with per-guardrail breakdown
# Usage: ./scripts/migrate-summary-metrics.sh

set -e  # Exit on error

echo "🔧 Summary Metrics Migration Script"
echo "===================================="
echo ""

# Check if required environment variables are set
if [ -z "$SUPABASE_URL" ]; then
  echo "❌ Error: SUPABASE_URL environment variable is not set"
  echo ""
  echo "Please set it with:"
  echo "  export SUPABASE_URL='https://your-project.supabase.co'"
  exit 1
fi

if [ -z "$SUPABASE_SERVICE_ROLE_KEY" ]; then
  echo "❌ Error: SUPABASE_SERVICE_ROLE_KEY environment variable is not set"
  echo ""
  echo "Please set it with:"
  echo "  export SUPABASE_SERVICE_ROLE_KEY='your-service-role-key'"
  exit 1
fi

echo "✅ Environment variables configured"
echo "   SUPABASE_URL: $SUPABASE_URL"
echo ""

# Confirm before proceeding
echo "⚠️  WARNING: This will update summary_metrics for all completed evaluations"
echo ""
read -p "Do you want to proceed? (yes/no): " confirm

if [ "$confirm" != "yes" ]; then
  echo "❌ Migration cancelled"
  exit 0
fi

echo ""
echo "🚀 Starting migration..."
echo ""

# Run the TypeScript migration script
npx tsx scripts/migrate-guardrail-summary-metrics.ts

echo ""
echo "✅ Migration complete!"
