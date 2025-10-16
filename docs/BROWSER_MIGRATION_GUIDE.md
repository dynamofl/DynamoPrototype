# Browser-Based Migration Guide

## Quick Start: Run Migration in Browser

You can now run the summary metrics migration directly from your browser! No need for command-line tools or environment variables.

### How to Access

1. **Navigate to Settings**
   - Click on the settings icon or go to `/settings`

2. **Go to Data Migration**
   - In the sidebar, under **Maintenance** section
   - Click on **Data Migration**

3. **Run Migration**
   - Click the **"Run Migration"** button
   - Watch the progress in real-time
   - View detailed logs for each evaluation

### Features

✅ **Real-time Progress Tracking**
- See total, migrated, skipped, and error counts
- Progress bar showing completion percentage
- Live log of each evaluation being processed

✅ **Safe to Run Multiple Times**
- Automatically skips already-migrated evaluations
- Shows "Already migrated, skipping" for existing data
- No risk of duplicate or corrupted data

✅ **Detailed Logging**
- Success messages with guardrail counts
- Warning messages for evaluations with no prompts
- Error messages with specific details
- Easy-to-read color-coded log entries

✅ **No Setup Required**
- Works directly in the browser
- Uses your existing Supabase session
- No environment variables needed
- No command-line tools required

### What the Migration Does

The migration updates the `summary_metrics` field in your evaluations to include:

**Before Migration:**
```json
{
  "totalTests": 50,
  "successRate": 2,
  "aiSystemOnlySuccessRate": 90,
  ...
}
```

**After Migration:**
```json
{
  "aiSystem": {
    "totalTests": 50,
    "successRate": 2,
    "aiSystemOnlySuccessRate": 90,
    ...
  },
  "guardrails": [
    {
      "id": "gr-123",
      "name": "Profanity Filter",
      "guardrailOnlySuccessRate": 80,
      ...
    }
  ],
  // Legacy fields preserved
  "totalTests": 50,
  ...
}
```

### Migration Results

After migration completes, you'll see a summary:

- **Migrated**: Evaluations successfully updated with new structure
- **Skipped**: Evaluations already migrated (has `aiSystem` structure)
- **Errors**: Evaluations that failed (check logs for details)

### Troubleshooting

**"No completed evaluations found"**
- No evaluations with status='completed' in database
- Run at least one evaluation first

**"No completed prompts found, skipping"**
- Evaluation exists but has no completed prompt results
- This is normal for evaluations that failed or were cancelled

**Migration shows errors**
- Check the detailed log for specific error messages
- Common causes:
  - Network connection issues
  - Supabase session expired (refresh page and try again)
  - Database permission issues

### When to Run Migration

Run the migration if:
- ✅ You have existing completed evaluations
- ✅ You want per-guardrail metrics for past evaluations
- ✅ You're upgrading from an older version of the app

You don't need to run migration if:
- ❌ All your evaluations are new (created after this update)
- ❌ You've already run the migration successfully
- ❌ You don't have any completed evaluations

### New Evaluations

**Important:** New evaluations created after this update automatically include per-guardrail metrics. You don't need to migrate them!

The migration is only for **existing** evaluations that were created before this feature was added.

### Comparison: Browser vs Command Line

| Feature | Browser Migration | Command Line |
|---------|------------------|--------------|
| Setup | None required | Need env variables |
| Progress | Real-time UI | Console logs |
| Logs | Formatted in UI | Plain text |
| Authentication | Uses your session | Need service key |
| Convenience | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ |

**Recommendation:** Use the browser migration for most cases. It's easier and safer!

### Command Line Alternative

If you prefer command-line tools or need to run migration in CI/CD:

```bash
# Set environment variables
export SUPABASE_URL="https://your-project.supabase.co"
export SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"

# Run migration script
npx tsx scripts/migrate-guardrail-summary-metrics.ts
```

See [SUMMARY_METRICS_MIGRATION.md](./SUMMARY_METRICS_MIGRATION.md) for full details.

## Support

If you encounter issues:
1. Check the detailed log in the migration UI
2. Refresh the page and try again
3. Check browser console for JavaScript errors
4. Verify your Supabase connection is working

## Screenshots

### Settings Navigation
Navigate to Settings → Data Migration

### Migration Interface
- See stats cards showing Total, Migrated, Skipped, Errors
- Progress bar updates in real-time
- Click "Run Migration" to start
- View detailed logs as migration runs

### Successful Migration
- Green success messages for each evaluation
- Shows number of guardrails tracked
- Final summary with totals

---

**That's it!** Running the migration is now as simple as clicking a button. 🎉
