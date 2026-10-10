import { SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2.45.4';
import { jsonResponse, errorResponse } from '../cors.ts';

export async function handleContacts(
  req: Request,
  supabase: SupabaseClient
): Promise<Response> {
  const url = new URL(req.url);
  const areaId = url.searchParams.get('area_id');

  let query = supabase.from('emergency_contacts').select('*');
  if (areaId) {
    query = query.eq('area_id', areaId);
  }

  const { data: contacts, error } = await query;
  if (error) {
    return errorResponse(`Database error: ${error.message}`, 500);
  }

  return jsonResponse(contacts || []);
}
