export interface Source {
  id: string;
  name: string;
  category: string;
  base_url?: string;
  geographic_coverage: string;
  authority_level: string;
  last_attempt_at?: string;
  last_success_at?: string;
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
  boundary_geojson?: string;
}

export interface Translation {
  id: string;
  alert_id: string;
  target_language: string;
  translated_title: string;
  translated_description: string;
  translated_instruction?: string;
  provider: string;
  source_text_hash: string;
  created_at: string;
}

export interface Alert {
  id: string;
  source_id: string;
  external_id?: string;
  area_id: string;
  title: string;
  description_original: string;
  instruction_original?: string;
  original_language: string;
  hazard_type: 'cyclone' | 'flood' | 'heavy_rain' | 'waterlogging' | 'storm';
  severity: 'critical' | 'warning' | 'watch' | 'advisory';
  status: 'active' | 'expired' | 'cancelled';
  issued_at: string;
  effective_at?: string;
  expires_at?: string;
  retrieved_at: string;
  source_url?: string;
  verification_status: 'official_source' | 'editor_verified' | 'simulated';
  is_simulated: boolean;
  lat?: number;
  lng?: number;
  polygon_geojson?: string;
  source?: Source;
  area?: Area;
  translations?: Translation[];
  is_stale: boolean;
  freshness_minutes: number;
}

export interface SafeZone {
  id: string;
  area_id: string;
  name: string;
  facility_type: 'designated_shelter' | 'relief_centre' | 'hospital' | 'transit_hub';
  address: string;
  latitude: number;
  longitude: number;
  source_name: string;
  source_url?: string;
  verification_status: string;
  last_verified_at: string;
  operational_status: 'open' | 'on_standby' | 'unverified';
  capacity_notes?: string;
  contact_phone?: string;
  is_simulated: boolean;
  distance_km?: number | null;
}

export interface EmergencyContact {
  id: string;
  area_id: string;
  service_name: string;
  phone_number: string;
  description?: string;
  source_url?: string;
  is_toll_free: boolean;
}

export interface SystemStatus {
  status: 'healthy' | 'degraded' | 'unavailable';
  mode: string;
  active_alerts_count: number;
  safe_zones_count: number;
  sources_healthy_count: number;
  sources_total_count: number;
  last_successful_refresh?: string;
  sources: Source[];
}

export interface AuditLog {
  id: string;
  user_id?: string;
  action: string;
  entity_type: string;
  entity_id?: string;
  timestamp: string;
  details_json?: string;
}

export type SupportedLanguage = 'en' | 'ta' | 'hi' | 'fr';

export interface UserProfile {
  id: string;
  username: string;
  role: string;
}
