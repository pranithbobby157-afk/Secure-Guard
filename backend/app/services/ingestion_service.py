import datetime
import uuid
from typing import Dict, Any, List
from sqlalchemy.orm import Session
from app.models import Source, Alert, AuditLog

class IngestionService:
    @staticmethod
    def calculate_freshness(alert: Alert, source: Source) -> Dict[str, Any]:
        """
        Determines relative age, freshness in minutes, and whether the data is considered stale.
        If source health is degraded/unavailable, or retrieved_at > 3 hours ago, mark stale.
        """
        now = datetime.datetime.now(datetime.timezone.utc).replace(tzinfo=None)
        delta = now - (alert.retrieved_at or alert.issued_at)
        minutes_ago = max(0, int(delta.total_seconds() // 60))
        
        is_stale = False
        if source and source.health_status in ["degraded", "unavailable"]:
            is_stale = True
        elif minutes_ago > 180:  # > 3 hours
            is_stale = True

        return {
            "freshness_minutes": minutes_ago,
            "is_stale": is_stale
        }

    @staticmethod
    def toggle_source_health(db: Session, source_id: str, new_status: str, user_id: str = "admin") -> Source:
        """
        Toggles or simulates source failure (e.g. IMD downtime) for testing/demoing degraded states.
        """
        src = db.query(Source).filter(Source.id == source_id).first()
        if not src:
            raise ValueError(f"Source with id {source_id} not found")

        now = datetime.datetime.now(datetime.timezone.utc).replace(tzinfo=None)
        old_status = src.health_status
        src.health_status = new_status
        src.last_attempt_at = now
        if new_status == "healthy":
            src.last_success_at = now

        # Log audit entry
        audit = AuditLog(
            id=f"audit-{uuid.uuid4().hex[:12]}",
            user_id=user_id,
            action="TOGGLE_SOURCE_HEALTH",
            entity_type="source",
            entity_id=source_id,
            timestamp=now,
            details_json=f'{{"old_status": "{old_status}", "new_status": "{new_status}"}}'
        )
        db.add(audit)
        db.commit()
        db.refresh(src)
        return src

    @staticmethod
    def refresh_source(db: Session, source_id: str, user_id: str = "admin") -> Source:
        """
        Simulate an official upstream sync. Updates last_attempt_at, last_success_at and alerts.
        """
        src = db.query(Source).filter(Source.id == source_id).first()
        if not src:
            raise ValueError(f"Source with id {source_id} not found")

        now = datetime.datetime.now(datetime.timezone.utc).replace(tzinfo=None)
        src.last_attempt_at = now
        src.last_success_at = now
        src.health_status = "healthy"

        # Update retrieved_at for alerts belonging to this source
        alerts = db.query(Alert).filter(Alert.source_id == source_id).all()
        for a in alerts:
            a.retrieved_at = now

        audit = AuditLog(
            id=f"audit-refresh-{uuid.uuid4().hex[:12]}",
            user_id=user_id,
            action="REFRESH_SOURCE",
            entity_type="source",
            entity_id=source_id,
            timestamp=now,
            details_json=f'{{"alerts_refreshed": {len(alerts)}}}'
        )
        db.add(audit)
        db.commit()
        db.refresh(src)
        return src
