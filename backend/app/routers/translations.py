from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import Alert
from app.schemas import TranslationOut
from app.services.translation_service import get_or_create_translation

router = APIRouter(prefix="/api/translations", tags=["translations"])

@router.get("/{alert_id}", response_model=TranslationOut)
def get_alert_translation(
    alert_id: str,
    language: str = Query(..., description="Target language code: ta, hi, fr, en"),
    db: Session = Depends(get_db)
):
    alert = db.query(Alert).filter(Alert.id == alert_id).first()
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")

    translation = get_or_create_translation(db, alert, language)
    if not translation:
        # If target language is the same as original language
        raise HTTPException(
            status_code=400,
            detail=f"Target language '{language}' matches alert's original language '{alert.original_language}'"
        )

    return translation
