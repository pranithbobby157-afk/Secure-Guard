-- ====================================================================
-- SafeRoute: Migration 01 - Core Relational Schema
-- ====================================================================

-- 1. Upstream Official Sources
CREATE TABLE IF NOT EXISTS public.sources (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    category TEXT NOT NULL, -- weather_agency, disaster_management, municipal_authority
    base_url TEXT,
    geographic_coverage TEXT NOT NULL,
    authority_level TEXT NOT NULL,
    last_attempt_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()),
    last_success_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()),
    health_status TEXT NOT NULL DEFAULT 'healthy', -- healthy, degraded, unavailable
    attribution_text TEXT NOT NULL
);

-- 2. Geographic Focus Areas
CREATE TABLE IF NOT EXISTS public.areas (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    state_region TEXT NOT NULL,
    center_lat DOUBLE PRECISION NOT NULL,
    center_lng DOUBLE PRECISION NOT NULL,
    default_zoom INTEGER NOT NULL DEFAULT 11,
    boundary_geojson TEXT
);

-- 3. Extreme Weather Alerts
CREATE TABLE IF NOT EXISTS public.alerts (
    id TEXT PRIMARY KEY,
    source_id TEXT NOT NULL REFERENCES public.sources(id) ON DELETE RESTRICT,
    external_id TEXT,
    area_id TEXT NOT NULL REFERENCES public.areas(id) ON DELETE RESTRICT,
    title TEXT NOT NULL,
    description_original TEXT NOT NULL,
    instruction_original TEXT,
    original_language TEXT NOT NULL DEFAULT 'en',
    hazard_type TEXT NOT NULL, -- cyclone, flood, heavy_rain, waterlogging, storm
    severity TEXT NOT NULL,    -- critical, warning, watch, advisory
    status TEXT NOT NULL DEFAULT 'active', -- active, expired, cancelled
    issued_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()),
    effective_at TIMESTAMPTZ,
    expires_at TIMESTAMPTZ,
    retrieved_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()),
    source_url TEXT,
    verification_status TEXT NOT NULL DEFAULT 'official_source', -- official_source, editor_verified, simulated
    is_simulated BOOLEAN NOT NULL DEFAULT false,
    lat DOUBLE PRECISION,
    lng DOUBLE PRECISION,
    polygon_geojson TEXT
);

-- Indexes for efficient alert filtering
CREATE INDEX IF NOT EXISTS idx_alerts_area_status ON public.alerts(area_id, status);
CREATE INDEX IF NOT EXISTS idx_alerts_issued_at ON public.alerts(issued_at DESC);
CREATE INDEX IF NOT EXISTS idx_alerts_hazard_severity ON public.alerts(hazard_type, severity);

-- 4. Designated Safe Zones & Shelters
CREATE TABLE IF NOT EXISTS public.safe_zones (
    id TEXT PRIMARY KEY,
    area_id TEXT NOT NULL REFERENCES public.areas(id) ON DELETE RESTRICT,
    name TEXT NOT NULL,
    facility_type TEXT NOT NULL, -- designated_shelter, relief_centre, hospital
    address TEXT NOT NULL,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    source_name TEXT NOT NULL,
    source_url TEXT,
    verification_status TEXT NOT NULL DEFAULT 'official_verified',
    last_verified_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()),
    operational_status TEXT NOT NULL DEFAULT 'open', -- open, on_standby, unverified
    capacity_notes TEXT,
    contact_phone TEXT,
    is_simulated BOOLEAN NOT NULL DEFAULT false
);

CREATE INDEX IF NOT EXISTS idx_safe_zones_area ON public.safe_zones(area_id);

-- 5. Multilingual Translations Cache
CREATE TABLE IF NOT EXISTS public.translations (
    id TEXT PRIMARY KEY,
    alert_id TEXT NOT NULL REFERENCES public.alerts(id) ON DELETE CASCADE,
    target_language TEXT NOT NULL, -- en, ta, hi, fr
    translated_title TEXT NOT NULL,
    translated_description TEXT NOT NULL,
    translated_instruction TEXT,
    provider TEXT NOT NULL DEFAULT 'SafeRoute Linguistic Engine',
    source_text_hash TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_translations_alert_lang ON public.translations(alert_id, target_language);

-- 6. Regional Emergency Helplines
CREATE TABLE IF NOT EXISTS public.emergency_contacts (
    id TEXT PRIMARY KEY,
    area_id TEXT NOT NULL REFERENCES public.areas(id) ON DELETE RESTRICT,
    service_name TEXT NOT NULL,
    phone_number TEXT NOT NULL,
    description TEXT,
    source_url TEXT,
    is_toll_free BOOLEAN NOT NULL DEFAULT true
);

CREATE INDEX IF NOT EXISTS idx_emergency_contacts_area ON public.emergency_contacts(area_id);

-- 7. Internal System Users (Editors & Admins)
CREATE TABLE IF NOT EXISTS public.users (
    id TEXT PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'editor', -- admin, editor
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now())
);

-- 8. Immutable Security Audit Logs
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id TEXT PRIMARY KEY,
    user_id TEXT REFERENCES public.users(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id TEXT,
    timestamp TIMESTAMPTZ DEFAULT timezone('utc'::text, now()),
    details_json TEXT
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_timestamp ON public.audit_logs(timestamp DESC);
