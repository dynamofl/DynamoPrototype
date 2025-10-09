# Quick Deployment Guide

## ✅ Prerequisites Complete
- [x] Supabase CLI installed (v2.48.3)
- [x] `.env` file configured with your Supabase credentials
- [x] Project structure ready

## 🚀 Deploy to Supabase (5 minutes)

Open your terminal and run these commands:

### Step 1: Login to Supabase

```bash
supabase login
```

This will open your browser to authenticate. Once logged in, return to the terminal.

### Step 2: Link Your Project

```bash
cd /Users/pratheepkumarc/Documents/DynamoPrototype
supabase link --project-ref uabbbzzrwgfxiamvnunr
```

Enter your database password when prompted.

### Step 3: Deploy Database Schema

```bash
supabase db push
```

This creates all tables, indexes, RLS policies, and functions.

### Step 4: Deploy Edge Functions

```bash
# Deploy all three functions
supabase functions deploy create-evaluation
supabase functions deploy run-evaluation
supabase functions deploy get-evaluation-status
```

### Step 5: Set API Key Secrets (Optional but Recommended)

If you're using OpenAI or Anthropic:

```bash
# Set OpenAI key
supabase secrets set OPENAI_API_KEY=your-actual-openai-key-here

# Set Anthropic key (if using Claude)
supabase secrets set ANTHROPIC_API_KEY=your-actual-anthropic-key-here
```

### Step 6: Enable Anonymous Authentication

1. Go to https://app.supabase.com/project/uabbbzzrwgfxiamvnunr/auth/providers
2. Scroll to "Email" provider
3. Enable **"Enable anonymous sign-ins"**
4. Click **Save**

### Step 7: Test It!

```bash
# Start your React app
npm run dev
```

Navigate to your app and try creating an evaluation!

## 🎯 Verification

To verify everything is working:

1. **Database Tables**:
   - Go to https://app.supabase.com/project/uabbbzzrwgfxiamvnunr/editor
   - You should see tables: `evaluations`, `evaluation_prompts`, `ai_systems`, `guardrails`, `evaluation_logs`

2. **Edge Functions**:
   - Go to https://app.supabase.com/project/uabbbzzrwgfxiamvnunr/functions
   - You should see 3 functions deployed

3. **Test Evaluation**:
   - Create a new evaluation in your app
   - Refresh the page
   - The evaluation should still be running! ✅

## 🐛 Troubleshooting

### "Access token not provided"
Run `supabase login` again and make sure the browser authentication completes.

### "Database password incorrect"
Get your database password from: https://app.supabase.com/project/uabbbzzrwgfxiamvnunr/settings/database

### "Function deployment failed"
Check function logs:
```bash
supabase functions logs create-evaluation
```

### "Authentication error in app"
1. Check `.env` file has correct `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`
2. Restart your dev server: `npm run dev`
3. Enable anonymous auth (Step 6 above)

## 📚 Next Steps

Once deployed:
- Read [docs/SUPABASE_SETUP.md](docs/SUPABASE_SETUP.md) for detailed configuration
- Check [docs/IMPLEMENTATION_COMPLETE.md](docs/IMPLEMENTATION_COMPLETE.md) for architecture details
- Monitor your evaluations in Supabase Dashboard

## 🎉 Success!

If all steps complete successfully, you now have:
- ✅ Refresh-proof evaluations
- ✅ Real-time progress updates
- ✅ Background processing
- ✅ Multi-user support
- ✅ Full audit trail

Happy evaluating! 🚀
