import { createBrowserClient } from '@supabase/ssr';

/**
 * Create a Supabase client for browser-side usage.
 * This client handles cookies automatically for auth.
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

// Singleton instance for client-side usage
let browserClient: ReturnType<typeof createBrowserClient> | null = null;

/**
 * Get or create the Supabase browser client singleton.
 * Use this in client components.
 */
export function getSupabaseClient() {
  if (typeof window === 'undefined') {
    throw new Error('getSupabaseClient can only be used in browser environment');
  }

  if (!browserClient) {
    browserClient = createClient();
  }

  return browserClient;
}

/**
 * Check if Supabase is properly configured.
 */
export function isSupabaseConfigured(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  return Boolean(
    url &&
    key &&
    url !== 'your-project-url' &&
    url.includes('supabase.co')
  );
}

