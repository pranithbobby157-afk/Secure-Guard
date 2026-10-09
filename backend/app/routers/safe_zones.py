from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import SafeZone
from app.schemas import SafeZoneOut
from app.services.geo_service import annotate_safe_zones_with_distance

router = APIRouter(prefix="/api/safe-zones", tags=["safe-zones"])

@router.get("", response_model=List[SafeZoneOut])
def list_safe_zones(
    area_id: Optional[str] = Query(None, description="Filter by area ID"),
    user_lat: Optional[float] = Query(None, description="User's consented latitude"),
    user_lng: Optional[float] = Query(None, description="User's consented longitude"),
    db: Session = Depends(get_db)
):
    query = db.query(SafeZone)
    if area_id:
        query = query.filter(SafeZone.area_id == area_id)
        
    safe_zones = query.all()
    annotated = annotate_safe_zones_with_distance(safe_zones, user_lat, user_lng)
    return annotated

@router.get("/{safe_zone_id}", response_model=SafeZoneOut)
def get_safe_zone_detail(safe_zone_id: str, db: Session = Depends(get_db)):
    sz = db.query(SafeZone).filter(SafeZone.id == safe_zone_id).first()
    if not sz:
        raise HTTPException(status_code=404, detail="Safe zone not found")
        
    annotated = annotate_safe_zones_with_distance([sz], None, None)
    return annotated[0]
