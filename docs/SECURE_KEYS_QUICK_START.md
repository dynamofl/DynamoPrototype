# Secure API Keys - Quick Start Guide

## ✅ Setup Complete!

The secure API key infrastructure is now deployed and ready to use.

## 🧪 Testing (Run in Browser Console)

### Step 1: Test with Fake Key (Safe)

```javascript
await window.testSecureKeys()
```

**Expected output**:
```
🧪 Testing Secure API Key System...
✅ Key stored successfully
✅ Found X keys
✅ API key NOT in localStorage (secure!)
✅ Audit logs working
✅ Can delete keys
🎉 All tests passed!
```

### Step 2: Test with Real OpenAI Key (Optional)

```javascript
// Replace with your actual OpenAI API key
await window.testRealAPIKey('sk-proj-...')
```

**Expected output**:
```
✅ Key stored: sk-proj...Ab12
✅ API call successful!
   Response: Hello from secure Vault!
✅ Usage tracked: 1
🎉 Real API key test passed!
```

Clean up test key:
```javascript
await window.deleteTestKey('key-id-from-output')
```

## 🚀 Migration (Run in Browser Console)

### Step 1: Verify What Will Be Migrated

```javascript
await window.verifyMigration()
```

This shows:
- How many keys are in localStorage
- How many are already in Vault
- Which keys need migration

### Step 2: Run Migration

```javascript
await window.migrateKeysToVault()
```

**Expected output**:
```
🚀 Starting API Key Migration to Vault...
📦 Found 4 providers to migrate

🔄 Migrating: Open AI Staging...
   ✅ Migrated to Vault: sk-proj...Ab12
   🔗 Updated AI system reference

📊 Migration Summary:
   Total: 4
   ✅ Successful: 4
   ⏭️  Skipped: 0
   ❌ Failed: 0

🎉 Migration successful!
```

### Step 3: Verify Migration

```javascript
await window.verifyMigration()
```

Should show:
- ✅ Keys in Vault
- ✅ No unmasked keys in localStorage

### Step 4: Clean Up Old Storage

```javascript
// Preview what will be deleted
await window.cleanupOldStorage()

// Confirm and delete
await window.confirmCleanup()
```

## 📝 Using in Your Code

### Store a New API Key

```typescript
import { SecureAPIKeyService } from '@/lib/supabase/secure-api-key-service';

const key = await SecureAPIKeyService.storeAPIKey({
  name: 'Production OpenAI',
  provider: 'openai',
  apiKey: 'sk-proj-...'
});

console.log('Stored:', key.masked); // sk-proj...Ab12
```

### List API Keys

```typescript
const keys = await SecureAPIKeyService.listAPIKeys();
keys.forEach(key => {
  console.log(`${key.name}: ${key.masked} (${key.status})`);
});
```

### Make AI API Call (Secure)

```typescript
const response = await SecureAPIKeyService.callAIAPI({
  apiKeyId: 'key-id', // From listAPIKeys()
  provider: 'openai',
  model: 'gpt-4',
  messages: [
    { role: 'user', content: 'Hello!' }
  ]
});

console.log(response.choices[0].message.content);
```

### Delete/Revoke Key

```typescript
// Soft delete (mark as revoked)
await SecureAPIKeyService.revokeAPIKey('key-id');

// Hard delete (remove from Vault)
await SecureAPIKeyService.deleteAPIKey('key-id');
```

## 🔄 Update Evaluation Runner

Update [evalRunner.ts](../src/features/evaluation/lib/evalRunner.ts):

**Before** (insecure):
```typescript
import { APIKeyStorage } from '@/lib/storage/secure-storage';

const providers = APIKeyStorage.loadProviders();
const apiKey = provider.apiKey; // ❌ Exposed!
```

**After** (secure):
```typescript
import { SecureAPIKeyService } from '@/lib/supabase/secure-api-key-service';

// Get API key reference
const keys = await SecureAPIKeyService.listAPIKeys();
const openaiKey = keys.find(k => k.provider === 'openai' && k.status === 'active');

// Make API call through secure proxy
const response = await SecureAPIKeyService.callAIAPI({
  apiKeyId: openaiKey!.id,
  provider: 'openai',
  model: config.model,
  messages: messages,
  evaluationId: evaluationId
});
```

## 🐛 Troubleshooting

### Edge Functions Not Working

Check deployment:
```bash
supabase functions list
```

View logs:
```bash
supabase functions logs store-api-key
supabase functions logs call-ai-api
```

### Vault Functions Not Found

Verify migrations:
```bash
supabase db diff
```

Check in Supabase dashboard → Database → Functions

### Permission Errors

Make sure `.env` has correct values:
```
VITE_SUPABASE_URL=https://uabbbzzrwgfxiamvnunr.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
```

## 📊 Verify Security

### Check localStorage

```javascript
// Should NOT find actual API keys
Object.keys(localStorage).forEach(key => {
  if (key.includes('api') || key.includes('key')) {
    console.log(key, localStorage.getItem(key));
  }
});
```

### Check Vault

```javascript
// Metadata only (no actual keys visible)
const keys = await SecureAPIKeyService.listAPIKeys();
console.log(keys); // Only shows masked versions
```

### Check Audit Logs

```javascript
const logs = await SecureAPIKeyService.getAPIKeyLogs('key-id');
logs.forEach(log => {
  console.log(`${log.action} at ${log.created_at}: ${log.success ? '✅' : '❌'}`);
});
```

## 🎉 Success Criteria

After migration, you should have:

- ✅ All API keys stored in Supabase Vault (server-side)
- ✅ NO actual keys in localStorage (only references)
- ✅ Complete audit trail of all key usage
- ✅ Ability to make AI API calls through secure proxy
- ✅ Real-time key status tracking
- ✅ Automatic key validation

**Your API keys are now secure!** 🔒
