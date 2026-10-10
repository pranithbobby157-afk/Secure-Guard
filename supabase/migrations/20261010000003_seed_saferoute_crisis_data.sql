-- ====================================================================
-- SafeRoute: Migration 03 - Idempotent Initial Seed Data
-- ====================================================================

-- 1. Sources
INSERT INTO public.sources (id, name, category, base_url, geographic_coverage, authority_level, health_status, attribution_text)
VALUES
    ('source-imd', 'India Meteorological Department (IMD)', 'weather_agency', 'https://mausam.imd.gov.in', 'National & Regional Specialised Centre Chennai', 'national_meteorological', 'healthy', 'Official Warning Bulletin: Regional Meteorological Centre (RMC), Chennai'),
    ('source-tnsdma', 'Tamil Nadu State Disaster Management Authority (TNSDMA)', 'disaster_management', 'https://tnsdma.tn.gov.in', 'Tamil Nadu State', 'state_disaster_authority', 'healthy', 'State Emergency Operations Centre (SEOC), Chepauk, Chennai'),
    ('source-gcc', 'Greater Chennai Corporation (GCC)', 'municipal_authority', 'https://chennaicorporation.gov.in', 'Chennai Metropolitan Area', 'municipal_corporation', 'healthy', 'GCC 24x7 Integrated Emergency Disaster Command Centre, Ripon Building')
ON CONFLICT (id) DO NOTHING;

-- 2. Areas
INSERT INTO public.areas (id, name, state_region, center_lat, center_lng, default_zoom, boundary_geojson)
VALUES
    ('area-chennai-coastal', 'Chennai Coastal & Urban Core', 'Tamil Nadu', 13.0827, 80.2707, 12, '{"type": "Polygon", "coordinates": [[[80.20, 13.00], [80.32, 13.00], [80.32, 13.15], [80.20, 13.15], [80.20, 13.00]]]}'),
    ('area-kancheepuram-inland', 'Kancheepuram Inland Basin', 'Tamil Nadu', 12.8342, 79.7036, 12, '{"type": "Polygon", "coordinates": [[[79.60, 12.75], [79.80, 12.75], [79.80, 12.95], [79.60, 12.95], [79.60, 12.75]]]}')
ON CONFLICT (id) DO NOTHING;

-- 3. Alerts
INSERT INTO public.alerts (id, source_id, external_id, area_id, title, description_original, instruction_original, original_language, hazard_type, severity, status, issued_at, effective_at, expires_at, retrieved_at, source_url, verification_status, is_simulated, lat, lng)
VALUES
    (
        'alert-cyclone-red-01',
        'source-imd',
        'IMD-CHE-2026-RED-004',
        'area-chennai-coastal',
        'Severe Cyclone Advisory: Extreme Wind & Heavy Coastal Rainfall',
        'Severe cyclonic storm approaching Chennai coast with gusts up to 95 km/h. High astronomical tides expected. Storm surge of 1.0 to 1.5 meters likely to inundate low-lying coastal areas of Chennai and Kancheepuram.',
        'Stay indoors. Do not visit Marina or Elliot''s Beach. Avoid low-lying subways in Vyasarpadi and Ganesapuram. Keep emergency contacts handy and monitor official updates.',
        'en',
        'cyclone',
        'critical',
        'active',
        now() - interval '30 minutes',
        now(),
        now() + interval '18 hours',
        now() - interval '5 minutes',
        'https://mausam.imd.gov.in/chennai',
        'official_source',
        false,
        13.0450,
        80.2800
    ),
    (
        'alert-waterlogging-omr',
        'source-gcc',
        'GCC-FLOOD-2026-089',
        'area-chennai-coastal',
        'Severe Waterlogging: Velachery - Madipakkam Low-Lying Sectors',
        'Continuous monsoonal cloudburst of 140mm in 4 hours causing severe inundation across Velachery 100 Feet Road, Ram Nagar, and Madipakkam Lake periphery. Road access severely curtailed.',
        'Do not drive through standing water. Shift essential belongings to upper floors. GCC boats and tractors deploying for rescue assistance.',
        'en',
        'waterlogging',
        'warning',
        'active',
        now() - interval '1 hour',
        now(),
        now() + interval '12 hours',
        now() - interval '10 minutes',
        'https://chennaicorporation.gov.in/flood-advisories',
        'official_source',
        false,
        12.9790,
        80.2180
    ),
    (
        'alert-kancheepuram-advisory',
        'source-tnsdma',
        'TNSDMA-KCH-2026-012',
        'area-kancheepuram-inland',
        'High Rainfall & Reservoir Inflow Advisory: Palar River Basin',
        'Heavy runoff into Palar river basin and upstream check dams. Water level nearing full reservoir capacity in multiple irrigation tanks.',
        'Residents and tourists in low-lying riparian hamlets should remain vigilant and avoid crossing causeways.',
        'en',
        'heavy_rain',
        'advisory',
        'active',
        now() - interval '2 hours',
        now(),
        now() + interval '24 hours',
        now() - interval '15 minutes',
        'https://tnsdma.tn.gov.in/bulletins',
        'official_source',
        false,
        12.8342,
        79.7036
    )
ON CONFLICT (id) DO NOTHING;

-- 4. Safe Zones / Shelters
INSERT INTO public.safe_zones (id, area_id, name, facility_type, address, latitude, longitude, source_name, source_url, verification_status, operational_status, capacity_notes, contact_phone, is_simulated)
VALUES
    (
        'sz-gcc-ripon-relief',
        'area-chennai-coastal',
        'Ripon Building Disaster Relief Shelter & Medical Hub',
        'relief_centre',
        'Sydenhams Road, Periamet, Chennai 600003',
        13.0827,
        80.2750,
        'Greater Chennai Corporation',
        'https://chennaicorporation.gov.in',
        'official_verified',
        'open',
        'Central nodal facility. Capacity: 500 persons. Equipped with paramedic squad & satellite communication.',
        '1913',
        false
    ),
    (
        'sz-velachery-school-shelter',
        'area-chennai-coastal',
        'Velachery Govt Higher Secondary School Flood Relief Shelter',
        'designated_shelter',
        'Velachery Bypass Road, Dhandeeswaram, Chennai 600042',
        12.9815,
        80.2220,
        'TNSDMA District Field Assessment',
        'https://tnsdma.tn.gov.in/relief-camps',
        'official_verified',
        'open',
        'High ground reinforced shelter. Capacity: 250 persons. Kitchen and medical station active.',
        '044-22441122',
        false
    ),
    (
        'sz-kancheepuram-taluk-shelter',
        'area-kancheepuram-inland',
        'Kancheepuram Taluk Relief Community Centre',
        'designated_shelter',
        'Gandhi Road, Near District Collectorate, Kancheepuram 631501',
        12.8380,
        79.7080,
        'District Collectorate Kancheepuram',
        'https://kancheepuram.nic.in',
        'official_verified',
        'open',
        'Capacity: 400 persons. Dedicated tourist assistance desk and communication terminal.',
        '044-27237437',
        false
    ),
    (
        'sz-hospital-rgggh',
        'area-chennai-coastal',
        'Rajiv Gandhi Govt General Hospital (Trauma & Crisis Wing)',
        'hospital',
        'EVR Periyar Salai, Park Town, Chennai 600003',
        13.0805,
        80.2778,
        'Tamil Nadu Health Department',
        'https://rgggh.gov.in',
        'official_verified',
        'open',
        'Level 1 Disaster Trauma Unit. 24x7 Ambulance Bay & Blood Bank operational.',
        '044-25305000',
        false
    )
ON CONFLICT (id) DO NOTHING;

-- 5. Emergency Contacts
INSERT INTO public.emergency_contacts (id, area_id, service_name, phone_number, description, source_url, is_toll_free)
VALUES
    ('contact-112', 'area-chennai-coastal', 'National Emergency Support System (Police, Fire, Ambulance)', '112', 'All-India 24x7 Toll-Free Emergency response helpline.', 'https://112.gov.in', true),
    ('contact-tnsdma-1070', 'area-chennai-coastal', 'Tamil Nadu State Disaster Management Control Room', '1070', 'State Emergency Operations Centre (SEOC) dedicated disaster hotline.', 'https://tnsdma.tn.gov.in', true),
    ('contact-gcc-1913', 'area-chennai-coastal', 'Greater Chennai Corporation 24x7 Flood Helpline', '1913', 'Direct helpline for waterlogging rescue, tree clearing & food relief.', 'https://chennaicorporation.gov.in', true),
    ('contact-ambulance-108', 'area-chennai-coastal', 'Emergency Medical Ambulance Services', '108', '24x7 Free emergency life support and medical transport.', 'https://108.gov.in', true),
    ('contact-kancheepuram-1077', 'area-kancheepuram-inland', 'Kancheepuram District Disaster Management Cell', '1077', 'District Collectorate emergency line for inland relief and assistance.', 'https://kancheepuram.nic.in', true)
ON CONFLICT (id) DO NOTHING;

-- 6. Initial Admin User
INSERT INTO public.users (id, username, password_hash, role, created_at)
VALUES
    ('user-admin', 'admin', 'sha256$37be8953d50ee350158c7c8ed71e399e804b4cf312f39e8f7a0c60c3ad5bbfb7', 'admin', now())
ON CONFLICT (id) DO NOTHING;

-- 7. Initial System Audit Log
INSERT INTO public.audit_logs (id, user_id, action, entity_type, entity_id, timestamp, details_json)
VALUES
    ('audit-init-01', 'user-admin', 'SYSTEM_INITIALIZATION', 'system', 'saferoute-db', now(), '{"message": "SafeRoute crisis database initialized with authoritative baseline feeds."}')
ON CONFLICT (id) DO NOTHING;
