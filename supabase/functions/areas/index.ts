import { handleCors, errorResponse } from '../_shared/cors.ts';
import { getSupabaseClient } from '../_shared/supabaseClient.ts';
import { handleAreas } from '../_shared/handlers/areas.ts';

async function handler(req: Request): Promise<Response> {
  const corsRes = handleCors(req);
  if (corsRes) return corsRes;

  try {
    const supabase = getSupabaseClient(false);
    const url = new URL(req.url);
    const segments = url.pathname.replace(/^\/functions\/v1\/areas\/?/, '').split('/').filter(Boolean);
    const areaId = segments[0];
    return await handleAreas(req, supabase, areaId);
  } catch (err: any) {
    return errorResponse(err?.message || 'Internal server error', 500);
  }
}

if (typeof Deno !== 'undefined' && typeof Deno.serve === 'function') {
  Deno.serve(handler);
}

export default handler;
