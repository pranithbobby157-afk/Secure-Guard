import { SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2.45.4';
import { User } from './types.ts';

export function getSecretKey(): string {
  const secret =
    (typeof Deno !== 'undefined'
      ? Deno.env.get('SECRET_KEY')
      : undefined) ||
    (typeof process !== 'undefined'
      ? process.env.SECRET_KEY
      : undefined);

  if (!secret || secret.length < 32) {
    throw new Error('SECRET_KEY is missing or too short');
  }

  return secret;
}


export async function sha256Hex(text: string): Promise<string> {
  const enc = new TextEncoder();
  const buf = await crypto.subtle.digest('SHA-256', enc.encode(text));
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

export async function hashPassword(password: string): Promise<string> {
  const salt = 'saferoute_salt_';
  const hex = await sha256Hex(salt + password);
  return `sha256$${hex}`;
}

export function constantTimeCompare(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let mismatch = 0;
  for (let i = 0; i < a.length; i++) {
    mismatch |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return mismatch === 0;
}

export async function verifyPassword(
  plainPassword: string,
  hashedPassword: string
): Promise<boolean> {
  const expected = await hashPassword(plainPassword);
  return constantTimeCompare(expected, hashedPassword);
}

function toUrlSafeBase64(str: string): string {
  const bytes = new TextEncoder().encode(str);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_');
}

function fromUrlSafeBase64(b64: string): string {
  let standard = b64.replace(/-/g, '+').replace(/_/g, '/');
  while (standard.length % 4 !== 0) {
    standard += '=';
  }
  const binary = atob(standard);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return new TextDecoder().decode(bytes);
}

export async function hmacSha256(keyStr: string, dataStr: string): Promise<string> {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    enc.encode(keyStr),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const sigBuf = await crypto.subtle.sign('HMAC', key, enc.encode(dataStr));
  return Array.from(new Uint8Array(sigBuf))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

export async function createAccessToken(
  data: Record<string, unknown>,
  expiresInSeconds = 86400
): Promise<string> {
  const payload = { ...data };
  payload.exp = Math.floor(Date.now() / 1000) + expiresInSeconds;

  const rawJson = JSON.stringify(payload);
  const b64Payload = toUrlSafeBase64(rawJson);
  const secret = getSecretKey();
  const sig = await hmacSha256(secret, b64Payload);

  return `${b64Payload}.${sig}`;
}

export async function decodeAccessToken(
  token: string
): Promise<Record<string, unknown> | null> {
  const secret = getSecretKey();

  try {
    const parts = token.split('.');
    if (parts.length !== 2) return null;
    const [b64Payload, sig] = parts;

    const expectedSig = await hmacSha256(secret, b64Payload);
    if (!constantTimeCompare(sig, expectedSig)) {
      return null;
    }

    const jsonStr = fromUrlSafeBase64(b64Payload);
    const payload = JSON.parse(jsonStr);

    if (!payload || typeof payload !== 'object') {
      return null;
    }

    const now = Math.floor(Date.now() / 1000);
    if (typeof payload.exp !== 'number' || payload.exp < now) {
      return null;
    }

    if (!payload.sub || typeof payload.sub !== 'string') {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}

export async function authenticateUser(
  req: Request,
  supabase: SupabaseClient
): Promise<{ user: User | null; error?: string; status?: number }> {
  const authHeader = req.headers.get('Authorization') || req.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return {
      user: null,
      error: 'Missing or invalid authentication token',
      status: 401,
    };
  }

  const token = authHeader.substring(7).trim();
  const payload = await decodeAccessToken(token);
  if (!payload || !payload.sub) {
    return {
      user: null,
      error: 'Token has expired or is invalid',
      status: 401,
    };
  }

  const username = String(payload.sub);
  const { data: user, error: dbErr } = await supabase
    .from('users')
    .select('*')
    .eq('username', username)
    .maybeSingle();

  if (dbErr || !user) {
    return {
      user: null,
      error: 'User not found',
      status: 401,
    };
  }

  return { user: user as User };
}
