## UI Guidelines
- Ensure UI component uses the tailwind classes
- For the colors, use only tailwind colors gray, red, green, amber
- For title case for Heading, title, labels
- Don't use bg-white. In cases where bg-white is necessary, use bg-gray-0 there.

## Supabase Edge Functions

### JWT Error Resolution
If you encounter `{"code":401,"message":"Invalid JWT"}` when one edge function calls another:

**Problem:** Supabase Edge Functions verify JWT tokens by default at the API gateway level. Internal function-to-function calls fail because the SERVICE_ROLE_KEY is not a valid user JWT.

**Solution:** Deploy the called function with JWT verification disabled:
```bash
npx supabase functions deploy <function-name> --no-verify-jwt
```

**Example:**
When `create-evaluation` calls `run-evaluation` internally, deploy:
```bash
npx supabase functions deploy run-evaluation --no-verify-jwt
```

**Important:** Only disable JWT verification for internal functions that are not directly called by the frontend.