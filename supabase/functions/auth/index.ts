import { handleCors, errorResponse } from '../_shared/cors.ts';
import { getSupabaseClient } from '../_shared/supabaseClient.ts';
import { handleAuth } from '../_shared/handlers/auth.ts';

async function handler(req: Request): Promise<Response> {
  const corsRes = handleCors(req);
  if (corsRes) return corsRes;

  try {
    const supabase = getSupabaseClient(true);
    const url = new URL(req.url);
    const segments = url.pathname.replace(/^\/functions\/v1\/auth\/?/, '').split('/').filter(Boolean);
    const action = segments[0];
    return await handleAuth(req, supabase, action);
  } catch (err: any) {
    return errorResponse(err?.message || 'Internal server error', 500);
  }
}

if (typeof Deno !== 'undefined' && typeof Deno.serve === 'function') {
  Deno.serve(handler);
}

export default handler;
