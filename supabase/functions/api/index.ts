import { handleCors, errorResponse } from '../_shared/cors.ts';
import { getSupabaseClient } from '../_shared/supabaseClient.ts';
import { handleStatus } from '../_shared/handlers/status.ts';
import { handleAreas } from '../_shared/handlers/areas.ts';
import { handleAlerts } from '../_shared/handlers/alerts.ts';
import { handleSafeZones } from '../_shared/handlers/safeZones.ts';
import { handleContacts } from '../_shared/handlers/contacts.ts';
import { handleTranslations } from '../_shared/handlers/translations.ts';
import { handleAuth } from '../_shared/handlers/auth.ts';
import { handleAdmin } from '../_shared/handlers/admin.ts';
import { handleDemo } from '../_shared/handlers/demo.ts';

export async function router(req: Request): Promise<Response> {
  const corsRes = handleCors(req);
  if (corsRes) return corsRes;

  try {
    const supabase = getSupabaseClient(true);
    const url = new URL(req.url);

    // Normalize path by stripping /functions/v1/api, /functions/v1, or /api prefixes
    let path = url.pathname;
    path = path.replace(/^\/functions\/v1\/api/, '');
    path = path.replace(/^\/functions\/v1/, '');
    path = path.replace(/^\/api/, '');

    if (!path.startsWith('/')) {
      path = `/${path}`;
    }

    const segments = path.split('/').filter(Boolean);
    const root = segments[0] || '';

    // Route: /health or /status
    if (root === 'health' || root === 'status') {
      return await handleStatus(req, supabase, path);
    }

    // Route: /areas, /areas/:id
    if (root === 'areas') {
      const areaId = segments[1];
      return await handleAreas(req, supabase, areaId);
    }

    // Route: /alerts, /alerts/:id
    if (root === 'alerts') {
      const alertId = segments[1];
      return await handleAlerts(req, supabase, alertId);
    }

    // Route: /safe-zones, /safe-zones/:id
    if (root === 'safe-zones') {
      const szId = segments[1];
      return await handleSafeZones(req, supabase, szId);
    }

    // Route: /emergency-contacts
    if (root === 'emergency-contacts') {
      return await handleContacts(req, supabase);
    }

    // Route: /translations/:alert_id
    if (root === 'translations') {
      const alertId = segments[1];
      return await handleTranslations(req, supabase, alertId);
    }

    // Route: /auth/login, /auth/me, /auth/logout
    if (root === 'auth') {
      const action = segments[1];
      return await handleAuth(req, supabase, action);
    }

    // Route: /admin/:resource...
    if (root === 'admin') {
      const resource = segments[1];
      const subId = segments[2];
      const subAction = segments[3];
      return await handleAdmin(req, supabase, resource, subId, subAction);
    }

    // Route: /demo/scenario
    if (root === 'demo' && segments[1] === 'scenario') {
      return await handleDemo(req, supabase);
    }

    return errorResponse(`Route not found: ${url.pathname}`, 404);
  } catch (err: any) {
    console.error('Unhandled Edge Function error:', err);
    return errorResponse(err?.message || 'Internal server error', 500);
  }
}

// Default export / Deno serve listener for Edge Functions
if (typeof Deno !== 'undefined' && typeof Deno.serve === 'function') {
  Deno.serve(router);
}

export default router;
