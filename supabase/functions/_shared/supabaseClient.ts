import { createClient, SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2.45.4';

function getEnv(key: string, defaultValue = ''): string {
  if (typeof Deno !== 'undefined' && Deno.env && typeof Deno.env.get === 'function') {
    return Deno.env.get(key) ?? defaultValue;
  }
  if (typeof process !== 'undefined' && process.env) {
    return process.env[key] ?? defaultValue;
  }
  return defaultValue;
}

export function getSupabaseUrl(): string {
  return (
    getEnv('SUPABASE_URL') ||
    getEnv('PUBLIC_SUPABASE_URL') ||
    'https://ijbsprdkrhnimhiknpxe.supabase.co'
  );
}

export function getSupabaseAnonKey(): string {
  return getEnv('SUPABASE_ANON_KEY') || '';
}

export function getSupabaseServiceRoleKey(): string {
  return getEnv('SUPABASE_SERVICE_ROLE_KEY') || '';
}

export function getSupabaseClient(useServiceRole = true): SupabaseClient {
  const url = getSupabaseUrl();
  const key = useServiceRole
    ? getSupabaseServiceRoleKey() || getSupabaseAnonKey()
    : getSupabaseAnonKey() || getSupabaseServiceRoleKey();

  if (!key) {
    console.warn(
      'Warning: Supabase key is empty. Database operations requiring credentials will fail.'
    );
  }

  return createClient(url, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}
