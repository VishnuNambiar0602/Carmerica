import { createClient as createSupabaseClient, type SupabaseClient } from '@supabase/supabase-js';

function createConfiguredClient() {
  const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  const key = supabaseServiceRoleKey || supabaseAnonKey;
  if (!supabaseUrl || !key) {
    return null;
  }
  return createSupabaseClient(supabaseUrl, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

let cachedClient: SupabaseClient | null = null;
let verified = false;
let verifiedOk = false;

function createClient() {
  if (cachedClient) return cachedClient;
  cachedClient = createConfiguredClient();
  return cachedClient;
}

export function getSupabaseClient() {
  return createClient();
}

export function isSupabaseConfigured() {
  return Boolean(createClient());
}

export function isSupabaseVerified() {
  return verified && verifiedOk;
}

export async function verifySupabaseConnection(): Promise<boolean> {
  const client = createClient();
  if (!client) {
    verified = true;
    verifiedOk = false;
    return false;
  }

  try {
    const { error } = await client.from('users').select('id').limit(1).maybeSingle();
    if (error) {
      console.warn(`[Supabase] Verification query failed (${error.code}: ${error.message}) — falling back to in-memory storage`);
      verified = true;
      verifiedOk = false;
      return false;
    }
    verified = true;
    verifiedOk = true;
    console.log('[Supabase] Connection verified — using Supabase');
    return true;
  } catch (err) {
    console.warn('[Supabase] Connection failed — falling back to in-memory storage');
    verified = true;
    verifiedOk = false;
    return false;
  }
}
