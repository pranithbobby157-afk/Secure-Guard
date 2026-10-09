import datetime
import json
import uuid
from typing import List
from fastapi import APIRouter, Depends, HTTPException, Body
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import Alert, SafeZone, Source, AuditLog, User
from app.schemas import (
    AlertOut, AlertCreate, AlertUpdate,
    SafeZoneOut, SafeZoneCreate,
    AuditLogOut, SourceOut
)
from app.routers.auth import get_current_user
from app.services.ingestion_service import IngestionService
from app.services.translation_service import get_or_create_translation

router = APIRouter(prefix="/api/admin", tags=["admin"])

@router.post("/alerts", response_model=AlertOut)
def create_alert(
    req: AlertCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    now = datetime.datetime.now(datetime.timezone.utc).replace(tzinfo=None)
    alert_id = f"alert-sim-{uuid.uuid4().hex[:10]}"
    
    # Pick source (default to GCC or first source if not specified)
    source = db.query(Source).first()
    source_id = source.id if source else "source-gcc"

    # Always ensure title indicates SIMULATION if is_simulated
    title = req.title
    if req.is_simulated and not title.startswith("SIMULATION:"):
        title = f"SIMULATION: {title}"

    new_alert = Alert(
        id=alert_id,
        source_id=source_id,
        external_id=f"EDITOR-{int(now.timestamp())}",
        area_id=req.area_id,
        title=title,
        description_original=req.description_original,
        instruction_original=req.instruction_original,
        original_language=req.original_language,
        hazard_type=req.hazard_type,
        severity=req.severity,
        status=req.status,
        issued_at=now,
        effective_at=now,
        expires_at=now + datetime.timedelta(hours=24),
        retrieved_at=now,
        source_url=req.source_url,
        verification_status=req.verification_status,
        is_simulated=req.is_simulated,
        lat=req.lat,
        lng=req.lng
    )
    db.add(new_alert)
    db.commit()
    db.refresh(new_alert)

    # Pre-generate translations
    for lang in ["ta", "hi", "fr"]:
        get_or_create_translation(db, new_alert, lang)

    audit = AuditLog(
        id=f"audit-{uuid.uuid4().hex[:12]}",
        user_id=current_user.id,
        action="CREATE_ALERT",
        entity_type="alert",
        entity_id=new_alert.id,
        timestamp=now,
        details_json=json.dumps({"title": new_alert.title, "severity": new_alert.severity, "is_simulated": new_alert.is_simulated})
    )
    db.add(audit)
    db.commit()

    freshness_info = IngestionService.calculate_freshness(new_alert, new_alert.source)
    return {
        "id": new_alert.id,
        "source_id": new_alert.source_id,
        "external_id": new_alert.external_id,
        "area_id": new_alert.area_id,
        "title": new_alert.title,
        "description_original": new_alert.description_original,
        "instruction_original": new_alert.instruction_original,
        "original_language": new_alert.original_language,
        "hazard_type": new_alert.hazard_type,
        "severity": new_alert.severity,
        "status": new_alert.status,
        "issued_at": new_alert.issued_at,
        "effective_at": new_alert.effective_at,
        "expires_at": new_alert.expires_at,
        "retrieved_at": new_alert.retrieved_at,
        "source_url": new_alert.source_url,
        "verification_status": new_alert.verification_status,
        "is_simulated": new_alert.is_simulated,
        "lat": new_alert.lat,
        "lng": new_alert.lng,
        "polygon_geojson": new_alert.polygon_geojson,
        "source": new_alert.source,
        "area": new_alert.area,
        "translations": new_alert.translations,
        "is_stale": freshness_info["is_stale"],
        "freshness_minutes": freshness_info["freshness_minutes"]
    }

@router.patch("/alerts/{alert_id}", response_model=AlertOut)
def update_alert(
    alert_id: str,
    req: AlertUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    alert = db.query(Alert).filter(Alert.id == alert_id).first()
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")

    changes = {}
    if req.title is not None:
        alert.title = req.title
        changes["title"] = req.title
    if req.description_original is not None:
        alert.description_original = req.description_original
        changes["description_original"] = req.description_original
    if req.instruction_original is not None:
        alert.instruction_original = req.instruction_original
        changes["instruction_original"] = req.instruction_original
    if req.severity is not None:
        alert.severity = req.severity
        changes["severity"] = req.severity
    if req.status is not None:
        alert.status = req.status
        changes["status"] = req.status
    if req.verification_status is not None:
        alert.verification_status = req.verification_status
        changes["verification_status"] = req.verification_status
    if req.lat is not None:
        alert.lat = req.lat
    if req.lng is not None:
        alert.lng = req.lng

    now = datetime.datetime.now(datetime.timezone.utc).replace(tzinfo=None)
    audit = AuditLog(
        id=f"audit-{uuid.uuid4().hex[:12]}",
        user_id=current_user.id,
        action="UPDATE_ALERT",
        entity_type="alert",
        entity_id=alert.id,
        timestamp=now,
        details_json=json.dumps(changes)
    )
    db.add(audit)
    db.commit()
    db.refresh(alert)

    freshness_info = IngestionService.calculate_freshness(alert, alert.source)
    return {
        "id": alert.id,
        "source_id": alert.source_id,
        "external_id": alert.external_id,
        "area_id": alert.area_id,
        "title": alert.title,
        "description_original": alert.description_original,
        "instruction_original": alert.instruction_original,
        "original_language": alert.original_language,
        "hazard_type": alert.hazard_type,
        "severity": alert.severity,
        "status": alert.status,
        "issued_at": alert.issued_at,
        "effective_at": alert.effective_at,
        "expires_at": alert.expires_at,
        "retrieved_at": alert.retrieved_at,
        "source_url": alert.source_url,
        "verification_status": alert.verification_status,
        "is_simulated": alert.is_simulated,
        "lat": alert.lat,
        "lng": alert.lng,
        "polygon_geojson": alert.polygon_geojson,
        "source": alert.source,
        "area": alert.area,
        "translations": alert.translations,
        "is_stale": freshness_info["is_stale"],
        "freshness_minutes": freshness_info["freshness_minutes"]
    }

@router.delete("/alerts/{alert_id}")
def delete_alert(
    alert_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    alert = db.query(Alert).filter(Alert.id == alert_id).first()
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")

    now = datetime.datetime.now(datetime.timezone.utc).replace(tzinfo=None)
    audit = AuditLog(
        id=f"audit-{uuid.uuid4().hex[:12]}",
        user_id=current_user.id,
        action="DELETE_ALERT",
        entity_type="alert",
        entity_id=alert.id,
        timestamp=now,
        details_json=json.dumps({"title": alert.title})
    )
    db.add(audit)
    db.delete(alert)
    db.commit()
    return {"message": f"Alert {alert_id} deleted successfully"}

@router.post("/safe-zones", response_model=SafeZoneOut)
def create_safe_zone(
    req: SafeZoneCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    now = datetime.datetime.now(datetime.timezone.utc).replace(tzinfo=None)
    sz_id = f"sz-editor-{uuid.uuid4().hex[:10]}"
    new_sz = SafeZone(
        id=sz_id,
        area_id=req.area_id,
        name=req.name,
        facility_type=req.facility_type,
        address=req.address,
        latitude=req.latitude,
        longitude=req.longitude,
        source_name=req.source_name,
        source_url=req.source_url,
        verification_status=req.verification_status,
        last_verified_at=now,
        operational_status=req.operational_status,
        capacity_notes=req.capacity_notes,
        contact_phone=req.contact_phone,
        is_simulated=req.is_simulated
    )
    db.add(new_sz)

    audit = AuditLog(
        id=f"audit-sz-{uuid.uuid4().hex[:12]}",
        user_id=current_user.id,
        action="CREATE_SAFE_ZONE",
        entity_type="safe_zone",
        entity_id=sz_id,
        timestamp=now,
        details_json=json.dumps({"name": new_sz.name, "facility_type": new_sz.facility_type})
    )
    db.add(audit)
    db.commit()
    db.refresh(new_sz)
    return new_sz

@router.post("/sources/{source_id}/refresh", response_model=SourceOut)
def refresh_source_endpoint(
    source_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return IngestionService.refresh_source(db, source_id, current_user.username)

@router.post("/sources/{source_id}/toggle-status", response_model=SourceOut)
def toggle_source_status(
    source_id: str,
    new_status: str = Body(..., embed=True),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return IngestionService.toggle_source_health(db, source_id, new_status, current_user.username)

@router.get("/audit-logs", response_model=List[AuditLogOut])
def get_audit_logs(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return db.query(AuditLog).order_by(AuditLog.timestamp.desc()).limit(50).all()
