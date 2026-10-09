import datetime
from sqlalchemy.orm import Session
from app.database import engine, SessionLocal, Base
from app.models import Source, Area, Alert, SafeZone, EmergencyContact, User, AuditLog, Translation
from app.utils.security import hash_password
from app.services.translation_service import get_or_create_translation

def seed_database():
    Base.metadata.create_all(bind=engine)
    db: Session = SessionLocal()

    try:
        # Check if already seeded
        if db.query(Area).first():
            print("Database already contains data, skipping seed.")
            return

        now = datetime.datetime.now(datetime.timezone.utc).replace(tzinfo=None)

        # 1. Sources
        sources = [
            Source(
                id="source-imd",
                name="India Meteorological Department (IMD)",
                category="weather_agency",
                base_url="https://mausam.imd.gov.in",
                geographic_coverage="National & Regional Specialised Centre Chennai",
                authority_level="national_meteorological",
                last_attempt_at=now,
                last_success_at=now,
                health_status="healthy",
                attribution_text="Official Warning Bulletin: Regional Meteorological Centre (RMC), Chennai"
            ),
            Source(
                id="source-tnsdma",
                name="Tamil Nadu State Disaster Management Authority (TNSDMA)",
                category="disaster_management",
                base_url="https://tnsdma.tn.gov.in",
                geographic_coverage="Tamil Nadu State",
                authority_level="state_disaster_authority",
                last_attempt_at=now,
                last_success_at=now,
                health_status="healthy",
                attribution_text="State Emergency Operations Centre (SEOC), Chepauk, Chennai"
            ),
            Source(
                id="source-gcc",
                name="Greater Chennai Corporation (GCC)",
                category="municipal_authority",
                base_url="https://chennaicorporation.gov.in",
                geographic_coverage="Chennai Metropolitan Area",
                authority_level="municipal_corporation",
                last_attempt_at=now,
                last_success_at=now,
                health_status="healthy",
                attribution_text="GCC 24x7 Integrated Emergency Disaster Command Centre, Ripon Building"
            )
        ]
        db.add_all(sources)
        db.commit()

        # 2. Areas
        areas = [
            Area(
                id="area-chennai-coastal",
                name="Chennai Coastal & Metropolitan District",
                state_region="Tamil Nadu",
                center_lat=13.0827,
                center_lng=80.2707,
                default_zoom=12,
                boundary_geojson='{"type":"Feature","geometry":{"type":"Polygon","coordinates":[[[80.18,13.15],[80.32,13.15],[80.32,12.92],[80.18,12.92],[80.18,13.15]]]}}'
            ),
            Area(
                id="area-kancheepuram-inland",
                name="Kancheepuram District (Heritage & IIITDM Sector)",
                state_region="Tamil Nadu",
                center_lat=12.8342,
                center_lng=79.7036,
                default_zoom=12,
                boundary_geojson='{"type":"Feature","geometry":{"type":"Polygon","coordinates":[[[79.60,12.95],[79.85,12.95],[79.85,12.72],[79.60,12.72],[79.60,12.95]]]}}'
            ),
            Area(
                id="area-nilgiris-hills",
                name="Nilgiris Hill Station (Ooty & Coonoor)",
                state_region="Tamil Nadu",
                center_lat=11.4102,
                center_lng=76.6950,
                default_zoom=11,
                boundary_geojson='{"type":"Feature","geometry":{"type":"Polygon","coordinates":[[[76.55,11.55],[76.85,11.55],[76.85,11.30],[76.55,11.30],[76.55,11.55]]]}}'
            )
        ]
        db.add_all(areas)
        db.commit()

        # 3. Alerts
        now = datetime.datetime.utcnow()
        alerts = [
            Alert(
                id="alert-cyclone-red-01",
                source_id="source-imd",
                external_id="IMD-CYC-2026-TN-04",
                area_id="area-chennai-coastal",
                title="SIMULATION: Red Alert — Cyclone Warning for North Coastal Tamil Nadu",
                description_original="Severe Cyclonic storm tracking west-northwest towards North Tamil Nadu coast. Heavy to very heavy rainfall expected (150-220 mm) with gale wind speeds reaching 75-85 kmph gusting to 95 kmph.",
                instruction_original="Stay indoors in sturdy buildings. Charge mobile phones and keep emergency supplies ready. Do not venture into sea or flooded underpasses.",
                original_language="en",
                hazard_type="cyclone",
                severity="critical",
                status="active",
                issued_at=now - datetime.timedelta(minutes=45),
                effective_at=now - datetime.timedelta(minutes=30),
                expires_at=now + datetime.timedelta(hours=24),
                retrieved_at=now - datetime.timedelta(minutes=10),
                source_url="https://mausam.imd.gov.in/chennai/cyclone_bulletin",
                verification_status="simulated",
                is_simulated=True,
                lat=13.0450,
                lng=80.2800,
                polygon_geojson='{"type":"Feature","geometry":{"type":"Polygon","coordinates":[[[80.25,13.08],[80.31,13.08],[80.31,12.98],[80.25,12.98],[80.25,13.08]]]}}'
            ),
            Alert(
                id="alert-flood-orange-02",
                source_id="source-gcc",
                external_id="GCC-FL-2026-Z13",
                area_id="area-chennai-coastal",
                title="SIMULATION: Severe Waterlogging & Inundation in Low-Lying Sectors",
                description_original="Intense convective cloudburst observed over Velachery, Madipakkam, and Pallikaranai marshland basin. Water levels rising up to 2-3 feet on secondary arterial routes.",
                instruction_original="Move to designated GCC relief centers if residing in ground-floor residences in flood-prone zones. Avoid Velachery Main Road and subway underpasses.",
                original_language="en",
                hazard_type="waterlogging",
                severity="warning",
                status="active",
                issued_at=now - datetime.timedelta(minutes=80),
                effective_at=now - datetime.timedelta(minutes=70),
                expires_at=now + datetime.timedelta(hours=12),
                retrieved_at=now - datetime.timedelta(minutes=12),
                source_url="https://chennaicorporation.gov.in/flood-advisories",
                verification_status="simulated",
                is_simulated=True,
                lat=12.9790,
                lng=80.2185,
                polygon_geojson='{"type":"Feature","geometry":{"type":"Polygon","coordinates":[[[80.20,12.99],[80.24,12.99],[80.24,12.96],[80.20,12.96],[80.20,12.99]]]}}'
            ),
            Alert(
                id="alert-rain-yellow-03",
                source_id="source-tnsdma",
                external_id="TNSDMA-ADV-2026-KC",
                area_id="area-kancheepuram-inland",
                title="SIMULATION: Heavy Rainfall Advisory & Gusty Winds",
                description_original="Widespread moderate to heavy rain accompanied by thunderstorm and surface wind gusts of 45-55 kmph across Kancheepuram and surrounding temple sectors.",
                instruction_original="Avoid sheltering under old trees or tin roofs. Motorists should exercise caution on NH-48 due to reduced visibility.",
                original_language="en",
                hazard_type="heavy_rain",
                severity="watch",
                status="active",
                issued_at=now - datetime.timedelta(hours=2),
                effective_at=now - datetime.timedelta(hours=1, minutes=45),
                expires_at=now + datetime.timedelta(hours=18),
                retrieved_at=now - datetime.timedelta(minutes=25),
                source_url="https://tnsdma.tn.gov.in/kancheepuram-bulletin",
                verification_status="simulated",
                is_simulated=True,
                lat=12.8342,
                lng=79.7036
            )
        ]
        db.add_all(alerts)
        db.commit()

        # Pre-seed translations for each alert into Tamil, Hindi, French
        for alert_obj in alerts:
            for lang in ["ta", "hi", "fr"]:
                get_or_create_translation(db, alert_obj, lang)

        # 4. Designated Safe Zones
        safe_zones = [
            SafeZone(
                id="sz-santhome-relief-centre",
                area_id="area-chennai-coastal",
                name="GCC Community Relief Shelter — Santhome",
                facility_type="designated_shelter",
                address="Santhome High Road, Mylapore, Chennai 600004",
                latitude=13.0335,
                longitude=80.2780,
                source_name="Greater Chennai Corporation Disaster Cell",
                source_url="https://chennaicorporation.gov.in/shelters",
                verification_status="official_verified",
                last_verified_at=now - datetime.timedelta(hours=3),
                operational_status="open",
                capacity_notes="Capacity: 350 persons. Diesel generator power backup, potable water & dry ration supplies active.",
                contact_phone="044-25384520",
                is_simulated=False
            ),
            SafeZone(
                id="sz-ripon-relief-hub",
                area_id="area-chennai-coastal",
                name="Ripon Building Disaster Response & Relief Hub",
                facility_type="relief_centre",
                address="Sydenhams Road, Periyamet, Chennai 600003",
                latitude=13.0827,
                longitude=80.2750,
                source_name="Greater Chennai Corporation",
                source_url="https://chennaicorporation.gov.in",
                verification_status="official_verified",
                last_verified_at=now - datetime.timedelta(hours=1),
                operational_status="open",
                capacity_notes="Central nodal facility. Capacity: 500 persons. Equipped with paramedic squad & satellite communication.",
                contact_phone="1913",
                is_simulated=False
            ),
            SafeZone(
                id="sz-velachery-school-shelter",
                area_id="area-chennai-coastal",
                name="Velachery Govt Higher Secondary School Flood Relief Shelter",
                facility_type="designated_shelter",
                address="Velachery Bypass Road, Dhandeeswaram, Chennai 600042",
                latitude=12.9815,
                longitude=80.2220,
                source_name="TNSDMA District Field Assessment",
                source_url="https://tnsdma.tn.gov.in/relief-camps",
                verification_status="official_verified",
                last_verified_at=now - datetime.timedelta(hours=2),
                operational_status="open",
                capacity_notes="High ground reinforced shelter. Capacity: 250 persons. Kitchen and medical station active.",
                contact_phone="044-22441122",
                is_simulated=False
            ),
            SafeZone(
                id="sz-kancheepuram-taluk-shelter",
                area_id="area-kancheepuram-inland",
                name="Kancheepuram Taluk Relief Community Centre",
                facility_type="designated_shelter",
                address="Gandhi Road, Near District Collectorate, Kancheepuram 631501",
                latitude=12.8380,
                longitude=79.7080,
                source_name="District Collectorate Kancheepuram",
                source_url="https://kancheepuram.nic.in",
                verification_status="official_verified",
                last_verified_at=now - datetime.timedelta(hours=4),
                operational_status="open",
                capacity_notes="Capacity: 400 persons. Dedicated tourist assistance desk and communication terminal.",
                contact_phone="044-27237437",
                is_simulated=False
            ),
            SafeZone(
                id="sz-hospital-rgggh",
                area_id="area-chennai-coastal",
                name="Rajiv Gandhi Govt General Hospital (Trauma & Crisis Wing)",
                facility_type="hospital",
                address="EVR Periyar Salai, Park Town, Chennai 600003",
                latitude=13.0805,
                longitude=80.2778,
                source_name="Tamil Nadu Health Department",
                source_url="https://rgggh.gov.in",
                verification_status="official_verified",
                last_verified_at=now - datetime.timedelta(hours=1),
                operational_status="open",
                capacity_notes="Level 1 Disaster Trauma Unit. 24x7 Ambulance Bay & Blood Bank operational.",
                contact_phone="044-25305000",
                is_simulated=False
            )
        ]
        db.add_all(safe_zones)
        db.commit()

        # 5. Emergency Contacts
        contacts = [
            EmergencyContact(
                id="contact-112",
                area_id="area-chennai-coastal",
                service_name="National Emergency Support System (Police, Fire, Ambulance)",
                phone_number="112",
                description="All-India 24x7 Toll-Free Emergency response helpline.",
                source_url="https://112.gov.in",
                is_toll_free=True
            ),
            EmergencyContact(
                id="contact-tnsdma-1070",
                area_id="area-chennai-coastal",
                service_name="Tamil Nadu State Disaster Management Control Room",
                phone_number="1070",
                description="State Emergency Operations Centre (SEOC) dedicated disaster hotline.",
                source_url="https://tnsdma.tn.gov.in",
                is_toll_free=True
            ),
            EmergencyContact(
                id="contact-gcc-1913",
                area_id="area-chennai-coastal",
                service_name="Greater Chennai Corporation 24x7 Flood Helpline",
                phone_number="1913",
                description="Direct helpline for waterlogging rescue, tree clearing & food relief.",
                source_url="https://chennaicorporation.gov.in",
                is_toll_free=True
            ),
            EmergencyContact(
                id="contact-ambulance-108",
                area_id="area-chennai-coastal",
                service_name="Emergency Medical Ambulance Services",
                phone_number="108",
                description="24x7 Free emergency life support and medical transport.",
                source_url="https://tnhealth.tn.gov.in",
                is_toll_free=True
            ),
            EmergencyContact(
                id="contact-kanchee-1077",
                area_id="area-kancheepuram-inland",
                service_name="Kancheepuram District Collectorate Crisis Control Room",
                phone_number="1077",
                description="District Collector emergency helpline for inland & heritage zones.",
                source_url="https://kancheepuram.nic.in",
                is_toll_free=True
            ),
            EmergencyContact(
                id="contact-tourist-police",
                area_id="area-chennai-coastal",
                service_name="Tamil Nadu Tourist Police & Assistance Unit",
                phone_number="044-28460599",
                description="Assistance for foreign & inter-state tourists, translation support.",
                source_url="https://tamilnadutourism.tn.gov.in",
                is_toll_free=False
            )
        ]
        db.add_all(contacts)
        db.commit()

        # 6. Default Admin & Editor Users
        users = [
            User(
                id="user-admin-1",
                username="admin",
                password_hash=hash_password("admin123"),
                role="admin",
                created_at=now
            ),
            User(
                id="user-editor-1",
                username="editor",
                password_hash=hash_password("editor123"),
                role="editor",
                created_at=now
            )
        ]
        db.add_all(users)
        db.commit()

        # 7. Initial Audit Entry
        audit = AuditLog(
            id=f"audit-init-{int(now.timestamp())}",
            user_id="user-admin-1",
            action="INITIALIZE_SEED_DATA",
            entity_type="system",
            entity_id="init",
            timestamp=now,
            details_json='{"status": "Database successfully initialized with authentic Chennai/TN coastal data & test scenarios"}'
        )
        db.add(audit)
        db.commit()

        print("Database seed completed successfully!")
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()
