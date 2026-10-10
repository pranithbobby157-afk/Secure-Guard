import { handleCors, errorResponse } from '../_shared/cors.ts';
import { getSupabaseClient } from '../_shared/supabaseClient.ts';
import { handleAlerts } from '../_shared/handlers/alerts.ts';

async function handler(req: Request): Promise<Response> {
  const corsRes = handleCors(req);
  if (corsRes) return corsRes;

  try {
    const supabase = getSupabaseClient(false);
    const url = new URL(req.url);
    const segments = url.pathname.replace(/^\/functions\/v1\/alerts\/?/, '').split('/').filter(Boolean);
    const alertId = segments[0];
    return await handleAlerts(req, supabase, alertId);
  } catch (err: any) {
    return errorResponse(err?.message || 'Internal server error', 500);
  }
}

if (typeof Deno !== 'undefined' && typeof Deno.serve === 'function') {
  Deno.serve(handler);
}

export default handler;
