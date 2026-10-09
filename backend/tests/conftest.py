import pytest
import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

# Ensure environment is set to testing
os.environ["ENVIRONMENT"] = "testing"
os.environ["DATABASE_URL"] = "sqlite:///:memory:"

from app.database import Base, get_db
from app.models import Source, Area, Alert, SafeZone, EmergencyContact, User, AuditLog, Translation
from app.seed_data import seed_database
from app.main import app
from fastapi.testclient import TestClient

# Create in-memory SQLite database shared across the test session
test_engine = create_engine(
    "sqlite:///:memory:",
    connect_args={"check_same_thread": False},
    poolclass=StaticPool
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=test_engine)

@pytest.fixture(scope="session", autouse=True)
def setup_test_db():
    Base.metadata.create_all(bind=test_engine)
    # Seed test database
    db = TestingSessionLocal()
    try:
        from app.seed_data import (
            Source, Area, Alert, SafeZone, EmergencyContact, User, AuditLog
        )
        # Import and run seed logic directly bound to test_engine
        import datetime
        now = datetime.datetime.now(datetime.timezone.utc).replace(tzinfo=None)
        
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

        areas = [
            Area(
                id="area-chennai-coastal",
                name="Chennai Coastal & Urban Core",
                state_region="Tamil Nadu",
                center_lat=13.0827,
                center_lng=80.2707,
                default_zoom=12
            ),
            Area(
                id="area-kancheepuram-inland",
                name="Kancheepuram Inland Basin",
                state_region="Tamil Nadu",
                center_lat=12.8342,
                center_lng=79.7036,
                default_zoom=12
            )
        ]
        db.add_all(areas)

        alerts = [
            Alert(
                id="alert-cyclone-red-01",
                source_id="source-imd",
                external_id="IMD-CHE-2026-RED-004",
                area_id="area-chennai-coastal",
                title="Severe Cyclone Advisory: Extreme Wind & Heavy Coastal Rainfall",
                description_original="Severe cyclonic storm approaching Chennai coast with gusts up to 95 km/h. High astronomical tides expected.",
                instruction_original="Stay indoors. Do not visit Marina or Elliot's Beach. Avoid low-lying subways in Vyasarpadi and Ganesapuram.",
                original_language="en",
                hazard_type="cyclone",
                severity="critical",
                status="active",
                issued_at=now - datetime.timedelta(minutes=30),
                effective_at=now,
                expires_at=now + datetime.timedelta(hours=18),
                retrieved_at=now - datetime.timedelta(minutes=5),
                source_url="https://mausam.imd.gov.in/chennai",
                verification_status="official_source",
                is_simulated=False,
                lat=13.0450,
                lng=80.2800
            )
        ]
        db.add_all(alerts)

        safe_zones = [
            SafeZone(
                id="sz-gcc-ripon-relief",
                area_id="area-chennai-coastal",
                name="Ripon Building Disaster Relief Shelter & Medical Hub",
                facility_type="designated_shelter",
                address="Sydenhams Road, Periamet, Chennai 600003",
                latitude=13.0827,
                longitude=80.2750,
                source_name="Greater Chennai Corporation",
                source_url="https://chennaicorporation.gov.in",
                verification_status="official_verified",
                last_verified_at=now - datetime.timedelta(hours=1),
                operational_status="open",
                capacity_notes="Capacity: 500 persons.",
                contact_phone="1913",
                is_simulated=False
            )
        ]
        db.add_all(safe_zones)

        emergency_contacts = [
            EmergencyContact(
                id="contact-112",
                area_id="area-chennai-coastal",
                service_name="National Emergency Support System",
                phone_number="112",
                description="24x7 Emergency response helpline.",
                source_url="https://112.gov.in",
                is_toll_free=True
            )
        ]
        db.add_all(emergency_contacts)

        from app.utils.security import hash_password
        admin_user = User(
            id="user-admin",
            username="admin",
            password_hash=hash_password("admin123"),
            role="admin",
            created_at=now
        )
        db.add(admin_user)
        db.commit()
    finally:
        db.close()

    yield

    Base.metadata.drop_all(bind=test_engine)

def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db

@pytest.fixture
def client():
    return TestClient(app)
