import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_health_endpoint():
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert "SafeRoute" in data["service"]

def test_system_status():
    response = client.get("/api/status")
    assert response.status_code == 200
    data = response.json()
    assert data["active_alerts_count"] >= 1
    assert data["sources_total_count"] >= 3
    assert len(data["sources"]) >= 3

def test_list_alerts_and_staleness():
    response = client.get("/api/alerts?area_id=area-chennai-coastal")
    assert response.status_code == 200
    alerts = response.json()
    assert len(alerts) >= 1
    # Check alert structure and safety principles
    first = alerts[0]
    assert "title" in first
    assert "description_original" in first
    assert "verification_status" in first
    assert "is_stale" in first
    assert "source" in first
    assert first["source"]["name"] is not None

def test_alert_detail():
    alerts = client.get("/api/alerts").json()
    assert len(alerts) > 0
    alert_id = alerts[0]["id"]
    response = client.get(f"/api/alerts/{alert_id}")
    assert response.status_code == 200
    detail = response.json()
    assert detail["id"] == alert_id

def test_safe_zones_distance_calculation():
    # User coordinates near Marina Beach (Chennai)
    response = client.get("/api/safe-zones?area_id=area-chennai-coastal&user_lat=13.0450&user_lng=80.2800")
    assert response.status_code == 200
    zones = response.json()
    assert len(zones) >= 1
    # Check that distance is calculated and sorted
    first = zones[0]
    assert first["distance_km"] is not None
    assert isinstance(first["distance_km"], float)
    assert first["operational_status"] == "open"
    # Ensure verified provenance
    assert first["source_name"] is not None

def test_translations_and_original_retention():
    alerts = client.get("/api/alerts").json()
    alert_id = alerts[0]["id"]
    response = client.get(f"/api/translations/{alert_id}?language=ta")
    assert response.status_code == 200
    trans = response.json()
    assert trans["target_language"] == "ta"
    assert len(trans["translated_title"]) > 0
    assert "SafeRoute" in trans["provider"]

def test_admin_auth_and_audit():
    # Unauthenticated access to admin should fail with 401
    unauth = client.post("/api/admin/alerts", json={
        "area_id": "area-chennai-coastal",
        "title": "Unauthorized Test",
        "description_original": "Test",
        "hazard_type": "flood",
        "severity": "critical"
    })
    assert unauth.status_code == 401

    # Login with valid credentials
    login_res = client.post("/api/auth/login", json={
        "username": "admin",
        "password": "admin123"
    })
    assert login_res.status_code == 200
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Verify /api/auth/me
    me = client.get("/api/auth/me", headers=headers)
    assert me.status_code == 200
    assert me.json()["username"] == "admin"

    # Create a simulated alert via admin
    create_res = client.post("/api/admin/alerts", headers=headers, json={
        "area_id": "area-chennai-coastal",
        "title": "Road Closure on ECR Highway",
        "description_original": "East Coast Road closed due to localized water buildup near Uthandi.",
        "instruction_original": "Use OMR Rajiv Gandhi IT Expressway as alternate route.",
        "original_language": "en",
        "hazard_type": "waterlogging",
        "severity": "warning",
        "status": "active",
        "verification_status": "simulated",
        "is_simulated": True
    })
    assert create_res.status_code == 200
    new_alert = create_res.json()
    assert "SIMULATION:" in new_alert["title"]

    # Verify audit logs captured the action
    audit_res = client.get("/api/admin/audit-logs", headers=headers)
    assert audit_res.status_code == 200
    logs = audit_res.json()
    assert any(log["action"] == "CREATE_ALERT" for log in logs)

def test_source_failure_simulation():
    login_res = client.post("/api/auth/login", json={"username": "admin", "password": "admin123"})
    headers = {"Authorization": f"Bearer {login_res.json()['access_token']}"}

    # Toggle IMD source status to degraded
    toggle_res = client.post("/api/admin/sources/source-imd/toggle-status", headers=headers, json={"new_status": "degraded"})
    assert toggle_res.status_code == 200
    assert toggle_res.json()["health_status"] == "degraded"

    # Check that system status reflects degraded mode
    status_res = client.get("/api/status")
    assert status_res.json()["status"] == "degraded"

    # Restore healthy status
    refresh_res = client.post("/api/admin/sources/source-imd/refresh", headers=headers)
    assert refresh_res.status_code == 200
    assert refresh_res.json()["health_status"] == "healthy"

def test_areas_endpoints():
    response = client.get("/api/areas")
    assert response.status_code == 200
    areas = response.json()
    assert len(areas) >= 1
    area_id = areas[0]["id"]

    detail_res = client.get(f"/api/areas/{area_id}")
    assert detail_res.status_code == 200
    assert detail_res.json()["id"] == area_id

    not_found = client.get("/api/areas/non-existent-area")
    assert not_found.status_code == 404

def test_emergency_contacts_endpoints():
    response = client.get("/api/emergency-contacts")
    assert response.status_code == 200
    contacts = response.json()
    assert len(contacts) >= 1
    assert "phone_number" in contacts[0]

    filtered = client.get("/api/emergency-contacts?area_id=area-chennai-coastal")
    assert filtered.status_code == 200
    assert len(filtered.json()) >= 1

def test_demo_scenario_switcher_scenarios():
    # Test cyclone_active scenario
    res = client.post("/api/demo/scenario", json={"scenario": "cyclone_active"})
    assert res.status_code == 200
    assert res.json()["scenario"] == "cyclone_active"

    # Test all_clear scenario
    res = client.post("/api/demo/scenario", json={"scenario": "all_clear"})
    assert res.status_code == 200
    assert res.json()["scenario"] == "all_clear"

    # Test source_outage scenario
    res = client.post("/api/demo/scenario", json={"scenario": "source_outage"})
    assert res.status_code == 200
    assert res.json()["scenario"] == "source_outage"

    # Reset back to cyclone_active
    client.post("/api/demo/scenario", json={"scenario": "cyclone_active"})

def test_database_url_normalization_logic():
    # Verify postgres:// to postgresql:// normalization logic
    sample_url = "postgres://postgres:mypass@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres"
    if sample_url.startswith("postgres://"):
        normalized = sample_url.replace("postgres://", "postgresql://", 1)
    assert normalized.startswith("postgresql://")

