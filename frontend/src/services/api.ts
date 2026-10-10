import {
  Alert,
  Area,
  EmergencyContact,
  SafeZone,
  SystemStatus,
  Translation,
  AuditLog,
  Source
} from '../types';

// Production Supabase Edge Functions API fallback
export const SUPABASE_PRODUCTION_API = 'https://ijbsprdkrhnimhiknpxe.supabase.co/functions/v1/api';

// Configurable base URL: supports Supabase Edge Functions, Render backend, or fallback to local FastAPI
export function resolveBaseUrl(): string {
  const explicitApiBase = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_BASE;
  if (explicitApiBase) {
    return explicitApiBase.replace(/\/+$/, '');
  }
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  if (supabaseUrl) {
    return `${supabaseUrl.replace(/\/+$/, '')}/functions/v1/api`;
  }
  // Safe production fallback: when deployed to Vercel or any non-localhost domain,
  // or when built for production (import.meta.env.PROD), use Supabase Edge Functions.
  // Never default to http://127.0.0.1:8000 on deployed domains, which causes mixed-content failure.
  if (
    import.meta.env.PROD ||
    (typeof window !== 'undefined' &&
      window.location.hostname !== 'localhost' &&
      window.location.hostname !== '127.0.0.1')
  ) {
    return SUPABASE_PRODUCTION_API;
  }
  return 'http://127.0.0.1:8000';
}

export const API_BASE = resolveBaseUrl();
console.info(`[SafeRoute API] Initialized API_BASE: ${API_BASE}`);

/**
 * Strips leading slashes and any duplicate '/api' or 'api/' prefixes from an endpoint.
 * Preserves query parameters.
 */
export function cleanEndpoint(endpoint: string): { path: string; queryString: string } {
  const [rawPath, rawQuery] = endpoint.split('?');
  let cleanPath = rawPath.replace(/^\/+/, '');
  while (cleanPath.startsWith('api/') || cleanPath === 'api') {
    cleanPath = cleanPath.slice(3).replace(/^\/+/, '');
  }
  const queryString = rawQuery !== undefined ? `?${rawQuery}` : '';
  return { path: cleanPath, queryString };
}

/**
 * Normalizes the base URL across topologies so that the '/api' prefix is present exactly once.
 * - Supabase Edge Functions: .../functions/v1/api
 * - Python FastAPI / standard backend: .../api
 */
export function normalizeBaseUrl(base: string): string {
  let b = base.replace(/\/+$/, '');

  if (b.includes('/functions/v1')) {
    // Strip any trailing /api (handles /api or /api/api) then append exactly one /api
    b = b.replace(/(\/api)+$/, '');
    return `${b}/api`;
  }

  if (b.includes('supabase.co')) {
    // Plain Supabase project URL (e.g. https://xyz.supabase.co)
    b = b.replace(/(\/functions\/v1)?(\/api)*$/, '');
    return `${b}/functions/v1/api`;
  }

  // Standard server (e.g. FastAPI at http://127.0.0.1:8000)
  // Strip any trailing /api then append exactly one /api
  b = b.replace(/(\/api)+$/, '');
  return `${b}/api`;
}

/**
 * Normalizes API endpoint URLs across backend topologies:
 * - Ensures the final URL contains the '/api' prefix EXACTLY ONCE.
 * - Works whether the endpoint is passed as '/status', 'status', '/api/status', etc.
 * - Preserves query parameters (e.g. ?area_id=...).
 */
export function buildApiUrl(endpoint: string, base: string = API_BASE): string {
  const normBase = normalizeBaseUrl(base);
  const { path, queryString } = cleanEndpoint(endpoint);
  return path ? `${normBase}/${path}${queryString}` : `${normBase}${queryString}`;
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = buildApiUrl(endpoint);
  const anonKey =
    import.meta.env.VITE_SUPABASE_ANON_KEY ||
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlqYnNwcmRrcmhuaW1oaWtucHhlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTE1Njc3NjMsImV4cCI6MjEwNzE0Mzc2M30.gzCLd46GVMJ6YbDr2RhyKdtu0wCGuzXij20ZPVVUYcc';
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(anonKey && API_BASE.includes('supabase.co') ? { apikey: anonKey } : {}),
    ...(options.headers as Record<string, string> || {})
  };

  let response: Response;
  try {
    response = await fetch(url, { ...options, headers });
  } catch (fetchError) {
    console.warn(`[SafeRoute API] Network request to ${url} failed:`, fetchError);
    throw new Error(
      `Unable to connect to SafeRoute API at ${API_BASE}. ` +
      `Please check internet connectivity or verify that the backend server is running.`
    );
  }

  if (!response.ok) {
    const errorText = await response.text();
    let errorDetail = `Error ${response.status}: ${response.statusText}`;
    try {
      const parsed = JSON.parse(errorText);
      if (parsed.detail) errorDetail = parsed.detail;
    } catch {
      // Use status text if not JSON
    }
    
    if (response.status === 401) {
      console.warn('SafeRoute API: Unauthorized request (401)');
    }
    
    throw new Error(errorDetail);
  }

  try {
    return await response.json();
  } catch {
    throw new Error(`Invalid JSON response received from ${endpoint}`);
  }
}

export const api = {
  getHealth: () => request<{ status: string }>('/health'),

  getStatus: () => request<SystemStatus>('/status'),

  getAreas: () => request<Area[]>('/api/areas'),

  getAlerts: (params?: { area_id?: string; hazard_type?: string; severity?: string; status?: string }) => {
    const query = new URLSearchParams();
    if (params?.area_id) query.append('area_id', params.area_id);
    if (params?.hazard_type) query.append('hazard_type', params.hazard_type);
    if (params?.severity) query.append('severity', params.severity);
    if (params?.status) query.append('status', params.status);
    const qs = query.toString() ? `?${query.toString()}` : '';
    return request<Alert[]>(`/api/alerts${qs}`);
  },

  getAlertDetail: (alertId: string) => request<Alert>(`/api/alerts/${alertId}`),

  getSafeZones: (params?: { area_id?: string; user_lat?: number | null; user_lng?: number | null }) => {
    const query = new URLSearchParams();
    if (params?.area_id) query.append('area_id', params.area_id);
    if (params?.user_lat != null) query.append('user_lat', params.user_lat.toString());
    if (params?.user_lng != null) query.append('user_lng', params.user_lng.toString());
    const qs = query.toString() ? `?${query.toString()}` : '';
    return request<SafeZone[]>(`/api/safe-zones${qs}`);
  },

  getEmergencyContacts: (areaId?: string) => {
    const qs = areaId ? `?area_id=${areaId}` : '';
    return request<EmergencyContact[]>(`/api/emergency-contacts${qs}`);
  },

  getTranslation: (alertId: string, language: string) => {
    return request<Translation>(`/api/translations/${alertId}?language=${language}`);
  },

  login: (username: string, password: string) => {
    return request<{ access_token: string; token_type: string; role: string; username: string }>(
      '/api/auth/login',
      {
        method: 'POST',
        body: JSON.stringify({ username, password })
      }
    );
  },

  getMe: (token: string) => {
    return request<{ id: string; username: string; role: string }>('/api/auth/me', {
      headers: { Authorization: `Bearer ${token}` }
    });
  },

  changePassword: (token: string, payload: { old_password: string; new_password: string }) => {
    return request<{ message: string }>('/api/auth/change-password', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify(payload)
    });
  },


  adminCreateAlert: (token: string, payload: any) => {
    return request<Alert>('/api/admin/alerts', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify(payload)
    });
  },

  adminUpdateAlert: (token: string, alertId: string, payload: any) => {
    return request<Alert>(`/api/admin/alerts/${alertId}`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify(payload)
    });
  },

  adminDeleteAlert: (token: string, alertId: string) => {
    return request<{ message: string }>(`/api/admin/alerts/${alertId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    });
  },

  adminCreateSafeZone: (token: string, payload: any) => {
    return request<SafeZone>('/api/admin/safe-zones', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify(payload)
    });
  },

  adminRefreshSource: (token: string, sourceId: string) => {
    return request<Source>(`/api/admin/sources/${sourceId}/refresh`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` }
    });
  },

  adminToggleSource: (token: string, sourceId: string, newStatus: string) => {
    return request<Source>(`/api/admin/sources/${sourceId}/toggle-status`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify({ new_status: newStatus })
    });
  },

  adminGetAuditLogs: (token: string) => {
    return request<AuditLog[]>('/api/admin/audit-logs', {
      headers: { Authorization: `Bearer ${token}` }
    });
  },

  setDemoScenario: (scenario: string) => {
    return request<{ scenario: string; message: string }>('/api/demo/scenario', {
      method: 'POST',
      body: JSON.stringify({ scenario })
    });
  }
};
