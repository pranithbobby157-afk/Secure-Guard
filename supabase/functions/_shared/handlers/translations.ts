import { SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2.45.4';
import { jsonResponse, errorResponse } from '../cors.ts';
import { getOrCreateTranslation } from '../translation.ts';
import { Alert } from '../types.ts';

export async function handleTranslations(
  req: Request,
  supabase: SupabaseClient,
  alertId?: string
): Promise<Response> {
  if (!alertId) {
    return errorResponse('Missing alert ID in path', 400);
  }

  const url = new URL(req.url);
  const language = url.searchParams.get('language');

  if (!language) {
    return errorResponse('Missing required query parameter: language', 400);
  }

  const { data: alert, error: alertErr } = await supabase
    .from('alerts')
    .select('*')
    .eq('id', alertId)
    .maybeSingle();

  if (alertErr) {
    return errorResponse(`Database error: ${alertErr.message}`, 500);
  }
  if (!alert) {
    return errorResponse('Alert not found', 404);
  }

  if (language === alert.original_language) {
    return errorResponse(
      `Target language '${language}' matches alert's original language '${alert.original_language}'`,
      400
    );
  }

  const translation = await getOrCreateTranslation(supabase, alert as Alert, language);
  if (!translation) {
    return errorResponse(`Failed to generate translation for language: ${language}`, 500);
  }

  return jsonResponse(translation);
}
