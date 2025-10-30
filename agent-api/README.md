# Insight Agent API

FastAPI backend for the Insight Agent using OpenAI Agents SDK with MCP tools.

## Features

- ✅ **OpenAI Agents SDK** - Proper agent implementation with reasoning
- ✅ **MCP Integration** - Direct Supabase database access via MCP tools
- ✅ **FastAPI** - High-performance Python API
- ✅ **CORS Enabled** - Works with your frontend

## Setup

### 1. Install Python Dependencies

```bash
cd agent-api
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### 2. Configure Environment Variables

Copy `.env.example` to `.env` and fill in your keys:

```bash
cp .env.example .env
```

Edit `.env` with your actual keys:
- `OPENAI_API_KEY`: Your OpenAI API key
- `SUPABASE_SERVICE_ROLE_KEY`: Get from Supabase Dashboard → Settings → API → service_role key

### 3. Run the API

```bash
python main.py
```

Or use uvicorn directly:

```bash
uvicorn main:app --reload --port 8000
```

The API will be available at: `http://localhost:8000`

## API Endpoints

### `GET /health`

Health check endpoint.

**Response:**
```json
{
  "status": "healthy",
  "service": "insight-agent-api"
}
```

### `POST /api/insight`

Get AI-powered insights from evaluation data.

**Request Body:**
```json
{
  "message": "What are the top 5 evaluations with highest attack success rate?",
  "evaluationId": "optional-evaluation-id"
}
```

**Response:**
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

1. **Receives query** from frontend
2. **Creates agent** with MCP tools configured
3. **Agent uses execute_sql** to query Supabase database
4. **Formats response** as text, table, or chart
5. **Returns structured data** to frontend

## Development

```bash
# Run with auto-reload
uvicorn main:app --reload

# Run on different port
uvicorn main:app --port 8001

# Run with debug logging
uvicorn main:app --reload --log-level debug
```

## Testing

```bash
# Test health endpoint
curl http://localhost:8000/health

# Test insight endpoint
curl -X POST http://localhost:8000/api/insight \
  -H "Content-Type: application/json" \
  -d '{"message": "Show me all evaluations"}'
```

## Frontend Integration

Update `src/lib/agents/insight-agent-service.ts` to point to this API:

```typescript
const response = await fetch('http://localhost:8000/api/insight', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ message, evaluationId })
});
```

## Deployment

For production, deploy this FastAPI app to:
- **Railway** - Easy Python deployment
- **Render** - Free tier available
- **Fly.io** - Global edge deployment
- **AWS Lambda** - Serverless option with Mangum

## Troubleshooting

### `ImportError: No module named 'openai_agents'`
```bash
pip install --upgrade openai-agents
```

### MCP Authorization Error
Make sure your `SUPABASE_SERVICE_ROLE_KEY` is correct (not the anon key!).

### CORS Error
Add your frontend URL to the `allow_origins` list in `main.py`.
