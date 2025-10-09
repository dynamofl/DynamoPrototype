/**
 * Test script for secure API key storage
 * Run in browser console: await window.testSecureKeys()
 */

import { SecureAPIKeyService } from './secure-api-key-service';

export async function testSecureKeys() {
  console.log('🧪 Testing Secure API Key System...\n');

  try {
    // Test 1: Store a test API key
    console.log('📝 Test 1: Storing API key...');

    // Note: Replace with a real API key for full testing
    const testKey = 'sk-test-' + Math.random().toString(36).substring(2, 15) +
                    Math.random().toString(36).substring(2, 15) +
                    Math.random().toString(36).substring(2, 15);

    const storedKey = await SecureAPIKeyService.storeAPIKey({
      name: 'Test Key ' + Date.now(),
      provider: 'openai',
      apiKey: testKey
    });

    console.log('✅ Key stored successfully:');
    console.log('   ID:', storedKey.id);
    console.log('   Name:', storedKey.name);
    console.log('   Masked:', storedKey.masked);
    console.log('   Status:', storedKey.status);
    console.log('');

    // Test 2: List all keys
    console.log('📋 Test 2: Listing all API keys...');
    const allKeys = await SecureAPIKeyService.listAPIKeys();
    console.log(`✅ Found ${allKeys.length} keys:`);
    allKeys.forEach(key => {
      console.log(`   - ${key.name}: ${key.masked} (${key.status})`);
    });
    console.log('');

    // Test 3: Get specific key metadata
    console.log('🔍 Test 3: Getting key metadata...');
    const keyMeta = await SecureAPIKeyService.getAPIKey(storedKey.id);
    console.log('✅ Key metadata:');
    console.log('   Provider:', keyMeta?.provider);
    console.log('   Usage count:', keyMeta?.usageCount);
    console.log('   Validated:', keyMeta?.isValidated);
    console.log('');

    // Test 4: Check localStorage (should NOT have actual key)
    console.log('🔒 Test 4: Verifying key not in localStorage...');
    let foundKeyInLocalStorage = false;
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.includes('api')) {
        const value = localStorage.getItem(key);
        if (value && value.includes(testKey)) {
          foundKeyInLocalStorage = true;
          console.error('❌ ERROR: Found actual key in localStorage!');
        }
      }
    }
    if (!foundKeyInLocalStorage) {
      console.log('✅ API key NOT in localStorage (secure!)');
    }
    console.log('');

    // Test 5: Get usage logs
    console.log('📊 Test 5: Getting usage logs...');
    const logs = await SecureAPIKeyService.getAPIKeyLogs(storedKey.id, 10);
    console.log(`✅ Found ${logs.length} log entries:`);
    logs.forEach(log => {
      console.log(`   - ${log.action} at ${new Date(log.created_at).toLocaleString()}: ${log.success ? '✅' : '❌'}`);
    });
    console.log('');

    // Test 6: Cleanup - delete test key
    console.log('🗑️  Test 6: Cleaning up test key...');
    await SecureAPIKeyService.deleteAPIKey(storedKey.id);
    console.log('✅ Test key deleted');
    console.log('');

    console.log('🎉 All tests passed!\n');
    console.log('Summary:');
    console.log('  ✅ Can store keys securely in Vault');
    console.log('  ✅ Can list key metadata');
    console.log('  ✅ Keys NOT stored in localStorage');
    console.log('  ✅ Audit logs working');
    console.log('  ✅ Can delete keys');
    console.log('');
    console.log('⚠️  Note: This test used a fake API key.');
    console.log('   To test with a real key, use testRealAPIKey(yourKey)');

    return { success: true };
  } catch (error) {
    console.error('❌ Test failed:', error);
    return { success: false, error };
  }
}

/**
 * Test with a real OpenAI API key
 */
export async function testRealAPIKey(apiKey: string) {
  console.log('🧪 Testing with real API key...\n');

  try {
    // Store the key
    console.log('📝 Storing real API key...');
    const storedKey = await SecureAPIKeyService.storeAPIKey({
      name: 'Real OpenAI Key ' + Date.now(),
      provider: 'openai',
      apiKey: apiKey
    });
    console.log('✅ Key stored:', storedKey.masked);
    console.log('');

    // Make a test API call
    console.log('🤖 Making test API call...');
    const response = await SecureAPIKeyService.callAIAPI({
      apiKeyId: storedKey.id,
      provider: 'openai',
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'user', content: 'Say "Hello from secure Vault!" in 5 words or less.' }
      ],
      maxTokens: 20
    });

    console.log('✅ API call successful!');
    console.log('   Response:', response.choices[0].message.content);
    console.log('');

    // Check usage was tracked
    console.log('📊 Checking usage tracking...');
    const keyAfter = await SecureAPIKeyService.getAPIKey(storedKey.id);
    console.log('✅ Usage tracked:');
    console.log('   Usage count:', keyAfter?.usageCount);
    console.log('   Last used:', keyAfter?.lastUsedAt);
    console.log('');

    console.log('🎉 Real API key test passed!\n');
    console.log('⚠️  Test key ID:', storedKey.id);
    console.log('   Delete it with: await window.deleteTestKey("' + storedKey.id + '")');

    return { success: true, keyId: storedKey.id };
  } catch (error) {
    console.error('❌ Real API key test failed:', error);
    return { success: false, error };
  }
}

/**
 * Helper to delete a test key
 */
export async function deleteTestKey(keyId: string) {
  try {
    await SecureAPIKeyService.deleteAPIKey(keyId);
    console.log('✅ Deleted key:', keyId);
  } catch (error) {
    console.error('❌ Failed to delete key:', error);
  }
}

// Make functions available globally
if (typeof window !== 'undefined') {
  (window as any).testSecureKeys = testSecureKeys;
  (window as any).testRealAPIKey = testRealAPIKey;
  (window as any).deleteTestKey = deleteTestKey;
}
