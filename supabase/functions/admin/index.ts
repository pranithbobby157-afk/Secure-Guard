import { handleCors, errorResponse } from '../_shared/cors.ts';
import { getSupabaseClient } from '../_shared/supabaseClient.ts';
import { handleAdmin } from '../_shared/handlers/admin.ts';

async function handler(req: Request): Promise<Response> {
  const corsRes = handleCors(req);
  if (corsRes) return corsRes;

  try {
    const supabase = getSupabaseClient(true);
    const url = new URL(req.url);
    const segments = url.pathname.replace(/^\/functions\/v1\/admin\/?/, '').split('/').filter(Boolean);
    const resource = segments[0];
    const subId = segments[1];
    const subAction = segments[2];
    return await handleAdmin(req, supabase, resource, subId, subAction);
  } catch (err: any) {
    return errorResponse(err?.message || 'Internal server error', 500);
  }
}

if (typeof Deno !== 'undefined' && typeof Deno.serve === 'function') {
  Deno.serve(handler);
}

export default handler;
