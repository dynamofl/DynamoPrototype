# Supabase Setup Guide

This guide will walk you through setting up the Supabase backend for the AI Evaluation System.

## Prerequisites

- Node.js 18+ installed
- Supabase account (sign up at [supabase.com](https://supabase.com))
- Supabase CLI installed: `npm install -g supabase`

## Step 1: Create Supabase Project

1. Go to [https://app.supabase.com](https://app.supabase.com)
2. Click "New Project"
3. Fill in project details:
   - **Name**: `ai-evaluation-system` (or your preferred name)
   - **Database Password**: Choose a strong password (save it!)
   - **Region**: Choose closest to your users
4. Click "Create new project"
5. Wait for project to be provisioned (~2 minutes)

## Step 2: Get Project Credentials

1. In your project dashboard, go to **Settings** → **API**
2. Copy the following values:
   - **Project URL**: `https://xxxxxxxxxxxxx.supabase.co`
   - **anon/public key**: `eyJhbGc...` (long JWT token)
   - **service_role key**: `eyJhbGc...` (different long JWT token)

3. Create a `.env` file in your project root:

```bash
cp .env.example .env
```

4. Fill in the values in `.env`:

```env
VITE_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

## Step 3: Link Local Project to Supabase

```bash
# Login to Supabase CLI
supabase login

# Link your project
supabase link --project-ref your-project-ref
```

**Note**: Your project ref is the part before `.supabase.co` in your Project URL.

## Step 4: Run Database Migrations

```bash
# Push migrations to Supabase
supabase db push
```

This will create all the necessary tables, indexes, RLS policies, and functions.

## Step 5: Deploy Edge Functions

```bash
# Deploy all edge functions
supabase functions deploy create-evaluation
supabase functions deploy run-evaluation
supabase functions deploy get-evaluation-status
```

### Set Edge Function Secrets

Edge Functions need access to AI API keys:

```bash
# Set OpenAI API key (if using OpenAI models)
supabase secrets set OPENAI_API_KEY=sk-...

# Set Anthropic API key (if using Anthropic models)
supabase secrets set ANTHROPIC_API_KEY=sk-ant-...
```

## Step 6: Enable Anonymous Authentication (Optional)

For development/testing without user accounts:

1. Go to **Authentication** → **Providers**
2. Scroll to **Email**
3. Enable **"Enable anonymous sign-ins"**
4. Click **Save**

For production, you'll want to set up proper authentication:
- Email/Password
- OAuth (Google, GitHub, etc.)
- Magic Links

## Step 7: Test the Setup

### Test Database Connection

```bash
# Start local Supabase (optional, for local development)
supabase start

# Or test against your cloud project
npm run dev
```

### Test Edge Function

```bash
curl -X POST \
  'https://xxxxxxxxxxxxx.supabase.co/functions/v1/create-evaluation' \
  -H 'Authorization: Bearer YOUR_ANON_KEY' \
  -H 'Content-Type: application/json' \
  -d '{
    "name": "Test Evaluation",
    "aiSystemId": "test-id",
    "evaluationType": "jailbreak",
    "policyIds": [],
    "guardrailIds": []
  }'
```

## Step 8: Migrate Existing Data (Optional)

If you have existing data in localStorage, run the migration script:

```bash
npm run migrate-to-supabase
```

This will:
1. Extract data from localStorage
2. Create corresponding records in Supabase
3. Preserve all relationships
4. Log migration results

## Step 9: Update Frontend Dependencies

Install Supabase client library:

```bash
npm install @supabase/supabase-js
```

## Architecture Overview

### Database Tables

- **`evaluations`**: Main evaluation records
- **`evaluation_prompts`**: Individual prompts and results
- **`ai_systems`**: AI system configurations
- **`guardrails`**: Guardrail configurations
- **`evaluation_logs`**: Debug and audit logs

### Edge Functions

- **`create-evaluation`**: Initialize evaluations
- **`run-evaluation`**: Execute evaluations (recursive for long runs)
- **`get-evaluation-status`**: Fetch current progress

### Real-time Updates

Evaluations automatically broadcast progress updates via Supabase Realtime.

## Development Workflow

### Local Development

```bash
# Start local Supabase instance
supabase start

# This starts:
# - PostgreSQL database (port 54322)
# - Kong API Gateway (port 54321)
# - Studio UI (port 54323)

# Run your React app
npm run dev
```

### Deploy to Production

```bash
# Push database changes
supabase db push

# Deploy functions
supabase functions deploy

# Your React app deployment (Vercel/Netlify/etc.)
npm run build
# Deploy build/ folder to your hosting platform
```

## Troubleshooting

### Edge Function Timeouts

**Problem**: Evaluations with many prompts timeout

**Solution**: The `run-evaluation` function uses recursive invocation to process prompts in batches. Adjust `BATCH_SIZE` in the function if needed.

### Authentication Errors

**Problem**: "Invalid authorization token"

**Solution**:
1. Check that `.env` has correct `VITE_SUPABASE_ANON_KEY`
2. Ensure anonymous auth is enabled (or implement proper auth)
3. Check browser console for detailed error messages

### RLS Policy Denials

**Problem**: "permission denied for table evaluations"

**Solution**:
1. Check that user is authenticated
2. Verify RLS policies in Supabase Dashboard → Authentication → Policies
3. For development, you can temporarily disable RLS (not recommended for production)

### Function Deployment Fails

**Problem**: "Failed to deploy function"

**Solution**:
1. Check function logs: `supabase functions logs`
2. Verify all imports are using Deno-compatible URLs (https://esm.sh/ or https://deno.land/)
3. Check for TypeScript errors

## Monitoring

### View Logs

```bash
# Edge Function logs
supabase functions logs create-evaluation
supabase functions logs run-evaluation

# Database logs
supabase db logs
```

### View in Dashboard

1. **Database**: [Tables & Data](https://app.supabase.com/project/_/editor)
2. **Edge Functions**: [Functions](https://app.supabase.com/project/_/functions)
3. **Logs**: [Logs Explorer](https://app.supabase.com/project/_/logs/explorer)
4. **Real-time**: [Realtime Inspector](https://app.supabase.com/project/_/realtime/inspector)

## Cost Optimization

### Free Tier Limits

- **Database**: 500 MB storage
- **Edge Functions**: 500K requests/month
- **Realtime**: Unlimited connections
- **Bandwidth**: 5 GB/month

### Optimize Usage

1. **Batch Processing**: Adjust `BATCH_SIZE` to balance speed vs. function invocations
2. **Cleanup**: Delete old evaluations periodically
3. **Indexes**: Already optimized in migrations
4. **Connection Pooling**: Enabled by default

## Security Best Practices

1. **Never commit** `.env` file
2. **Use Supabase Vault** for API keys in production
3. **Enable RLS** on all tables (already done in migrations)
4. **Rotate keys** periodically
5. **Use HTTPS** only
6. **Validate inputs** in Edge Functions (already implemented)

## Support

- **Supabase Docs**: https://supabase.com/docs
- **Supabase Discord**: https://discord.supabase.com
- **Project Issues**: https://github.com/your-repo/issues

## Next Steps

1. ✅ Set up Supabase project
2. ✅ Deploy database and functions
3. ✅ Configure environment variables
4. 🔲 Test evaluation creation
5. 🔲 Migrate existing data
6. 🔲 Set up monitoring
7. 🔲 Deploy to production
