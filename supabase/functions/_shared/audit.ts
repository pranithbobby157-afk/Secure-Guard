import { SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2.45.4';
import { AuditLog } from './types.ts';

export async function logAudit(
  supabase: SupabaseClient,
  params: {
    userId?: string | null;
    action: string;
    entityType: string;
    entityId?: string | null;
    details?: Record<string, unknown> | null;
  }
): Promise<AuditLog | null> {
  const auditId = `audit-${crypto.randomUUID().replace(/-/g, '').substring(0, 12)}`;
  const nowIso = new Date().toISOString();

  const row = {
    id: auditId,
    user_id: params.userId ?? 'admin',
    action: params.action,
    entity_type: params.entityType,
    entity_id: params.entityId ?? null,
    timestamp: nowIso,
    details_json: params.details ? JSON.stringify(params.details) : null,
  };

  const { data, error } = await supabase.from('audit_logs').insert(row).select('*').single();
  if (error) {
    console.error('Failed to write audit log:', error);
    return null;
  }
  return data as AuditLog;
}
