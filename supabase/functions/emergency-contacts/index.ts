import { handleCors, errorResponse } from '../_shared/cors.ts';
import { getSupabaseClient } from '../_shared/supabaseClient.ts';
import { handleContacts } from '../_shared/handlers/contacts.ts';

async function handler(req: Request): Promise<Response> {
  const corsRes = handleCors(req);
  if (corsRes) return corsRes;

  try {
    const supabase = getSupabaseClient(false);
    return await handleContacts(req, supabase);
  } catch (err: any) {
    return errorResponse(err?.message || 'Internal server error', 500);
  }
}

if (typeof Deno !== 'undefined' && typeof Deno.serve === 'function') {
  Deno.serve(handler);
}

export default handler;
