import { SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2.45.4';
import { jsonResponse, errorResponse } from '../cors.ts';
import { verifyPassword, createAccessToken, authenticateUser } from '../security.ts';
import { User } from '../types.ts';

export async function handleAuth(
  req: Request,
  supabase: SupabaseClient,
  action?: string
): Promise<Response> {
  const method = req.method.toUpperCase();

  // POST /auth/login
  if (action === 'login' && method === 'POST') {
    let body: any;
    try {
      body = await req.json();
    } catch {
      return errorResponse('Invalid JSON body', 400);
    }

    const { username, password } = body || {};
    if (!username || !password) {
      return errorResponse('Missing username or password', 400);
    }

    const { data: user, error: dbErr } = await supabase
      .from('users')
      .select('*')
      .eq('username', username)
      .maybeSingle();

    if (dbErr || !user) {
      return errorResponse('Invalid username or password', 401);
    }

    const isValid = await verifyPassword(password, user.password_hash);
    if (!isValid) {
      return errorResponse('Invalid username or password', 401);
    }

    const token = await createAccessToken({
      sub: user.username,
      role: user.role,
    });

    return jsonResponse({
      access_token: token,
      token_type: 'bearer',
      role: user.role,
      username: user.username,
    });
  }

  // GET /auth/me
  if (action === 'me' && method === 'GET') {
    const authResult = await authenticateUser(req, supabase);
    if (authResult.error || !authResult.user) {
      return errorResponse(authResult.error || 'Unauthorized', authResult.status || 401);
    }

    const user = authResult.user as User;
    return jsonResponse({
      id: user.id,
      username: user.username,
      role: user.role,
      created_at: user.created_at,
    });
  }

  // POST /auth/logout
  if (action === 'logout' && method === 'POST') {
    return jsonResponse({ message: 'Successfully logged out' });
  }

  return errorResponse('Not found', 404);
}
