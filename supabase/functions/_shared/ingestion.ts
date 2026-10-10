import { SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2.45.4';
import { Alert, Source } from './types.ts';
import { logAudit } from './audit.ts';

export function calculateFreshness(
  alert: Alert,
  source?: Source | null
): { freshness_minutes: number; is_stale: boolean } {
  const refTime = alert.retrieved_at || alert.issued_at;
  const alertDate = refTime ? new Date(refTime) : new Date();
  const now = new Date();

  const diffMs = Math.max(0, now.getTime() - alertDate.getTime());
  const minutesAgo = Math.floor(diffMs / (1000 * 60));

  let isStale = false;
  if (source && (source.health_status === 'degraded' || source.health_status === 'unavailable')) {
    isStale = true;
  } else if (minutesAgo > 180) {
    // > 3 hours
    isStale = true;
  }

  return {
    freshness_minutes: minutesAgo,
    is_stale: isStale,
  };
}

export async function toggleSourceHealth(
  supabase: SupabaseClient,
  sourceId: string,
  newStatus: string,
  userId = 'admin'
): Promise<Source> {
  const { data: src, error: srcErr } = await supabase
    .from('sources')
    .select('*')
    .eq('id', sourceId)
    .single();

  if (srcErr || !src) {
    throw new Error(`Source with id ${sourceId} not found`);
  }

  const nowIso = new Date().toISOString();
  const oldStatus = src.health_status;

  const updates: Record<string, unknown> = {
    health_status: newStatus,
    last_attempt_at: nowIso,
  };

  if (newStatus === 'healthy') {
    updates.last_success_at = nowIso;
  }

  const { data: updatedSrc, error: updateErr } = await supabase
    .from('sources')
    .update(updates)
    .eq('id', sourceId)
    .select('*')
    .single();

  if (updateErr || !updatedSrc) {
    throw new Error(`Failed to update source: ${updateErr?.message || 'Unknown error'}`);
  }

  await logAudit(supabase, {
    userId,
    action: 'TOGGLE_SOURCE_HEALTH',
    entityType: 'source',
    entityId: sourceId,
    details: { old_status: oldStatus, new_status: newStatus },
  });

  return updatedSrc as Source;
}

export async function refreshSource(
  supabase: SupabaseClient,
  sourceId: string,
  userId = 'admin'
): Promise<Source> {
  const { data: src, error: srcErr } = await supabase
    .from('sources')
    .select('*')
    .eq('id', sourceId)
    .single();

  if (srcErr || !src) {
    throw new Error(`Source with id ${sourceId} not found`);
  }

  const nowIso = new Date().toISOString();

  const { data: updatedSrc, error: updateErr } = await supabase
    .from('sources')
    .update({
      last_attempt_at: nowIso,
      last_success_at: nowIso,
      health_status: 'healthy',
    })
    .eq('id', sourceId)
    .select('*')
    .single();

  if (updateErr || !updatedSrc) {
    throw new Error(`Failed to refresh source: ${updateErr?.message || 'Unknown error'}`);
  }

  // Update retrieved_at for alerts belonging to this source
  const { data: affectedAlerts } = await supabase
    .from('alerts')
    .update({ retrieved_at: nowIso })
    .eq('source_id', sourceId)
    .select('id');

  const refreshedCount = affectedAlerts?.length ?? 0;

  await logAudit(supabase, {
    userId,
    action: 'REFRESH_SOURCE',
    entityType: 'source',
    entityId: sourceId,
    details: { alerts_refreshed: refreshedCount },
  });

  return updatedSrc as Source;
}
