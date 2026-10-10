import { SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2.45.4';
import { jsonResponse, errorResponse } from '../cors.ts';

export async function handleDemo(
  req: Request,
  supabase: SupabaseClient
): Promise<Response> {
  if (req.method.toUpperCase() !== 'POST') {
    return errorResponse('Method not allowed', 405);
  }

  let body: any;
  try {
    body = await req.json();
  } catch {
    return errorResponse('Invalid JSON body', 400);
  }

  const scenario = body?.scenario;
  if (!scenario) {
    return errorResponse('Missing scenario parameter', 400);
  }

  if (scenario === 'all_clear') {
    await supabase.from('alerts').update({ status: 'cancelled' }).neq('id', '');
    await supabase.from('sources').update({ health_status: 'healthy' }).neq('id', '');

    return jsonResponse({
      scenario: 'all_clear',
      message:
        'All alerts marked cancelled. SafeRoute displays no-active-alerts state with disclaimer.',
    });
  }

  if (scenario === 'cyclone_active' || scenario === 'default') {
    await supabase.from('alerts').update({ status: 'active' }).neq('id', '');
    await supabase.from('sources').update({ health_status: 'healthy' }).neq('id', '');

    return jsonResponse({
      scenario,
      message: 'Active crisis alerts restored with healthy source feeds.',
    });
  }

  if (scenario === 'source_outage') {
    await supabase.from('alerts').update({ status: 'active' }).neq('id', '');
    await supabase.from('sources').update({ health_status: 'healthy' }).neq('id', 'source-imd');
    await supabase.from('sources').update({ health_status: 'degraded' }).eq('id', 'source-imd');

    return jsonResponse({
      scenario: 'source_outage',
      message:
        'IMD feed marked degraded. Frontend will display explicit stale-data warning.',
    });
  }

  return jsonResponse({
    scenario,
    message: 'Unknown scenario',
  });
}
