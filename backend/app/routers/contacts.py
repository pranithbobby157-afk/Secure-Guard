from typing import List, Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import EmergencyContact
from app.schemas import EmergencyContactOut

router = APIRouter(prefix="/api/emergency-contacts", tags=["contacts"])

@router.get("", response_model=List[EmergencyContactOut])
def list_contacts(
    area_id: Optional[str] = Query(None, description="Filter by area ID"),
    db: Session = Depends(get_db)
):
    query = db.query(EmergencyContact)
    if area_id:
        query = query.filter(EmergencyContact.area_id == area_id)
    return query.all()
