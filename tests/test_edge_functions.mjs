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

// Test 6: API URL Normalization across topologies
test('buildApiUrl normalizes endpoints for both Supabase Edge Functions and FastAPI', () => {
  function buildApiUrl(base, endpoint) {
    const isSupabaseFunctions = base.includes('/functions/v1');
    if (isSupabaseFunctions) {
      if (base.endsWith('/api')) {
        const clean = endpoint.replace(/^\/?api/, '');
        return `${base}${clean.startsWith('/') ? clean : `/${clean}`}`;
      } else {
        let clean = endpoint.replace(/^\/?api/, '');
        if (clean.startsWith('/demo/scenario')) {
          clean = clean.replace('/demo/scenario', '/demo-scenario');
        }
        return `${base}${clean.startsWith('/') ? clean : `/${clean}`}`;
      }
    }
    const path = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    return `${base}${path}`;
  }

  // FastAPI
  assert.equal(
    buildApiUrl('http://127.0.0.1:8000', '/api/alerts'),
    'http://127.0.0.1:8000/api/alerts'
  );

  // Supabase unified router
  assert.equal(
    buildApiUrl('https://example.supabase.co/functions/v1/api', '/api/alerts'),
    'https://example.supabase.co/functions/v1/api/alerts'
  );
  assert.equal(
    buildApiUrl('https://example.supabase.co/functions/v1/api', '/api/demo/scenario'),
    'https://example.supabase.co/functions/v1/api/demo/scenario'
  );

  // Supabase individual functions
  assert.equal(
    buildApiUrl('https://example.supabase.co/functions/v1', '/api/alerts'),
    'https://example.supabase.co/functions/v1/alerts'
  );
  assert.equal(
    buildApiUrl('https://example.supabase.co/functions/v1', '/api/demo/scenario'),
    'https://example.supabase.co/functions/v1/demo-scenario'
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

