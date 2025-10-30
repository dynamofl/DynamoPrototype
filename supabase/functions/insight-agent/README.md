# Insight Agent Edge Function

This Supabase Edge Function provides AI-powered insights from evaluation data using OpenAI's API.

## Features

- 🔒 **Secure**: API key stored server-side (never exposed to browser)
- 🎯 **Smart Queries**: Analyzes user questions and fetches relevant data
- 📊 **Structured Responses**: Returns text, tables, or charts based on query
- 🚀 **Fast**: Direct database access with optimized queries

## Setup

### Local Development

1. **Set up environment variables**:
   - The API key is already in `.env.local` (not tracked in git)
   - Or create/update `.env.local`:
     ```bash
     OPENAI_API_KEY=your-openai-api-key-here
     ```

2. **Serve the function locally**:
   ```bash
   supabase functions serve insight-agent --env-file .env.local
   ```

3. **Test it**:
   ```bash
   curl -X POST 'http://localhost:54321/functions/v1/insight-agent' \
     -H 'Authorization: Bearer YOUR_ANON_KEY' \
     -H 'Content-Type: application/json' \
     -d '{"message": "What are the top 5 evaluations with highest attack success rate?"}'
   ```

### Production Deployment

1. **Set the OpenAI API key as a Supabase secret**:
   ```bash
   supabase secrets set OPENAI_API_KEY=your-openai-api-key-here
   ```

2. **Deploy the function**:
   ```bash
   supabase functions deploy insight-agent
   ```

3. **Verify deployment**:
   ```bash
   supabase functions list
   ```

## Usage

The function is automatically called by the frontend chat composer on the evaluation summary page.

### Request Format

```json
{
  "message": "What are the top 5 evaluations?",
  "evaluationId": "optional-evaluation-id"
}
```

### Response Format

```json
{
  "success": true,
  "output_text": "...",
  "output_parsed": {
    "title": "Top 5 Evaluations",
    "type": "table",
    "data": "..."
  }
}
```

## How It Works

1. **Analyzes** the user's question
2. **Queries** the Supabase database (compliance_prompts, jailbreak_prompts)
3. **Formats** the data using OpenAI
4. **Returns** structured response (text/table/chart)

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `SUPABASE_URL` | Supabase project URL | Yes (auto-set) |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role key | Yes (auto-set) |
| `OPENAI_API_KEY` | OpenAI API key | Yes (set manually) |

## Example Queries

- "What are the top 5 evaluations with highest attack success rate?"
- "Show me all compliance prompts"
- "What attack types are most successful?"
- "List all policies that were violated"
