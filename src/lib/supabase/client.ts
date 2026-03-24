// Supabase client for frontend

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase credentials not configured. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Clear all auth data and restart with fresh session
 * Call this when auth errors occur
 */
export async function clearAndResetSession(): Promise<void> {
  try {
    // Sign out to clear all auth state
    await supabase.auth.signOut();

    // Clear any cached auth data
    localStorage.removeItem('supabase.auth.token');

    console.log('✅ Session cleared successfully');
  } catch (error) {
    console.error('Failed to clear session:', error);
  }
}

// Helper to get current user token
export async function getAuthToken(): Promise<string | null> {
  const { data: { session } } = await supabase.auth.getSession();
  return session?.access_token || null;
}

// Helper to ensure user is authenticated
export async function ensureAuthenticated(): Promise<void> {
  try {
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      // For development, sign in anonymously
      // In production, you'd redirect to login
      console.warn('No active session. Creating anonymous session...');

      const { data, error } = await supabase.auth.signInAnonymously();

      if (error) {
        // If anonymous auth also fails, clear everything and throw
        console.error('Anonymous auth failed:', error);
        await clearAndResetSession();
        throw new Error(`Authentication failed: ${error.message}`);
      }

      console.log('Anonymous session created:', data.session?.user.id);
    }
  } catch (error) {
    console.error('ensureAuthenticated failed:', error);
    // Don't throw - let the app continue without auth
    // Individual services will handle missing tokens
  }
}
