import { SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2.45.4';
import { jsonResponse, errorResponse } from '../cors.ts';
import { calculateFreshness } from '../ingestion.ts';
import { Alert, Source } from '../types.ts';

export async function handleAlerts(
  req: Request,
  supabase: SupabaseClient,
  alertId?: string
): Promise<Response> {
  if (alertId) {
    const { data: alert, error } = await supabase
      .from('alerts')
      .select(`
        *,
        source:sources(*),
        area:areas(*),
        translations:translations(*)
      `)
      .eq('id', alertId)
      .maybeSingle();

    if (error) {
      return errorResponse(`Database error: ${error.message}`, 500);
    }
    if (!alert) {
      return errorResponse('Alert not found', 404);
    }

    const freshness = calculateFreshness(alert as Alert, alert.source as Source);
    return jsonResponse({
      ...alert,
      is_stale: freshness.is_stale,
      freshness_minutes: freshness.freshness_minutes,
    });
  }

  const url = new URL(req.url);
  const areaId = url.searchParams.get('area_id');
  const hazardType = url.searchParams.get('hazard_type');
  const severity = url.searchParams.get('severity');
  const statusParam = url.searchParams.get('status') ?? 'active';

  let query = supabase
    .from('alerts')
    .select(`
      *,
      source:sources(*),
      area:areas(*),
      translations:translations(*)
    `)
    .order('issued_at', { ascending: false });

  if (areaId) {
    query = query.eq('area_id', areaId);
  }
  if (hazardType) {
    query = query.eq('hazard_type', hazardType);
  }
  if (severity) {
    query = query.eq('severity', severity);
  }
  if (statusParam && statusParam !== 'all') {
    query = query.eq('status', statusParam);
  }

  const { data: alerts, error } = await query;
  if (error) {
    return errorResponse(`Database error: ${error.message}`, 500);
  }

  const results = (alerts || []).map((a: any) => {
    const freshness = calculateFreshness(a as Alert, a.source as Source);
    return {
      ...a,
      is_stale: freshness.is_stale,
      freshness_minutes: freshness.freshness_minutes,
    };
  });

  return jsonResponse(results);
}
