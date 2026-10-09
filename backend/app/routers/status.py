import datetime
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import Source, Alert, SafeZone
from app.schemas import StatusOut

router = APIRouter(prefix="/api", tags=["status"])

@router.get("/health")
def health_check():
    return {
        "status": "healthy",
        "service": "SafeRoute Crisis Communication API",
        "timestamp": datetime.datetime.utcnow().isoformat(),
        "version": "1.0.0"
    }

@router.get("/status", response_model=StatusOut)
def get_system_status(db: Session = Depends(get_db)):
    sources = db.query(Source).all()
    active_alerts = db.query(Alert).filter(Alert.status == "active").count()
    safe_zones = db.query(SafeZone).count()
    healthy_sources = sum(1 for s in sources if s.health_status == "healthy")

    # Overall mode: if any source is degraded, report degraded; if all healthy, healthy
    overall_status = "healthy"
    if any(s.health_status == "unavailable" for s in sources):
        overall_status = "degraded"
    elif any(s.health_status == "degraded" for s in sources):
        overall_status = "degraded"

    last_refresh = max(
        (s.last_success_at for s in sources if s.last_success_at),
        default=datetime.datetime.utcnow()
    )

    return {
        "status": overall_status,
        "mode": "live_with_simulations",
        "active_alerts_count": active_alerts,
        "safe_zones_count": safe_zones,
        "sources_healthy_count": healthy_sources,
        "sources_total_count": len(sources),
        "last_successful_refresh": last_refresh,
        "sources": sources
    }
