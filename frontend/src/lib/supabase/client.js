// Supabase Client Configuration
// ================================
// This file initializes the Supabase client for authentication and database access.
// The client uses environment variables for configuration.

import { createClient } from '@supabase/supabase-js';

// Get configuration from environment variables
// In development: .env.local
// In production: Environment variables set in hosting platform
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || '';
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY || '';

// Validate configuration
if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    'Supabase credentials not found. Authentication will be disabled.',
    'Set REACT_APP_SUPABASE_URL and REACT_APP_SUPABASE_ANON_KEY in your .env file.'
  );
}

// Create and export the Supabase client
// This is a singleton - import it anywhere you need Supabase access
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    // Automatically refresh tokens before they expire
    autoRefreshToken: true,
    // Persist session in localStorage
    persistSession: true,
    // Detect session from URL (for magic link callbacks)
    detectSessionInUrl: true,
  },
});

// Helper function to check if Supabase is configured
export const isSupabaseConfigured = () => {
  return Boolean(supabaseUrl && supabaseAnonKey);
};

export default supabase;
