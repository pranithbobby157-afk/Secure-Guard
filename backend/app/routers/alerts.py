from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import Alert, Source
from app.schemas import AlertOut
from app.services.ingestion_service import IngestionService

router = APIRouter(prefix="/api/alerts", tags=["alerts"])

@router.get("", response_model=List[AlertOut])
def list_alerts(
    area_id: Optional[str] = Query(None, description="Filter by area ID"),
    hazard_type: Optional[str] = Query(None, description="Filter by hazard type"),
    severity: Optional[str] = Query(None, description="Filter by severity"),
    status: Optional[str] = Query("active", description="Filter by status"),
    db: Session = Depends(get_db)
):
    query = db.query(Alert)
    
    if area_id:
        query = query.filter(Alert.area_id == area_id)
    if hazard_type:
        query = query.filter(Alert.hazard_type == hazard_type)
    if severity:
        query = query.filter(Alert.severity == severity)
    if status and status != "all":
        query = query.filter(Alert.status == status)

    alerts = query.order_by(Alert.issued_at.desc()).all()
    
    results = []
    for a in alerts:
        freshness_info = IngestionService.calculate_freshness(a, a.source)
        alert_dict = {
            "id": a.id,
            "source_id": a.source_id,
            "external_id": a.external_id,
            "area_id": a.area_id,
            "title": a.title,
            "description_original": a.description_original,
            "instruction_original": a.instruction_original,
            "original_language": a.original_language,
            "hazard_type": a.hazard_type,
            "severity": a.severity,
            "status": a.status,
            "issued_at": a.issued_at,
            "effective_at": a.effective_at,
            "expires_at": a.expires_at,
            "retrieved_at": a.retrieved_at,
            "source_url": a.source_url,
            "verification_status": a.verification_status,
            "is_simulated": a.is_simulated,
            "lat": a.lat,
            "lng": a.lng,
            "polygon_geojson": a.polygon_geojson,
            "source": a.source,
            "area": a.area,
            "translations": a.translations,
            "is_stale": freshness_info["is_stale"],
            "freshness_minutes": freshness_info["freshness_minutes"]
        }
        results.append(alert_dict)

    return results

@router.get("/{alert_id}", response_model=AlertOut)
def get_alert_detail(alert_id: str, db: Session = Depends(get_db)):
    alert = db.query(Alert).filter(Alert.id == alert_id).first()
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")
        
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
