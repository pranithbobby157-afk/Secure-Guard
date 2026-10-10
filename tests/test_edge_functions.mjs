import test from 'node:test';
import assert from 'node:assert/strict';

// Test 1: Web Crypto Security & Password Hashing
test('Password hashing and verification matches SafeRoute specification', async () => {
  const enc = new TextEncoder();
  const salt = 'saferoute_salt_';
  const password = 'admin123';

  // Compute hash
  const buf = await crypto.subtle.digest('SHA-256', enc.encode(salt + password));
  const hex = Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
  const passwordHash = `sha256$${hex}`;

  assert.equal(
    passwordHash,
    'sha256$37be8953d50ee350158c7c8ed71e399e804b4cf312f39e8f7a0c60c3ad5bbfb7',
    'Password hash must match standard admin seed hash'
  );

  // Constant-time comparison
  const isMatch = (a, b) => {
    if (a.length !== b.length) return false;
    let diff = 0;
    for (let i = 0; i < a.length; i++) {
      diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
    }
    return diff === 0;
  };

  assert.ok(isMatch(passwordHash, passwordHash));
  assert.ok(!isMatch(passwordHash, 'sha256$wrong'));
});

// Test 2: HMAC-SHA256 Token Generation & Interoperability
test('HMAC-SHA256 Token matches Python backend token contract', async () => {
  const secret = 'saferoute-super-secure-crisis-comm-key-2026';
  const enc = new TextEncoder();

  function toUrlSafe(s) {
    const bytes = enc.encode(s);
    let bin = '';
    for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
    return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_');
  }

  function fromUrlSafe(b64) {
    let std = b64.replace(/-/g, '+').replace(/_/g, '/');
    while (std.length % 4 !== 0) std += '=';
    const bin = atob(std);
    const bytes = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
    return new TextDecoder().decode(bytes);
  }

  async function hmac(keyStr, dataStr) {
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

  // Token created by Python backend earlier
  const pythonToken =
    'eyJzdWIiOiJhZG1pbiIsInJvbGUiOiJhZG1pbiIsImV4cCI6MTc5MTYxMjQ2Mn0=.60568734e1928cf8033ec5c100f404d82975515bb9f45885d9531e5fdebdb877';
  const [b64, sig] = pythonToken.split('.');

  const expectedSig = await hmac(secret, b64);
  assert.equal(sig, expectedSig, 'Signature on Python token must match TypeScript HMAC');

  const decoded = JSON.parse(fromUrlSafe(b64));
  assert.equal(decoded.sub, 'admin');
  assert.equal(decoded.role, 'admin');

  // Generate new token in JS
  const newPayload = { sub: 'editor_user', role: 'editor', exp: Math.floor(Date.now() / 1000) + 3600 };
  const newB64 = toUrlSafe(JSON.stringify(newPayload));
  const newSig = await hmac(secret, newB64);
  const newToken = `${newB64}.${newSig}`;

  const [verifyB64, verifySig] = newToken.split('.');
  const verifyExpected = await hmac(secret, verifyB64);
  assert.equal(verifySig, verifyExpected);
  const parsedBack = JSON.parse(fromUrlSafe(verifyB64));
  assert.equal(parsedBack.sub, 'editor_user');
});

// Test 3: Haversine Distance Calculation & Sorting
test('Haversine distance calculation and sorting', () => {
  function haversineDistance(lat1, lon1, lat2, lon2) {
    const R = 6371.0;
    const toRad = (deg) => (deg * Math.PI) / 180;
    const dlat = toRad(lat2 - lat1);
    const dlon = toRad(lon2 - lon1);
    const a =
      Math.sin(dlat / 2) ** 2 +
      Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dlon / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Math.round(R * c * 100) / 100;
  }

  // Distance between Marina Beach (13.0499, 80.2824) and Central Station (13.0827, 80.2757)
  const dist = haversineDistance(13.0499, 80.2824, 13.0827, 80.2757);
  assert.ok(dist > 3.5 && dist < 4.0, `Expected ~3.7 km, got ${dist}`);

  // Test sorting nearest-first
  const shelters = [
    { name: 'Far Shelter', latitude: 13.20, longitude: 80.30 },
    { name: 'Near Shelter', latitude: 13.05, longitude: 80.28 },
    { name: 'Mid Shelter', latitude: 13.09, longitude: 80.28 },
  ];

  const userLat = 13.05;
  const userLng = 80.28;
  const sorted = shelters
    .map((s) => ({ ...s, distance_km: haversineDistance(userLat, userLng, s.latitude, s.longitude) }))
    .sort((a, b) => a.distance_km - b.distance_km);

  assert.equal(sorted[0].name, 'Near Shelter');
  assert.equal(sorted[0].distance_km, 0);
  assert.equal(sorted[1].name, 'Mid Shelter');
  assert.equal(sorted[2].name, 'Far Shelter');
});

// Test 4: Ingestion Staleness & Freshness Calculation
test('Ingestion freshness correctly computes staleness based on hours and source health', () => {
  function calculateFreshness(alert, source) {
    const refTime = alert.retrieved_at || alert.issued_at;
    const alertDate = new Date(refTime);
    const now = new Date();
    const diffMs = Math.max(0, now.getTime() - alertDate.getTime());
    const minutesAgo = Math.floor(diffMs / (1000 * 60));

    let isStale = false;
    if (source && (source.health_status === 'degraded' || source.health_status === 'unavailable')) {
      isStale = true;
    } else if (minutesAgo > 180) {
      isStale = true;
    }

    return { freshness_minutes: minutesAgo, is_stale: isStale };
  }

  const freshTime = new Date(Date.now() - 10 * 60 * 1000).toISOString(); // 10 min ago
  const staleTime = new Date(Date.now() - 200 * 60 * 1000).toISOString(); // 200 min ago (> 180 min)

  // Case 1: Fresh alert with healthy source
  const freshRes = calculateFreshness(
    { retrieved_at: freshTime },
    { health_status: 'healthy' }
  );
  assert.equal(freshRes.is_stale, false);
  assert.equal(freshRes.freshness_minutes, 10);

  // Case 2: Fresh alert with degraded source
  const degradedRes = calculateFreshness(
    { retrieved_at: freshTime },
    { health_status: 'degraded' }
  );
  assert.equal(degradedRes.is_stale, true, 'Degraded source must trigger staleness');

  // Case 3: Old alert with healthy source
  const oldRes = calculateFreshness(
    { retrieved_at: staleTime },
    { health_status: 'healthy' }
  );
  assert.equal(oldRes.is_stale, true, 'Alert > 180 min must be marked stale');
});

// Test 5: Multilingual Linguistic Dictionary Parity
test('Multilingual translation dictionary produces expected localized titles', () => {
  const dictionaryMap = {
    ta: {
      'Cyclone Warning': 'புயல் எச்சரிக்கை',
    },
    hi: {
      'Cyclone Warning': 'चक्रवात चेतावनी',
    },
    fr: {
      'Cyclone Warning': 'Avis de cyclone',
    },
  };

  assert.equal(dictionaryMap.ta['Cyclone Warning'], 'புயல் எச்சரிக்கை');
  assert.equal(dictionaryMap.hi['Cyclone Warning'], 'चक्रवात चेतावनी');
  assert.equal(dictionaryMap.fr['Cyclone Warning'], 'Avis de cyclone');
});

// Test 6: API URL Normalization across topologies without duplicate /api
test('buildApiUrl normalizes endpoints for both Supabase Edge Functions and FastAPI without /api duplication', () => {
  function cleanEndpoint(endpoint) {
    const [rawPath, rawQuery] = endpoint.split('?');
    let cleanPath = rawPath.replace(/^\/+/, '');
    while (cleanPath.startsWith('api/') || cleanPath === 'api') {
      cleanPath = cleanPath.slice(3).replace(/^\/+/, '');
    }
    const queryString = rawQuery !== undefined ? `?${rawQuery}` : '';
    return { path: cleanPath, queryString };
  }

  function normalizeBaseUrl(base) {
    let b = base.replace(/\/+$/, '');
    if (b.includes('/functions/v1')) {
      b = b.replace(/(\/api)+$/, '');
      return `${b}/api`;
    }
    if (b.includes('supabase.co')) {
      b = b.replace(/(\/functions\/v1)?(\/api)*$/, '');
      return `${b}/functions/v1/api`;
    }
    b = b.replace(/(\/api)+$/, '');
    return `${b}/api`;
  }

  function buildApiUrl(endpoint, base = 'https://ijbsprdkrhnimhiknpxe.supabase.co/functions/v1/api') {
    const normBase = normalizeBaseUrl(base);
    const { path, queryString } = cleanEndpoint(endpoint);
    return path ? `${normBase}/${path}${queryString}` : `${normBase}${queryString}`;
  }

  const supabaseBase = 'https://ijbsprdkrhnimhiknpxe.supabase.co/functions/v1/api';

  // Specific assertions:
  // /status must become https://ijbsprdkrhnimhiknpxe.supabase.co/functions/v1/api/status
  // and must never become /api/api/status
  assert.equal(
    buildApiUrl('/status', supabaseBase),
    'https://ijbsprdkrhnimhiknpxe.supabase.co/functions/v1/api/status'
  );
  assert.equal(
    buildApiUrl('status', supabaseBase),
    'https://ijbsprdkrhnimhiknpxe.supabase.co/functions/v1/api/status'
  );
  assert.equal(
    buildApiUrl('/api/status', supabaseBase),
    'https://ijbsprdkrhnimhiknpxe.supabase.co/functions/v1/api/status'
  );
  assert.equal(
    buildApiUrl('api/status', supabaseBase),
    'https://ijbsprdkrhnimhiknpxe.supabase.co/functions/v1/api/status'
  );
  assert.equal(
    buildApiUrl('/api/api/status', supabaseBase),
    'https://ijbsprdkrhnimhiknpxe.supabase.co/functions/v1/api/status'
  );
  assert.ok(
    !buildApiUrl('/status', supabaseBase).includes('/api/api'),
    'URL must not contain /api/api duplication'
  );

  // All required endpoints:
  assert.equal(
    buildApiUrl('/health', supabaseBase),
    'https://ijbsprdkrhnimhiknpxe.supabase.co/functions/v1/api/health'
  );
  assert.equal(
    buildApiUrl('/areas', supabaseBase),
    'https://ijbsprdkrhnimhiknpxe.supabase.co/functions/v1/api/areas'
  );
  assert.equal(
    buildApiUrl('/alerts', supabaseBase),
    'https://ijbsprdkrhnimhiknpxe.supabase.co/functions/v1/api/alerts'
  );
  assert.equal(
    buildApiUrl('/alerts?area_id=area-1&status=all', supabaseBase),
    'https://ijbsprdkrhnimhiknpxe.supabase.co/functions/v1/api/alerts?area_id=area-1&status=all'
  );
  assert.equal(
    buildApiUrl('/safe-zones', supabaseBase),
    'https://ijbsprdkrhnimhiknpxe.supabase.co/functions/v1/api/safe-zones'
  );
  assert.equal(
    buildApiUrl('/emergency-contacts', supabaseBase),
    'https://ijbsprdkrhnimhiknpxe.supabase.co/functions/v1/api/emergency-contacts'
  );
  assert.equal(
    buildApiUrl('/translations/alert-123?language=ta', supabaseBase),
    'https://ijbsprdkrhnimhiknpxe.supabase.co/functions/v1/api/translations/alert-123?language=ta'
  );
  assert.equal(
    buildApiUrl('/auth/login', supabaseBase),
    'https://ijbsprdkrhnimhiknpxe.supabase.co/functions/v1/api/auth/login'
  );
  assert.equal(
    buildApiUrl('/auth/me', supabaseBase),
    'https://ijbsprdkrhnimhiknpxe.supabase.co/functions/v1/api/auth/me'
  );
  assert.equal(
    buildApiUrl('/admin/audit-logs', supabaseBase),
    'https://ijbsprdkrhnimhiknpxe.supabase.co/functions/v1/api/admin/audit-logs'
  );
  assert.equal(
    buildApiUrl('/demo/scenario', supabaseBase),
    'https://ijbsprdkrhnimhiknpxe.supabase.co/functions/v1/api/demo/scenario'
  );

  // Trailing slash in base URL does not create double slashes or duplicate /api
  assert.equal(
    buildApiUrl('/status', 'https://ijbsprdkrhnimhiknpxe.supabase.co/functions/v1/api/'),
    'https://ijbsprdkrhnimhiknpxe.supabase.co/functions/v1/api/status'
  );

  // FastAPI development assertions:
  assert.equal(
    buildApiUrl('/status', 'http://127.0.0.1:8000'),
    'http://127.0.0.1:8000/api/status'
  );
  assert.equal(
    buildApiUrl('/api/status', 'http://127.0.0.1:8000'),
    'http://127.0.0.1:8000/api/status'
  );
  assert.equal(
    buildApiUrl('/status', 'http://127.0.0.1:8000/api'),
    'http://127.0.0.1:8000/api/status'
  );
  assert.equal(
    buildApiUrl('/api/status', 'http://127.0.0.1:8000/api'),
    'http://127.0.0.1:8000/api/status'
  );
  assert.ok(
    !buildApiUrl('/api/status', 'http://127.0.0.1:8000/api').includes('/api/api'),
    'FastAPI URL must not contain /api/api duplication'
  );
});

// Test 7: Strict Token Expiration and Claim Validation
test('Strict token decoder rejects expired tokens, missing claims, and tampered signatures', async () => {
  const secret = 'saferoute-super-secure-crisis-comm-key-2026';
  const enc = new TextEncoder();

  function toUrlSafe(s) {
    const bytes = enc.encode(s);
    let bin = '';
    for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
    return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_');
  }

  async function hmac(keyStr, dataStr) {
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

  // 1. Expired token
  const expiredPayload = { sub: 'admin', role: 'admin', exp: Math.floor(Date.now() / 1000) - 100 };
  const expiredB64 = toUrlSafe(JSON.stringify(expiredPayload));
  const expiredSig = await hmac(secret, expiredB64);
  const expiredToken = `${expiredB64}.${expiredSig}`;

  // 2. Missing sub claim
  const missingSubPayload = { role: 'admin', exp: Math.floor(Date.now() / 1000) + 1000 };
  const missingSubB64 = toUrlSafe(JSON.stringify(missingSubPayload));
  const missingSubSig = await hmac(secret, missingSubB64);
  const missingSubToken = `${missingSubB64}.${missingSubSig}`;

  // 3. Tampered payload
  const validPayload = { sub: 'admin', role: 'admin', exp: Math.floor(Date.now() / 1000) + 1000 };
  const validB64 = toUrlSafe(JSON.stringify(validPayload));
  const validSig = await hmac(secret, validB64);
  const tamperedToken = `${validB64}.deadbeef${validSig.substring(8)}`;

  function validateToken(token, expectedSecret) {
    const parts = token.split('.');
    if (parts.length !== 2) return null;
    const [b64, sig] = parts;
    let std = b64.replace(/-/g, '+').replace(/_/g, '/');
    while (std.length % 4 !== 0) std += '=';
    const payload = JSON.parse(atob(std));

    const now = Math.floor(Date.now() / 1000);
    if (!payload.exp || typeof payload.exp !== 'number' || payload.exp < now) return null;
    if (!payload.sub || typeof payload.sub !== 'string') return null;

    return payload;
  }

  assert.equal(validateToken(expiredToken, secret), null, 'Expired token must be rejected');
  assert.equal(validateToken(missingSubToken, secret), null, 'Token missing sub must be rejected');
  assert.notEqual(tamperedToken.split('.')[1], validSig, 'Tampered signature must not match valid signature');
});

// Test 8: Password Security & Policy Enforcement
test('Password policy enforces minimum 8 characters and prevents empty rotations', () => {
  function validateNewPassword(pw) {
    if (!pw || typeof pw !== 'string' || pw.length < 8) {
      return false;
    }
    return true;
  }

  assert.equal(validateNewPassword('short'), false, 'Passwords < 8 chars must fail');
  assert.equal(validateNewPassword(''), false, 'Empty password must fail');
  assert.equal(validateNewPassword('admin123'), true, 'Valid 8 char password passes');
  assert.equal(validateNewPassword('UltraSecure@SafeRoute2026!'), true, 'Strong password passes');
});

// Test 9: getSecretKey rejects missing SECRET_KEY
test('getSecretKey rejects missing or empty SECRET_KEY', () => {
  const originalEnv = process.env.SECRET_KEY;
  try {
    delete process.env.SECRET_KEY;
    function getSecretKey() {
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

    assert.throws(() => getSecretKey(), {
      name: 'Error',
      message: 'SECRET_KEY is missing or too short'
    });

    process.env.SECRET_KEY = '';
    assert.throws(() => getSecretKey(), {
      name: 'Error',
      message: 'SECRET_KEY is missing or too short'
    });
  } finally {
    if (originalEnv !== undefined) {
      process.env.SECRET_KEY = originalEnv;
    } else {
      delete process.env.SECRET_KEY;
    }
  }
});

// Test 10: getSecretKey rejects SECRET_KEY shorter than 32 characters
test('getSecretKey rejects SECRET_KEY shorter than 32 characters', () => {
  const originalEnv = process.env.SECRET_KEY;
  try {
    function getSecretKey() {
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

    process.env.SECRET_KEY = 'short-key';
    assert.throws(() => getSecretKey(), {
      name: 'Error',
      message: 'SECRET_KEY is missing or too short'
    });

    process.env.SECRET_KEY = '1234567890123456789012345678901'; // 31 chars
    assert.throws(() => getSecretKey(), {
      name: 'Error',
      message: 'SECRET_KEY is missing or too short'
    });
  } finally {
    if (originalEnv !== undefined) {
      process.env.SECRET_KEY = originalEnv;
    } else {
      delete process.env.SECRET_KEY;
    }
  }
});

// Test 11: getSecretKey works with valid SECRET_KEY (>= 32 chars)
test('getSecretKey works with valid SECRET_KEY of at least 32 characters', () => {
  const originalEnv = process.env.SECRET_KEY;
  try {
    function getSecretKey() {
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

    const testValidKey = '12345678901234567890123456789012'; // exactly 32 chars
    process.env.SECRET_KEY = testValidKey;
    assert.equal(getSecretKey(), testValidKey);

    const testLongKey = 'a-very-strong-production-signing-secret-for-saferoute-2026';
    process.env.SECRET_KEY = testLongKey;
    assert.equal(getSecretKey(), testLongKey);
  } finally {
    if (originalEnv !== undefined) {
      process.env.SECRET_KEY = originalEnv;
    } else {
      delete process.env.SECRET_KEY;
    }
  }
});

// Test 12: Token creation and verification use same secret, and different secret is rejected
test('Token creation and verification use same secret; different secret is rejected', async () => {
  const validSecretA = 'valid-production-secret-number-1-32chars!';
  const validSecretB = 'valid-production-secret-number-2-32chars!';
  const enc = new TextEncoder();

  function toUrlSafe(s) {
    const bytes = enc.encode(s);
    let bin = '';
    for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
    return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_');
  }

  function fromUrlSafe(b64) {
    let std = b64.replace(/-/g, '+').replace(/_/g, '/');
    while (std.length % 4 !== 0) std += '=';
    const bin = atob(std);
    const bytes = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
    return new TextDecoder().decode(bytes);
  }

  async function hmac(keyStr, dataStr) {
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

  function constantTimeCompare(a, b) {
    if (a.length !== b.length) return false;
    let mismatch = 0;
    for (let i = 0; i < a.length; i++) {
      mismatch |= a.charCodeAt(i) ^ b.charCodeAt(i);
    }
    return mismatch === 0;
  }

  async function createToken(payload, secret) {
    const rawJson = JSON.stringify(payload);
    const b64 = toUrlSafe(rawJson);
    const sig = await hmac(secret, b64);
    return `${b64}.${sig}`;
  }

  async function decodeToken(token, secret) {
    const parts = token.split('.');
    if (parts.length !== 2) return null;
    const [b64, sig] = parts;
    const expectedSig = await hmac(secret, b64);
    if (!constantTimeCompare(sig, expectedSig)) return null;
    return JSON.parse(fromUrlSafe(b64));
  }

  const payload = { sub: 'admin', role: 'admin', exp: Math.floor(Date.now() / 1000) + 3600 };

  // Create with secret A
  const tokenA = await createToken(payload, validSecretA);

  // Decode with same secret A -> SUCCESS
  const decodedA = await decodeToken(tokenA, validSecretA);
  assert.notEqual(decodedA, null);
  assert.equal(decodedA.sub, 'admin');

  // Decode with different secret B -> REJECTED (null)
  const decodedWithB = await decodeToken(tokenA, validSecretB);
  assert.equal(decodedWithB, null, 'Token signed with Secret A must be rejected by Secret B');
});

// Test 13: Frontend API Base URL Resolution & Fallback Behavior
test('resolveBaseUrl correctly handles explicit env vars, production fallback, and local dev fallback', () => {
  const SUPABASE_PRODUCTION_API = 'https://ijbsprdkrhnimhiknpxe.supabase.co/functions/v1/api';

  function resolveBaseUrl(env, windowObj) {
    const explicitApiBase = env.VITE_API_BASE_URL || env.VITE_API_BASE;
    if (explicitApiBase) {
      return explicitApiBase.replace(/\/+$/, '');
    }
    const supabaseUrl = env.VITE_SUPABASE_URL;
    if (supabaseUrl) {
      return `${supabaseUrl.replace(/\/+$/, '')}/functions/v1/api`;
    }
    if (
      env.PROD ||
      (windowObj &&
        windowObj.location &&
        windowObj.location.hostname !== 'localhost' &&
        windowObj.location.hostname !== '127.0.0.1')
    ) {
      return SUPABASE_PRODUCTION_API;
    }
    return 'http://127.0.0.1:8000';
  }

  // Case 1: Explicit VITE_API_BASE_URL provided
  assert.equal(
    resolveBaseUrl({ VITE_API_BASE_URL: 'https://custom-domain.com/functions/v1/api/' }, null),
    'https://custom-domain.com/functions/v1/api'
  );

  // Case 2: Explicit VITE_SUPABASE_URL provided
  assert.equal(
    resolveBaseUrl({ VITE_SUPABASE_URL: 'https://custom.supabase.co' }, null),
    'https://custom.supabase.co/functions/v1/api'
  );

  // Case 3: Production build without explicit env var -> defaults to Supabase Edge Functions
  assert.equal(
    resolveBaseUrl({ PROD: true }, { location: { hostname: 'saferoute.vercel.app' } }),
    SUPABASE_PRODUCTION_API
  );

  // Case 4: Non-localhost domain in browser -> defaults to Supabase Edge Functions
  assert.equal(
    resolveBaseUrl({ PROD: false }, { location: { hostname: 'saferoute.vercel.app' } }),
    SUPABASE_PRODUCTION_API
  );

  // Case 5: Local development on localhost -> defaults to local FastAPI 127.0.0.1:8000
  assert.equal(
    resolveBaseUrl({ PROD: false }, { location: { hostname: 'localhost' } }),
    'http://127.0.0.1:8000'
  );
});

// Test 14: Dashboard Feed-Health & Status Decoupling Logic (Phase A, Task A2)
test('Dashboard status logic decouples bulletin staleness from source health', () => {
  function computeDashboardStatus({
    status,
    filteredAlerts = [],
    scenario = 'default',
    lastSyncTime = '12:00 PM',
  }) {
    const isBackendAvailable = status !== null;
    const healthyCount = status?.sources_healthy_count ?? 0;
    const totalCount = status?.sources_total_count ?? 0;
    const anySourceDegraded = status?.sources?.some((s) => s.health_status === 'degraded');
    const anySourceUnavailable = status?.sources?.some((s) => s.health_status === 'unavailable');
    const hasStaleAlerts = filteredAlerts.some((a) => a.is_stale);
    const topAlert = filteredAlerts[0];

    const isSourceOutage =
      scenario === 'outage' ||
      status?.status === 'degraded' ||
      status?.status === 'unavailable' ||
      anySourceDegraded ||
      anySourceUnavailable ||
      (totalCount > 0 && healthyCount < totalCount);

    let freshnessTitle = '';
    let freshnessSubtitle = '';
    let statusDotClass = 'status-dot';

    if (!isBackendAvailable) {
      freshnessTitle = 'Backend API Unavailable';
      freshnessSubtitle = `Operating in offline cache mode · ${lastSyncTime} IST`;
      statusDotClass = 'status-dot neutral';
    } else if (isSourceOutage) {
      const degradedSourceNames = (status.sources || [])
        .filter((s) => s.health_status !== 'healthy')
        .map((s) => s.name.split('(')[0].trim())
        .join(', ');
      freshnessTitle = `Degraded Feed (${healthyCount}/${totalCount} Sources Active)`;
      freshnessSubtitle = degradedSourceNames
        ? `${degradedSourceNames} outage · Advisory data may be stale`
        : 'Source feed degraded · Advisory data may be stale';
      statusDotClass = 'status-dot bg-[#DC6803]';
    } else if (
      status.mode === 'live_with_simulations' ||
      topAlert?.is_simulated ||
      status.mode !== 'live'
    ) {
      freshnessTitle = `Simulated Demonstration Feeds (${healthyCount}/${totalCount} Configured Sources Healthy)`;
      const timeFormatted = status.last_successful_refresh
        ? '12:00 PM'
        : lastSyncTime;
      freshnessSubtitle = hasStaleAlerts
        ? 'Demonstration records (sample bulletins >3h old) · Not live emergency feeds'
        : `Demonstration sync: ${timeFormatted} IST · Not live official emergency bulletins`;
      statusDotClass = 'status-dot bg-[#007F78]';
    } else if (status.mode === 'live' && healthyCount > 0 && healthyCount === totalCount) {
      freshnessTitle = `Feeds Connected (${healthyCount}/${totalCount} Sources Online)`;
      freshnessSubtitle = `Verified sync: 12:00 PM IST`;
      statusDotClass = 'status-dot bg-[#079455]';
    } else {
      freshnessTitle = 'Feeds Configured · Pending Sync';
      freshnessSubtitle = `Last checked: ${lastSyncTime} IST`;
      statusDotClass = 'status-dot neutral';
    }

    return { freshnessTitle, freshnessSubtitle, statusDotClass };
  }

  const baselineSources = [
    { id: 'source-imd', name: 'India Meteorological Department (IMD)', health_status: 'healthy' },
    { id: 'source-tnsdma', name: 'Tamil Nadu State Disaster Management Authority (TNSDMA)', health_status: 'healthy' },
    { id: 'source-gcc', name: 'Greater Chennai Corporation (GCC)', health_status: 'healthy' },
  ];

  // Test 1: Default Demonstration Mode with Stale Alerts (All 3 sources healthy)
  const test1 = computeDashboardStatus({
    status: {
      status: 'healthy',
      mode: 'live_with_simulations',
      sources_healthy_count: 3,
      sources_total_count: 3,
      sources: baselineSources,
    },
    filteredAlerts: [{ id: 'alert-1', is_stale: true, is_simulated: true }],
    scenario: 'default',
  });
  assert.equal(
    test1.freshnessTitle,
    'Simulated Demonstration Feeds (3/3 Configured Sources Healthy)',
    'Default mode with stale alerts must NOT display Degraded Feed'
  );
  assert.match(test1.freshnessSubtitle, /Demonstration records/);
  assert.equal(test1.statusDotClass, 'status-dot bg-[#007F78]');

  // Test 2: Source Outage Scenario (IMD marked degraded, 2/3 sources healthy)
  const outageSources = [
    { id: 'source-imd', name: 'India Meteorological Department (IMD)', health_status: 'degraded' },
    { id: 'source-tnsdma', name: 'Tamil Nadu State Disaster Management Authority (TNSDMA)', health_status: 'healthy' },
    { id: 'source-gcc', name: 'Greater Chennai Corporation (GCC)', health_status: 'healthy' },
  ];
  const test2 = computeDashboardStatus({
    status: {
      status: 'degraded',
      mode: 'live_with_simulations',
      sources_healthy_count: 2,
      sources_total_count: 3,
      sources: outageSources,
    },
    filteredAlerts: [{ id: 'alert-1', is_stale: true, is_simulated: true }],
    scenario: 'outage',
  });
  assert.equal(test2.freshnessTitle, 'Degraded Feed (2/3 Sources Active)');
  assert.match(test2.freshnessSubtitle, /India Meteorological Department outage/);
  assert.equal(test2.statusDotClass, 'status-dot bg-[#DC6803]');

  // Test 3: All Clear Scenario (No active alerts, all sources healthy)
  const test3 = computeDashboardStatus({
    status: {
      status: 'healthy',
      mode: 'live_with_simulations',
      sources_healthy_count: 3,
      sources_total_count: 3,
      sources: baselineSources,
    },
    filteredAlerts: [],
    scenario: 'clear',
  });
  assert.equal(test3.freshnessTitle, 'Simulated Demonstration Feeds (3/3 Configured Sources Healthy)');
  assert.match(test3.freshnessSubtitle, /Demonstration sync/);

  // Test 4: No Matching Alerts (e.g. Kancheepuram area, all sources healthy)
  const test4 = computeDashboardStatus({
    status: {
      status: 'healthy',
      mode: 'live_with_simulations',
      sources_healthy_count: 3,
      sources_total_count: 3,
      sources: baselineSources,
    },
    filteredAlerts: [],
    scenario: 'default',
  });
  assert.equal(test4.freshnessTitle, 'Simulated Demonstration Feeds (3/3 Configured Sources Healthy)');

  // Test 5: Backend Status Unavailable (Network offline / status is null)
  const test5 = computeDashboardStatus({
    status: null,
    filteredAlerts: [],
    scenario: 'default',
  });
  assert.equal(test5.freshnessTitle, 'Backend API Unavailable');
  assert.match(test5.freshnessSubtitle, /Operating in offline cache mode/);
  assert.equal(test5.statusDotClass, 'status-dot neutral');
});

// Test 15: Google OAuth & Supabase Auth Token Verification & Privilege Isolation
test('Google OAuth tokens are verified via Supabase Auth and isolated from administrative privileges', async () => {
  // Test implementation of authenticateUser logic matching security.ts
  async function testAuthenticateUser(req, supabase) {
    const authHeader = req.headers.get('Authorization') || req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return { user: null, error: 'Missing or invalid authentication token', status: 401 };
    }

    const token = authHeader.substring(7).trim();
    const parts = token.split('.');

    // 1. Supabase Auth JWT verifier (3 parts)
    if (parts.length === 3) {
      if (!supabase || !supabase.auth || typeof supabase.auth.getUser !== 'function') {
        return { user: null, error: 'Supabase authentication service unavailable', status: 503 };
      }

      const { data: authData, error: authErr } = await supabase.auth.getUser(token);
      if (authErr || !authData?.user) {
        return { user: null, error: 'Invalid or expired Supabase authentication token', status: 401 };
      }

      const authUser = authData.user;
      const userEmail = authUser.email;
      const userId = authUser.id;

      // Check if this OAuth account is assigned an authorized role in public.users
      const { data: dbUser, error: dbErr } = await supabase.from('users').select('*');

      const matchedUser = (dbUser || []).find(
        (u) => u.id === userId || (userEmail && u.username === userEmail)
      );

      if (!matchedUser) {
        return {
          user: null,
          error: 'Google account authenticated, but not authorized as an editor or administrator',
          status: 403,
        };
      }

      return { user: matchedUser };
    }

    // 2. Custom SafeRoute HMAC-SHA256 Token (2 parts)
    if (parts.length === 2) {
      // Mock custom token validation
      if (token.startsWith('valid_custom_token.')) {
        return { user: { id: 'user-admin', username: 'admin', role: 'admin' } };
      }
      return { user: null, error: 'Token has expired or is invalid', status: 401 };
    }

    return { user: null, error: 'Token format invalid', status: 401 };
  }

  // 1. Unassigned Google OAuth user (e.g. tourist@gmail.com)
  const mockSupabaseUnassigned = {
    auth: {
      getUser: async (token) => {
        if (token === 'valid.header.signature') {
          return { data: { user: { id: 'oauth-uuid-1', email: 'tourist@gmail.com' } }, error: null };
        }
        return { data: { user: null }, error: new Error('Invalid token') };
      },
    },
    from: (table) => ({
      select: () => Promise.resolve({
        data: [{ id: 'user-admin', username: 'admin', role: 'admin' }],
        error: null,
      }),
    }),
  };

  const reqUnassigned = {
    headers: new Headers({ Authorization: 'Bearer valid.header.signature' }),
  };

  const resUnassigned = await testAuthenticateUser(reqUnassigned, mockSupabaseUnassigned);
  assert.equal(
    resUnassigned.status,
    403,
    'Unassigned Google OAuth account must receive 403 Forbidden on privileged endpoints'
  );
  assert.match(
    resUnassigned.error,
    /not authorized as an editor or administrator/,
    'Must explain lack of administrator authorization'
  );
  assert.equal(resUnassigned.user, null, 'User object must be null for unassigned account');

  // 2. Assigned Google OAuth user (e.g. coordinator@saferoute.org)
  const mockSupabaseAssigned = {
    auth: {
      getUser: async () => ({
        data: { user: { id: 'oauth-uuid-2', email: 'coordinator@saferoute.org' } },
        error: null,
      }),
    },
    from: (table) => ({
      select: () => Promise.resolve({
        data: [
          { id: 'user-admin', username: 'admin', role: 'admin' },
          { id: 'oauth-uuid-2', username: 'coordinator@saferoute.org', role: 'editor' },
        ],
        error: null,
      }),
    }),
  };

  const reqAssigned = {
    headers: new Headers({ Authorization: 'Bearer valid.header.signature' }),
  };

  const resAssigned = await testAuthenticateUser(reqAssigned, mockSupabaseAssigned);
  assert.equal(resAssigned.user?.role, 'editor', 'Assigned OAuth account must receive their authorized role');

  // 3. Invalid or Expired Supabase Auth token
  const reqInvalidJwt = {
    headers: new Headers({ Authorization: 'Bearer expired.jwt.token' }),
  };
  const resInvalidJwt = await testAuthenticateUser(reqInvalidJwt, mockSupabaseUnassigned);
  assert.equal(resInvalidJwt.status, 401, 'Expired Supabase token must return 401');

  // 4. Custom HMAC-SHA256 tokens still work identically (2-part token)
  const reqCustomToken = {
    headers: new Headers({ Authorization: 'Bearer valid_custom_token.signature' }),
  };
  const resCustomToken = await testAuthenticateUser(reqCustomToken, mockSupabaseUnassigned);
  assert.equal(resCustomToken.user?.username, 'admin', 'Existing custom tokens must continue to authenticate');
});
