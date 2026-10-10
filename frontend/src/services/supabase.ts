import { createClient, SupabaseClient, Session, User } from '@supabase/supabase-js';

// Resolve Supabase project URL and public Anon key
export const SUPABASE_URL =
  import.meta.env.VITE_SUPABASE_URL || 'https://ijbsprdkrhnimhiknpxe.supabase.co';

export const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

/**
 * Singleton Supabase client instance configured for browser authentication.
 * Uses public anon key and standard web localStorage.
 */
export const supabase: SupabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storage: typeof window !== 'undefined' ? window.localStorage : undefined,
  },
});

export interface GoogleAuthState {
  session: Session | null;
  user: User | null;
  isLoading: boolean;
  error: string | null;
}

/**
 * Initiates Google OAuth sign-in flow via Supabase Auth.
 * Redirects user to Google OAuth consent screen.
 */
export async function signInWithGoogle(redirectTo?: string): Promise<{ error: Error | null }> {
  try {
    if (!SUPABASE_ANON_KEY) {
      console.warn(
        '[SafeRoute Auth] VITE_SUPABASE_ANON_KEY is not defined. Google OAuth initiation requires a valid anon key.'
      );
    }

    const defaultRedirect =
      typeof window !== 'undefined'
        ? `${window.location.origin}${window.location.pathname}`
        : undefined;

    const targetUrl = redirectTo || defaultRedirect;

    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: targetUrl,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
      },
    });

    if (error) {
      return { error: new Error(error.message) };
    }

    return { error: null };
  } catch (err: any) {
    return { error: err instanceof Error ? err : new Error(String(err)) };
  }
}

/**
 * Signs out the current Supabase session.
 */
export async function signOutGoogle(): Promise<{ error: Error | null }> {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) {
      return { error: new Error(error.message) };
    }
    return { error: null };
  } catch (err: any) {
    return { error: err instanceof Error ? err : new Error(String(err)) };
  }
}

/**
 * Retrieves the active Supabase Auth session if one exists in storage.
 */
export async function getGoogleSession(): Promise<Session | null> {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    return session;
  } catch {
    return null;
  }
}
