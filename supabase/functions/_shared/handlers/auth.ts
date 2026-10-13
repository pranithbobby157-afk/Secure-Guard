import { SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2.45.4';
import { jsonResponse, errorResponse } from '../cors.ts';
import { verifyPassword, hashPassword, createAccessToken, authenticateUser } from '../security.ts';
import { logAudit } from '../audit.ts';
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

  // POST /auth/signup
  if (action === 'signup' && method === 'POST') {
    let body: any;
    try {
      body = await req.json();
    } catch {
      return errorResponse('Invalid JSON body', 400);
    }

    const { username, password, email } = body || {};
    const finalUsername = (username || email || '').trim();
    if (!finalUsername || !password) {
      return errorResponse('Missing username or password', 400);
    }

    if (password.length < 8) {
      return errorResponse('Password must be at least 8 characters long', 400);
    }

    // Check if user already exists
    const { data: existing } = await supabase
      .from('users')
      .select('id')
      .eq('username', finalUsername)
      .maybeSingle();

    if (existing) {
      return errorResponse('Username or email already registered', 400);
    }

    const assignedRole = finalUsername.toLowerCase() === 'rohithkarthik25@gmail.com' ? 'admin' : 'user';
    const pwdHash = await hashPassword(password);
    const userId = `user-${crypto.randomUUID().replace(/-/g, '').substring(0, 10)}`;

    const newUser = {
      id: userId,
      username: finalUsername,
      password_hash: pwdHash,
      role: assignedRole,
      created_at: new Date().toISOString(),
    };

    const { error: insErr } = await supabase.from('users').insert(newUser);
    if (insErr) {
      return errorResponse(`Registration failed: ${insErr.message}`, 500);
    }

    const token = await createAccessToken({
      sub: finalUsername,
      role: assignedRole,
    });

    await logAudit(supabase, {
      userId: userId,
      action: 'USER_REGISTER',
      entityType: 'user',
      entityId: userId,
      details: { username: finalUsername, role: assignedRole },
    });

    return jsonResponse({
      access_token: token,
      token_type: 'bearer',
      role: assignedRole,
      username: finalUsername,
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

  // POST /auth/change-password
  if (action === 'change-password' && method === 'POST') {
    const authResult = await authenticateUser(req, supabase);
    if (authResult.error || !authResult.user) {
      return errorResponse(authResult.error || 'Unauthorized', authResult.status || 401);
    }
    const user = authResult.user as User;

    let body: any;
    try {
      body = await req.json();
    } catch {
      return errorResponse('Invalid JSON body', 400);
    }

    const { old_password, new_password } = body || {};
    if (!old_password || !new_password) {
      return errorResponse('Missing old_password or new_password', 400);
    }

    if (typeof new_password !== 'string' || new_password.length < 8) {
      return errorResponse('New password must be at least 8 characters long', 400);
    }

    const isValid = await verifyPassword(old_password, user.password_hash);
    if (!isValid) {
      return errorResponse('Current password is incorrect', 400);
    }

    const newHash = await hashPassword(new_password);
    const { error: updateErr } = await supabase
      .from('users')
      .update({ password_hash: newHash })
      .eq('id', user.id);

    if (updateErr) {
      return errorResponse(`Failed to update password: ${updateErr.message}`, 500);
    }

    await logAudit(supabase, {
      userId: user.id,
      action: 'CHANGE_PASSWORD',
      entityType: 'user',
      entityId: user.id,
      details: { username: user.username },
    });

    return jsonResponse({ message: 'Password updated successfully' });
  }

  // POST /auth/logout
  if (action === 'logout' && method === 'POST') {
    return jsonResponse({ message: 'Successfully logged out' });
  }

  return errorResponse('Not found', 404);
}
