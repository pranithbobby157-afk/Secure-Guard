import { SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2.45.4';
import { jsonResponse, errorResponse } from '../cors.ts';
import { authenticateUser } from '../security.ts';
import { logAudit } from '../audit.ts';
import { calculateFreshness, refreshSource, toggleSourceHealth } from '../ingestion.ts';
import { getOrCreateTranslation } from '../translation.ts';
import { Alert, Source, SafeZone } from '../types.ts';

export async function handleAdmin(
  req: Request,
  supabase: SupabaseClient,
  resource?: string,
  subId?: string,
  subAction?: string
): Promise<Response> {
  // All admin endpoints require authentication
  const authResult = await authenticateUser(req, supabase);
  if (authResult.error || !authResult.user) {
    return errorResponse(authResult.error || 'Unauthorized', authResult.status || 401);
  }
  const currentUser = authResult.user;
  const method = req.method.toUpperCase();

  // Citizen / standard users do not have permissions for admin operations
  if (currentUser.role === 'user') {
    return errorResponse(
      'Access restricted. Standard user accounts cannot perform editor or administrator operations.',
      403
    );
  }

  // 1. Audit Logs: GET /admin/audit-logs
  if (resource === 'audit-logs' && method === 'GET') {
    const { data: logs, error } = await supabase
      .from('audit_logs')
      .select('*')
      .order('timestamp', { ascending: false })
      .limit(50);

    if (error) {
      return errorResponse(`Database error: ${error.message}`, 500);
    }
    return jsonResponse(logs || []);
  }

  // 2. Alerts management
  if (resource === 'alerts') {
    // POST /admin/alerts
    if (!subId && method === 'POST') {
      let body: any;
      try {
        body = await req.json();
      } catch {
        return errorResponse('Invalid JSON body', 400);
      }

      const now = new Date();
      const nowIso = now.toISOString();
      const expiresIso = new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString();
      const alertId = `alert-sim-${crypto.randomUUID().replace(/-/g, '').substring(0, 10)}`;

      // Pick source
      let sourceId = body.source_id;
      if (!sourceId) {
        const { data: firstSrc } = await supabase.from('sources').select('id').limit(1).maybeSingle();
        sourceId = firstSrc?.id || 'source-gcc';
      }

      let title = body.title || 'Untitled Alert';
      if (body.is_simulated && !title.startsWith('SIMULATION:')) {
        title = `SIMULATION: ${title}`;
      }

      const newAlertRow = {
        id: alertId,
        source_id: sourceId,
        external_id: `EDITOR-${Math.floor(now.getTime() / 1000)}`,
        area_id: body.area_id,
        title,
        description_original: body.description_original || '',
        instruction_original: body.instruction_original || null,
        original_language: body.original_language || 'en',
        hazard_type: body.hazard_type || 'storm',
        severity: body.severity || 'warning',
        status: body.status || 'active',
        issued_at: nowIso,
        effective_at: nowIso,
        expires_at: expiresIso,
        retrieved_at: nowIso,
        source_url: body.source_url || null,
        verification_status: body.verification_status || 'official_source',
        is_simulated: !!body.is_simulated,
        lat: body.lat ?? null,
        lng: body.lng ?? null,
      };

      const { data: inserted, error: insertErr } = await supabase
        .from('alerts')
        .insert(newAlertRow)
        .select(`
          *,
          source:sources(*),
          area:areas(*),
          translations:translations(*)
        `)
        .single();

      if (insertErr || !inserted) {
        return errorResponse(`Failed to create alert: ${insertErr?.message || 'Database error'}`, 500);
      }

      const alertObj = inserted as Alert;

      // Pre-generate translations
      for (const lang of ['ta', 'hi', 'fr']) {
        try {
          await getOrCreateTranslation(supabase, alertObj, lang);
        } catch (e) {
          console.warn(`Translation pre-generation warning for ${lang}:`, e);
        }
      }

      await logAudit(supabase, {
        userId: currentUser.id,
        action: 'CREATE_ALERT',
        entityType: 'alert',
        entityId: alertObj.id,
        details: {
          title: alertObj.title,
          severity: alertObj.severity,
          is_simulated: alertObj.is_simulated,
        },
      });

      const freshness = calculateFreshness(alertObj, alertObj.source as Source);
      return jsonResponse({
        ...alertObj,
        is_stale: freshness.is_stale,
        freshness_minutes: freshness.freshness_minutes,
      });
    }

    // PATCH /admin/alerts/:id
    if (subId && method === 'PATCH') {
      let body: any;
      try {
        body = await req.json();
      } catch {
        return errorResponse('Invalid JSON body', 400);
      }

      const { data: existing, error: findErr } = await supabase
        .from('alerts')
        .select('*')
        .eq('id', subId)
        .maybeSingle();

      if (findErr) return errorResponse(`Database error: ${findErr.message}`, 500);
      if (!existing) return errorResponse('Alert not found', 404);

      const updates: Record<string, unknown> = {};
      const changes: Record<string, unknown> = {};

      const fields = [
        'title',
        'description_original',
        'instruction_original',
        'severity',
        'status',
        'verification_status',
        'lat',
        'lng',
      ];

      for (const field of fields) {
        if (body[field] !== undefined) {
          updates[field] = body[field];
          changes[field] = body[field];
        }
      }

      const { data: updated, error: updateErr } = await supabase
        .from('alerts')
        .update(updates)
        .eq('id', subId)
        .select(`
          *,
          source:sources(*),
          area:areas(*),
          translations:translations(*)
        `)
        .single();

      if (updateErr || !updated) {
        return errorResponse(`Failed to update alert: ${updateErr?.message || 'Database error'}`, 500);
      }

      await logAudit(supabase, {
        userId: currentUser.id,
        action: 'UPDATE_ALERT',
        entityType: 'alert',
        entityId: subId,
        details: changes,
      });

      const alertObj = updated as Alert;
      const freshness = calculateFreshness(alertObj, alertObj.source as Source);
      return jsonResponse({
        ...alertObj,
        is_stale: freshness.is_stale,
        freshness_minutes: freshness.freshness_minutes,
      });
    }

    // DELETE /admin/alerts/:id
    if (subId && method === 'DELETE') {
      const { data: existing, error: findErr } = await supabase
        .from('alerts')
        .select('id, title')
        .eq('id', subId)
        .maybeSingle();

      if (findErr) return errorResponse(`Database error: ${findErr.message}`, 500);
      if (!existing) return errorResponse('Alert not found', 404);

      const { error: delErr } = await supabase.from('alerts').delete().eq('id', subId);
      if (delErr) {
        return errorResponse(`Failed to delete alert: ${delErr.message}`, 500);
      }

      await logAudit(supabase, {
        userId: currentUser.id,
        action: 'DELETE_ALERT',
        entityType: 'alert',
        entityId: subId,
        details: { title: existing.title },
      });

      return jsonResponse({ message: `Alert ${subId} deleted successfully` });
    }
  }

  // 3. Safe zones: POST /admin/safe-zones
  if (resource === 'safe-zones' && method === 'POST') {
    let body: any;
    try {
      body = await req.json();
    } catch {
      return errorResponse('Invalid JSON body', 400);
    }

    const nowIso = new Date().toISOString();
    const szId = `sz-editor-${crypto.randomUUID().replace(/-/g, '').substring(0, 10)}`;

    const newSzRow = {
      id: szId,
      area_id: body.area_id,
      name: body.name,
      facility_type: body.facility_type,
      address: body.address,
      latitude: body.latitude,
      longitude: body.longitude,
      source_name: body.source_name,
      source_url: body.source_url || null,
      verification_status: body.verification_status || 'official_verified',
      last_verified_at: nowIso,
      operational_status: body.operational_status || 'open',
      capacity_notes: body.capacity_notes || null,
      contact_phone: body.contact_phone || null,
      is_simulated: !!body.is_simulated,
    };

    const { data: createdSz, error: insertErr } = await supabase
      .from('safe_zones')
      .insert(newSzRow)
      .select('*')
      .single();

    if (insertErr || !createdSz) {
      return errorResponse(`Failed to create safe zone: ${insertErr?.message || 'Database error'}`, 500);
    }

    await logAudit(supabase, {
      userId: currentUser.id,
      action: 'CREATE_SAFE_ZONE',
      entityType: 'safe_zone',
      entityId: szId,
      details: { name: body.name, facility_type: body.facility_type },
    });

    return jsonResponse(createdSz);
  }

  // 4. Sources management
  if (resource === 'sources' && subId) {
    // POST /admin/sources/:id/refresh
    if (subAction === 'refresh' && method === 'POST') {
      try {
        const refreshed = await refreshSource(supabase, subId, currentUser.username);
        return jsonResponse(refreshed);
      } catch (e: any) {
        return errorResponse(e.message || 'Failed to refresh source', 400);
      }
    }

    // POST /admin/sources/:id/toggle-status
    if (subAction === 'toggle-status' && method === 'POST') {
      let body: any;
      try {
        body = await req.json();
      } catch {
        return errorResponse('Invalid JSON body', 400);
      }

      const newStatus = body?.new_status;
      if (!newStatus || !['healthy', 'degraded', 'unavailable'].includes(newStatus)) {
        return errorResponse('Invalid new_status value', 400);
      }

      try {
        const updated = await toggleSourceHealth(supabase, subId, newStatus, currentUser.username);
        return jsonResponse(updated);
      } catch (e: any) {
        return errorResponse(e.message || 'Failed to toggle source status', 400);
      }
    }
  }

  return errorResponse('Admin resource or action not found', 404);
}
