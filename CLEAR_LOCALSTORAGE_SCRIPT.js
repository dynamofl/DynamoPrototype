// Script to clear localStorage API keys
// Run this in your browser console (F12 -> Console tab)

console.log('🧹 Clearing localStorage API keys...');

// Check what's currently in localStorage
const apiKeys = localStorage.getItem('dynamo-api-keys');
if (apiKeys) {
  try {
    const parsed = JSON.parse(apiKeys);
    console.log('📦 Found API keys in localStorage:', parsed);
    console.log('Total providers with keys:', Object.keys(parsed).length);

    // List all providers and their key counts
    for (const [provider, keys] of Object.entries(parsed)) {
      console.log(`  - ${provider}: ${Array.isArray(keys) ? keys.length : 0} keys`);
    }
  } catch (e) {
    console.log('⚠️ Could not parse API keys:', e);
  }
}

// Clear the API keys from localStorage
localStorage.removeItem('dynamo-api-keys');
console.log('✅ Removed dynamo-api-keys from localStorage');

// Also check for any other dynamo-related items
const dynamoItems = [];
for (let i = 0; i < localStorage.length; i++) {
  const key = localStorage.key(i);
  if (key && key.includes('dynamo')) {
    dynamoItems.push(key);
  }
}

if (dynamoItems.length > 0) {
  console.log('📋 Other dynamo-related localStorage items:', dynamoItems);
} else {
  console.log('✨ No other dynamo-related items found in localStorage');
}

// Refresh the page to see the changes
console.log('🔄 Please refresh the page to see the changes');
console.log('');
console.log('To refresh, you can:');
console.log('1. Press F5 or Ctrl+R (Cmd+R on Mac)');
console.log('2. Or run: location.reload()');