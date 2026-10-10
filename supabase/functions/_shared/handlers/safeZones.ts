import { SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2.45.4';
import { jsonResponse, errorResponse } from '../cors.ts';
import { annotateSafeZonesWithDistance } from '../geo.ts';
import { SafeZone } from '../types.ts';

export async function handleSafeZones(
  req: Request,
  supabase: SupabaseClient,
  safeZoneId?: string
): Promise<Response> {
  if (safeZoneId) {
    const { data: sz, error } = await supabase
      .from('safe_zones')
      .select('*')
      .eq('id', safeZoneId)
      .maybeSingle();

    if (error) {
      return errorResponse(`Database error: ${error.message}`, 500);
    }
    if (!sz) {
      return errorResponse('Safe zone not found', 404);
    }

    const annotated = annotateSafeZonesWithDistance([sz as SafeZone], null, null);
    return jsonResponse(annotated[0]);
  }

  const url = new URL(req.url);
  const areaId = url.searchParams.get('area_id');
  const userLatParam = url.searchParams.get('user_lat');
  const userLngParam = url.searchParams.get('user_lng');

  const userLat = userLatParam != null && !isNaN(parseFloat(userLatParam))
    ? parseFloat(userLatParam)
    : null;
  const userLng = userLngParam != null && !isNaN(parseFloat(userLngParam))
    ? parseFloat(userLngParam)
    : null;

  let query = supabase.from('safe_zones').select('*');
  if (areaId) {
    query = query.eq('area_id', areaId);
  }

  const { data: safeZones, error } = await query;
  if (error) {
    return errorResponse(`Database error: ${error.message}`, 500);
  }

  const annotated = annotateSafeZonesWithDistance(
    (safeZones || []) as SafeZone[],
    userLat,
    userLng
  );

  return jsonResponse(annotated);
}
