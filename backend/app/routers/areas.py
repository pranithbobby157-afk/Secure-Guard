from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import Area
from app.schemas import AreaOut

router = APIRouter(prefix="/api/areas", tags=["areas"])

@router.get("", response_model=List[AreaOut])
def list_areas(db: Session = Depends(get_db)):
    return db.query(Area).all()

@router.get("/{area_id}", response_model=AreaOut)
def get_area(area_id: str, db: Session = Depends(get_db)):
    area = db.query(Area).filter(Area.id == area_id).first()
    if not area:
        raise HTTPException(status_code=404, detail="Area not found")
    return area
