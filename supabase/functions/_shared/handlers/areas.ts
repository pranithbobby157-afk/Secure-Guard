import { SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2.45.4';
import { jsonResponse, errorResponse } from '../cors.ts';

export async function handleAreas(
  _req: Request,
  supabase: SupabaseClient,
  areaId?: string
): Promise<Response> {
  if (areaId) {
    const { data: area, error } = await supabase
      .from('areas')
      .select('*')
      .eq('id', areaId)
      .maybeSingle();

    if (error) {
      return errorResponse(`Database error: ${error.message}`, 500);
    }
    if (!area) {
      return errorResponse('Area not found', 404);
    }
    return jsonResponse(area);
  }

  const { data: areas, error } = await supabase.from('areas').select('*');
  if (error) {
    return errorResponse(`Database error: ${error.message}`, 500);
  }
  return jsonResponse(areas || []);
}
