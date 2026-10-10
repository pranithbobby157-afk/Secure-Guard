import { SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2.45.4';
import { jsonResponse, errorResponse } from '../cors.ts';
import { Source } from '../types.ts';

export async function handleStatus(
  req: Request,
  supabase: SupabaseClient,
  subPath = ''
): Promise<Response> {
  const url = new URL(req.url);
  const path = subPath || url.pathname;

  if (path.endsWith('/health')) {
    return jsonResponse({
      status: 'healthy',
      service: 'SafeRoute Crisis Communication API',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
    });
  }

  // Handle /status
  const { data: sourcesData, error: sourcesErr } = await supabase
    .from('sources')
    .select('*');

  if (sourcesErr) {
    return errorResponse(`Failed to load sources: ${sourcesErr.message}`, 500);
  }

  const sources = (sourcesData || []) as Source[];

  const { count: activeAlertsCount, error: alertsErr } = await supabase
    .from('alerts')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'active');

  if (alertsErr) {
    return errorResponse(`Failed to count active alerts: ${alertsErr.message}`, 500);
  }

  const { count: safeZonesCount, error: szErr } = await supabase
    .from('safe_zones')
    .select('*', { count: 'exact', head: true });

  if (szErr) {
    return errorResponse(`Failed to count safe zones: ${szErr.message}`, 500);
  }

  const healthySources = sources.filter((s) => s.health_status === 'healthy').length;

  let overallStatus: 'healthy' | 'degraded' = 'healthy';
  if (sources.some((s) => s.health_status === 'unavailable' || s.health_status === 'degraded')) {
    overallStatus = 'degraded';
  }

  let latestSuccess = new Date().toISOString();
  const successDates = sources
    .filter((s) => s.last_success_at)
    .map((s) => new Date(s.last_success_at!).getTime());

  if (successDates.length > 0) {
    latestSuccess = new Date(Math.max(...successDates)).toISOString();
  }

  return jsonResponse({
    status: overallStatus,
    mode: 'live_with_simulations',
    active_alerts_count: activeAlertsCount ?? 0,
    safe_zones_count: safeZonesCount ?? 0,
    sources_healthy_count: healthySources,
    sources_total_count: sources.length,
    last_successful_refresh: latestSuccess,
    sources,
  });
}
