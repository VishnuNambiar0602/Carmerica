import { createClient as createSupabaseClient } from '@supabase/supabase-js';

function createConfiguredClient() {
  const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  const key = supabaseServiceRoleKey || supabaseAnonKey;
  if (!supabaseUrl || !key) {
    return null;
  }

  return createSupabaseClient(supabaseUrl, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

let cachedClient: ReturnType<typeof createConfiguredClient> = null;

export function getSupabaseClient() {
  if (cachedClient) return cachedClient;
  cachedClient = createConfiguredClient();
  return cachedClient;
}

export function isSupabaseConfigured() {
  return Boolean(getSupabaseClient());
}