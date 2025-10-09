# UUID Fix Guide

## Problem

The application was generating invalid UUIDs that looked like: `00000000-0000-4000-8000-000051999194`

This was caused by a flawed `generateUUIDFromString()` function that:
1. Created a 32-bit hash from the input string
2. Padded it with zeros to 32 characters (causing the `00000000` prefix)
3. Left timestamp remnants at the end

These invalid UUIDs caused errors when creating evaluations in Supabase:
```
Error: Failed to create evaluation: invalid input syntax for type uuid: "1759343861102"
```

## What Was Fixed

### 1. Local Storage UUID Generation

**Files Updated:**
- [ai-systems-storage.ts](../src/features/ai-systems/lib/ai-systems-storage.ts#L19)
- [ai-systems-config.ts](../src/features/ai-systems/lib/ai-systems-config.ts#L56)
- [ai-systems-config.ts](../src/features/ai-systems/lib/ai-systems-config.ts#L204)

**Changes:**
- ✅ Changed `idGenerator: 'timestamp'` to `idGenerator: 'uuid'`
- ✅ Changed `id: Date.now().toString()` to `id: crypto.randomUUID()`

### 2. Supabase Migration Function

**File Updated:**
- [migrate-to-supabase.ts](../src/lib/supabase/migrate-to-supabase.ts)

**Changes:**
- ❌ Removed flawed `generateUUIDFromString()` function
- ✅ Replaced with proper `generateUUID()` using `crypto.randomUUID()`

### 3. Local Storage Migration

**File Created:**
- [migrate-ai-systems-to-uuid.ts](../src/lib/migrations/migrate-ai-systems-to-uuid.ts)

**Purpose:**
- Automatically converts existing AI systems with timestamp IDs to UUIDs
- Updates all evaluation references to use new UUIDs
- Runs automatically on app startup

### 4. Supabase Invalid UUID Fixer

**File Created:**
- [fix-invalid-uuids.ts](../src/lib/supabase/fix-invalid-uuids.ts)

**Purpose:**
- Scans Supabase for invalid UUIDs (starting with `00000000-0000`)
- Replaces them with proper UUIDs
- Updates all foreign key references
- Available via console: `fixInvalidUUIDs()`

## Expected UUID Format

### PostgreSQL/Supabase Format
```
Standard UUID v4 (RFC 4122)
xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx
```

### Valid Examples
```
550e8400-e29b-41d4-a716-446655440000
f47ac10b-58cc-4372-a567-0e02b2c3d479
6ba7b810-9dad-11d1-80b4-00c04fd430c8
```

### Invalid Examples (What We Fixed)
```
00000000-0000-4000-8000-000051999194  ❌ (Padded with zeros)
1759343861102                          ❌ (Timestamp, not UUID)
```

## How to Fix Existing Data

### Step 1: Fix Local Storage (Automatic)
The migration runs automatically on app load. You can also run manually:
```javascript
// In browser console
migrateAISystemsToUUID()
```

### Step 2: Fix Supabase Data (Manual)
Run this in the browser console:
```javascript
// Fix invalid UUIDs in Supabase
await fixInvalidUUIDs()
```

This will:
1. Scan all AI systems, guardrails, and evaluations
2. Identify invalid UUIDs (starting with `00000000-0000`)
3. Replace them with proper UUIDs
4. Update all foreign key references

### Step 3: Verify
```javascript
// Verify data in Supabase
await verifySupabaseData()
```

## Database Schema

The Supabase database uses PostgreSQL UUID type with `gen_random_uuid()`:

```sql
CREATE TABLE ai_systems (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  -- ...
);

CREATE TABLE evaluations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ai_system_id UUID REFERENCES ai_systems(id) ON DELETE SET NULL,
  -- ...
);
```

## Testing

After applying the fix:

1. **Create a new AI System** - Should have a proper UUID
2. **Create an evaluation** - Should work without UUID errors
3. **Check Supabase** - Run `verifySupabaseData()` to see all UUIDs
4. **Verify format** - All UUIDs should match the pattern `xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx`

## Migration Order

The application loads migrations in this order:
1. `migrate-ai-systems-to-uuid.ts` - Fixes local storage
2. `fix-invalid-uuids.ts` - Makes fixer available (manual run)
3. App loads normally with proper UUID generation

## Summary

- ✅ All new AI systems use proper UUIDs
- ✅ Local storage automatically migrated
- ✅ Supabase fixer available via console
- ✅ Compatible with PostgreSQL UUID type
- ✅ No more evaluation creation errors
