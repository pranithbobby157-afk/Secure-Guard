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

const API_BASE = import.meta.env.VITE_API_BASE || 'http://127.0.0.1:8000';

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE}${endpoint}`;
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {})
  };

  const response = await fetch(url, { ...options, headers });
  if (!response.ok) {
    const errorText = await response.text();
    let errorDetail = `Error ${response.status}: ${response.statusText}`;
    try {
      const parsed = JSON.parse(errorText);
      if (parsed.detail) errorDetail = parsed.detail;
    } catch {
      // ignore
    }
    throw new Error(errorDetail);
  }
  return response.json();
}

export const api = {
  getStatus: () => request<SystemStatus>('/api/status'),

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
