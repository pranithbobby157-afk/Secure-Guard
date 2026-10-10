export interface Source {
  id: string;
  name: string;
  category: string;
  base_url: string | null;
  geographic_coverage: string;
  authority_level: string;
  last_attempt_at: string | null;
  last_success_at: string | null;
  health_status: 'healthy' | 'degraded' | 'unavailable';
  attribution_text: string;
}

export interface Area {
  id: string;
  name: string;
  state_region: string;
  center_lat: number;
  center_lng: number;
  default_zoom: number;
  boundary_geojson: string | null;
}

export interface Translation {
  id: string;
  alert_id: string;
  target_language: string;
  translated_title: string;
  translated_description: string;
  translated_instruction: string | null;
  provider: string;
  source_text_hash: string;
  created_at: string;
}

export interface Alert {
  id: string;
  source_id: string;
  external_id: string | null;
  area_id: string;
  title: string;
  description_original: string;
  instruction_original: string | null;
  original_language: string;
  hazard_type: string;
  severity: string;
  status: string;
  issued_at: string;
  effective_at: string | null;
  expires_at: string | null;
  retrieved_at: string | null;
  source_url: string | null;
  verification_status: string;
  is_simulated: boolean;
  lat: number | null;
  lng: number | null;
  polygon_geojson: string | null;
  source?: Source;
  area?: Area;
  translations?: Translation[];
  is_stale?: boolean;
  freshness_minutes?: number;
}

export interface SafeZone {
  id: string;
  area_id: string;
  name: string;
  facility_type: string;
  address: string;
  latitude: number;
  longitude: number;
  source_name: string;
  source_url: string | null;
  verification_status: string;
  last_verified_at: string | null;
  operational_status: string;
  capacity_notes: string | null;
  contact_phone: string | null;
  is_simulated: boolean;
  distance_km?: number | null;
}

export interface EmergencyContact {
  id: string;
  area_id: string;
  service_name: string;
  phone_number: string;
  description: string | null;
  source_url: string | null;
  is_toll_free: boolean;
}

export interface User {
  id: string;
  username: string;
  password_hash: string;
  role: string;
  created_at: string;
}

export interface AuditLog {
  id: string;
  user_id: string | null;
  action: string;
  entity_type: string;
  entity_id: string | null;
  timestamp: string;
  details_json: string | null;
}

export interface SystemStatus {
  status: 'healthy' | 'degraded';
  mode: string;
  active_alerts_count: number;
  safe_zones_count: number;
  sources_healthy_count: number;
  sources_total_count: number;
  last_successful_refresh: string;
  sources: Source[];
}
