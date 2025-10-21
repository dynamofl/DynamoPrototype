# Dynamic Provider Statistics in Settings Page

This document explains how the Access Token & API Keys table in the Settings page now updates dynamically from the Supabase backend.

---

## Overview

The Access Token table now displays **real-time data** from the Supabase database:
- ✅ **Available API Keys**: Count of active API keys per provider from `api_keys` table
- ✅ **AI System Usage**: Count of **connected** AI systems (`config.status = 'connected'`) for each provider
- ✅ **Last Updated On**: Most recent timestamp (last_used_at, updated_at, or created_at) per provider

Previously, this table used static data from `access-token-config.tsx`. Now it dynamically queries Supabase on every page load and refresh.

---

## Implementation

### 1. Provider Statistics Service

**File**: `src/features/settings/layouts/access-token/lib/provider-statistics-service.ts`

This service handles all dynamic data fetching from Supabase.

#### Key Functions

**`fetchProviderStatistics()`**
- Main function that fetches all statistics
- Returns array of `ProviderStatistics` for all supported providers
- Combines data from API keys and AI systems tables

**`fetchAPIKeyStatistics()`** (Internal)
- Queries `api_keys` table
- Groups by provider
- Counts active API keys
- Tracks most recent timestamp

**`fetchAISystemStatistics()`** (Internal)
- Queries `ai_systems` table with `config` column
- **Filters** to only count systems where `config.status = 'connected'`
- Groups by provider (with normalization)
- Counts only **connected** AI systems per provider

#### Supported Providers

```typescript
const SUPPORTED_PROVIDERS = [
  { id: 'openai', displayName: 'OpenAI' },
  { id: 'azure', displayName: 'Azure OpenAI' },
  { id: 'anthropic', displayName: 'Anthropic' },
  { id: 'mistral', displayName: 'Mistral' },
  { id: 'databricks', displayName: 'Databricks' },
  { id: 'aws', displayName: 'AWS Bedrock' },
  { id: 'huggingface', displayName: 'Hugging Face' },
  { id: 'gemini', displayName: 'Gemini' }
]
```

#### Data Flow

```
┌─────────────────────────────────────────────────────────┐
│  fetchProviderStatistics()                              │
│                                                          │
│  ┌────────────────────────┐  ┌─────────────────────────┐│
│  │ fetchAPIKeyStatistics()│  │ fetchAISystemStatistics()││
│  │                        │  │                          ││
│  │ Query: api_keys        │  │ Query: ai_systems        ││
│  │ Filter: status=active  │  │ Select: provider         ││
│  │ Select: provider,      │  │                          ││
│  │         last_used_at,  │  │ Group by: provider       ││
│  │         created_at,    │  │ Count: systems           ││
│  │         updated_at     │  │                          ││
│  │                        │  │                          ││
│  │ Group by: provider     │  │                          ││
│  │ Count: keys            │  │                          ││
│  │ Max: timestamp         │  │                          ││
│  └────────────────────────┘  └─────────────────────────┘│
│              │                          │                │
│              └──────────┬───────────────┘                │
│                         ▼                                │
│              Combine data for each provider             │
│              Return ProviderStatistics[]                │
└─────────────────────────────────────────────────────────┘
```

---

### 2. Access Token Table Component

**File**: `src/features/settings/layouts/access-token/components/access-token-table.tsx`

#### Changes

**Before** (Using Static Data):
```typescript
const loadData = async () => {
  setIsLoading(true)
  const storage = new AccessTokenStorage()
  const providers = await storage.load()
  setData(providers as AccessTokenData[])
  setIsLoading(false)
}
```

**After** (Using Dynamic Data):
```typescript
const loadData = async () => {
  setIsLoading(true)
  try {
    console.log('[AccessTokenTable] Fetching provider statistics...')
    const statistics = await fetchProviderStatistics()

    // Add unique IDs for table rows
    const dataWithIds = statistics.map((stat, index) => ({
      id: `provider-${index}`,
      ...stat
    }))

    console.log('[AccessTokenTable] Statistics loaded:', dataWithIds)
    setData(dataWithIds)
  } catch (error) {
    console.error('[AccessTokenTable] Failed to load provider statistics:', error)
    setData([])
  } finally {
    setIsLoading(false)
  }
}
```

#### Refresh Trigger

The component accepts a `refreshTrigger` prop that can be incremented to force a refresh:

```typescript
// In parent component (access-token-content.tsx)
const [refreshTrigger, setRefreshTrigger] = useState(0)

// After API key creation/deletion
setRefreshTrigger(prev => prev + 1)

// Pass to table
<AccessTokenTable refreshTrigger={refreshTrigger} />
```

---

## Data Schema

### ProviderStatistics Interface

```typescript
export interface ProviderStatistics {
  provider: string        // Display name (e.g., "OpenAI")
  availableKeys: number   // Count of active API keys
  aiSystemUsage: number   // Count of AI systems using this provider
  lastUpdated: string     // "MMM DD, YYYY" or "-"
  hasKeys: boolean        // true if availableKeys > 0
}
```

### Database Queries

#### API Keys Query
```sql
SELECT provider, last_used_at, created_at, updated_at
FROM api_keys
WHERE status = 'active'
```

Grouped by provider to count keys and find max timestamp.

#### AI Systems Query
```sql
SELECT provider, config
FROM ai_systems
```

Filtered to include only systems where `config->>'status' = 'connected'`, then grouped by provider (with normalization) to count connected systems.

---

## Provider Name Normalization

The service handles provider name variations automatically:

```typescript
// AI System provider format: "Mistral AI", "mistral ai", "MISTRAL"
// Database format: "mistral"

const normalizedProvider = provider
  .replace(/\s+ai$/i, '')  // Remove " AI" suffix
  .replace(/\s+/g, '')     // Remove all spaces
  .toLowerCase()           // Convert to lowercase
```

**Examples:**
- "Mistral AI" → "mistral"
- "OpenAI" → "openai"
- "Azure OpenAI" → "azureopenai" → mapped to "azure"

---

## Performance Considerations

### Parallel Queries
API key and AI system statistics are fetched in parallel using `Promise.all()`:

```typescript
const [apiKeysData, aiSystemsData] = await Promise.all([
  fetchAPIKeyStatistics(),
  fetchAISystemStatistics()
])
```

### Efficient Grouping
Data is grouped client-side after fetching to minimize database queries.

### Caching Strategy
Currently loads on every mount/refresh. Future improvements could include:
- React Query for caching
- Periodic background refresh
- Real-time subscriptions via Supabase Realtime

---

## Real-Time Updates (Future Enhancement)

To enable real-time updates without manual refresh:

### Option 1: Supabase Realtime Subscriptions

```typescript
useEffect(() => {
  // Subscribe to api_keys changes
  const apiKeysSubscription = supabase
    .channel('api_keys_changes')
    .on('postgres_changes',
      { event: '*', schema: 'public', table: 'api_keys' },
      () => {
        // Reload statistics when API keys change
        loadData()
      }
    )
    .subscribe()

  // Subscribe to ai_systems changes
  const aiSystemsSubscription = supabase
    .channel('ai_systems_changes')
    .on('postgres_changes',
      { event: '*', schema: 'public', table: 'ai_systems' },
      () => {
        // Reload statistics when AI systems change
        loadData()
      }
    )
    .subscribe()

  return () => {
    apiKeysSubscription.unsubscribe()
    aiSystemsSubscription.unsubscribe()
  }
}, [])
```

### Option 2: React Query with Polling

```typescript
import { useQuery } from '@tanstack/react-query'

const { data, isLoading } = useQuery({
  queryKey: ['providerStatistics'],
  queryFn: fetchProviderStatistics,
  refetchInterval: 30000, // Refresh every 30 seconds
  staleTime: 10000        // Consider data stale after 10 seconds
})
```

### Option 3: Event-Based Refresh

Listen to custom events when API keys are created/deleted:

```typescript
// After API key creation
window.dispatchEvent(new CustomEvent('apiKeyUpdated'))

// In table component
useEffect(() => {
  const handleUpdate = () => loadData()
  window.addEventListener('apiKeyUpdated', handleUpdate)
  return () => window.removeEventListener('apiKeyUpdated', handleUpdate)
}, [])
```

---

## Testing the Implementation

### 1. Verify Data Loading

Open browser console and navigate to Settings → Access Tokens:

```
[AccessTokenTable] Fetching provider statistics...
[Provider Stats] Fetching statistics from Supabase...
[Provider Stats] Found API keys: 3
[Provider Stats] Found AI systems: 5
[Provider Stats] API Keys data: [...]
[Provider Stats] AI Systems data: [...]
[AccessTokenTable] Statistics loaded: [...]
```

### 2. Test API Key Creation

1. Click "Add New Key" for a provider
2. Create an API key
3. Table should auto-refresh (via `refreshTrigger`)
4. "Available API Keys" count should increment
5. "Last Updated On" should show current date

### 3. Test AI System Usage

**Scenario A: Connected AI System**
1. Go to AI Systems page
2. Create a new AI system with a provider
3. Set status to **"Connected"** (config.status = 'connected')
4. Return to Settings → Access Tokens
5. Manually refresh the page
6. "AI System Usage" count should increment ✅

**Scenario B: Disconnected AI System**
1. Go to AI Systems page
2. Create a new AI system with a provider
3. Set status to **"Disconnected"** (config.status = 'disconnected')
4. Return to Settings → Access Tokens
5. Manually refresh the page
6. "AI System Usage" count should NOT increment ✅ (only connected systems are counted)

### 4. Test Last Updated Timestamp

The service prioritizes timestamps in this order:
1. `last_used_at` (when API key was last used)
2. `updated_at` (when API key was last modified)
3. `created_at` (when API key was created)

To test:
- Create new API key → Should show today's date
- Use API key in evaluation → Should update to most recent usage
- Delete all keys for provider → Should show "-"

---

## Migration Notes

### What Changed

**Removed:**
- Static data from `access-token-config.tsx`
- `AccessTokenStorage.load()` logic for calculating statistics
- localStorage dependency for statistics

**Added:**
- `provider-statistics-service.ts` for dynamic fetching
- Direct Supabase queries
- Better error handling

### Backward Compatibility

The `AccessTokenStorage` class is still used for:
- ~~Managing API keys~~ (now handled by `SecureAPIKeyService`)
- Table row operations (add/update/delete)

However, the statistics calculation has been moved to the new service.

### Data Consistency

**Important**: Ensure all API keys are stored in Supabase `api_keys` table, not just localStorage. The migration should have already handled this via `migrate-keys-to-vault.ts`.

To verify:
```sql
SELECT provider, COUNT(*) as count
FROM api_keys
WHERE status = 'active'
GROUP BY provider;
```

---

## Debugging

### Console Logs

The service includes detailed console logs with `[Provider Stats]` prefix:

```typescript
console.log('[Provider Stats] Fetching statistics from Supabase...')
console.log('[Provider Stats] Found API keys:', apiKeys.length)
console.log('[Provider Stats] API Keys data:', apiKeysData)
console.log('[Provider Stats] Final statistics:', statistics)
```

### Common Issues

**Issue**: "Available API Keys" shows 0 but you have keys
- **Check**: Are keys in Supabase `api_keys` table?
- **Check**: Are keys marked as `status = 'active'`?
- **Fix**: Run migration script to move localStorage keys to Supabase

**Issue**: "AI System Usage" shows wrong count
- **Check**: Provider name normalization in AI systems
- **Check**: Console logs for provider name mapping
- **Fix**: Ensure AI system `provider` field uses correct format

**Issue**: "Last Updated On" shows "-" for all providers
- **Check**: Do API keys have `created_at` timestamp?
- **Check**: Supabase column permissions (RLS policies)
- **Fix**: Ensure timestamps are properly stored

---

## Future Enhancements

### 1. Add "Last Used By" Column
Show which AI system last used each provider's API key

### 2. Add Usage Metrics
- Total API calls per provider
- Total tokens consumed
- Average response time

### 3. Add Cost Tracking
- Estimated cost per provider
- Budget alerts

### 4. Add Status Indicators
- Green: All keys active and valid
- Yellow: Keys expiring soon
- Red: Keys failed validation or expired

### 5. Add Filtering/Sorting
- Sort by usage count
- Filter by "has keys" vs "no keys"
- Search by provider name

---

## Related Files

### Frontend
- `src/features/settings/layouts/access-token/lib/provider-statistics-service.ts` - Statistics service
- `src/features/settings/layouts/access-token/components/access-token-table.tsx` - Table component
- `src/features/settings/layouts/access-token/access-token-content.tsx` - Parent component
- `src/lib/supabase/secure-api-key-service.ts` - API key management

### Database
- `supabase/migrations/20250104000005_create_api_keys_table.sql` - API keys schema
- Schema for `ai_systems` table

### Types
- `src/features/settings/layouts/access-token/lib/provider-statistics-service.ts` - `ProviderStatistics` interface

---

## Summary

The Access Token table now provides **dynamic, real-time statistics** from Supabase:

✅ **Benefits**:
- Always shows accurate, up-to-date data
- No manual updates needed
- Centralized data source (Supabase)
- Better error handling
- Easier to extend with new metrics

✅ **Performance**:
- Parallel queries for speed
- Client-side grouping reduces DB load
- Efficient data fetching

✅ **Maintainability**:
- Single source of truth (Supabase)
- Clear separation of concerns
- Well-documented code
- Comprehensive logging

---

**Last Updated**: January 2025
**Version**: 1.0
