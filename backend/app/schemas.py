from datetime import datetime
from typing import Optional, List, Any
from pydantic import BaseModel, Field, ConfigDict

# ----------------- Source -----------------
class SourceOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    name: str
    category: str
    base_url: Optional[str] = None
    geographic_coverage: str
    authority_level: str
    last_attempt_at: Optional[datetime] = None
    last_success_at: Optional[datetime] = None
    health_status: str
    attribution_text: str

# ----------------- Area -----------------
class AreaOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    name: str
    state_region: str
    center_lat: float
    center_lng: float
    default_zoom: int
    boundary_geojson: Optional[str] = None

# ----------------- Translation -----------------
class TranslationOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    alert_id: str
    target_language: str
    translated_title: str
    translated_description: str
    translated_instruction: Optional[str] = None
    provider: str
    source_text_hash: str
    created_at: datetime

# ----------------- Alert -----------------
class AlertOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    source_id: str
    external_id: Optional[str] = None
    area_id: str
    title: str
    description_original: str
    instruction_original: Optional[str] = None
    original_language: str
    hazard_type: str
    severity: str
    status: str
    issued_at: datetime
    effective_at: Optional[datetime] = None
    expires_at: Optional[datetime] = None
    retrieved_at: datetime
    source_url: Optional[str] = None
    verification_status: str
    is_simulated: bool
    lat: Optional[float] = None
    lng: Optional[float] = None
    polygon_geojson: Optional[str] = None

    # Enriched relationships
    source: Optional[SourceOut] = None
    area: Optional[AreaOut] = None
    translations: Optional[List[TranslationOut]] = []

    # Calculated metadata
    is_stale: bool = False
    freshness_minutes: int = 0

class AlertCreate(BaseModel):
    area_id: str
    title: str
    description_original: str
    instruction_original: Optional[str] = None
    original_language: str = "en"
    hazard_type: str
    severity: str
    status: str = "active"
    source_url: Optional[str] = None
    verification_status: str = "simulated"
    is_simulated: bool = True
    lat: Optional[float] = None
    lng: Optional[float] = None

class AlertUpdate(BaseModel):
    title: Optional[str] = None
    description_original: Optional[str] = None
    instruction_original: Optional[str] = None
    severity: Optional[str] = None
    status: Optional[str] = None
    verification_status: Optional[str] = None
    lat: Optional[float] = None
    lng: Optional[float] = None

# ----------------- Safe Zone -----------------
class SafeZoneOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    area_id: str
    name: str
    facility_type: str
    address: str
    latitude: float
    longitude: float
    source_name: str
    source_url: Optional[str] = None
    verification_status: str
    last_verified_at: datetime
    operational_status: str
    capacity_notes: Optional[str] = None
    contact_phone: Optional[str] = None
    is_simulated: bool
    distance_km: Optional[float] = None

class SafeZoneCreate(BaseModel):
    area_id: str
    name: str
    facility_type: str
    address: str
    latitude: float
    longitude: float
    source_name: str
    source_url: Optional[str] = None
    verification_status: str = "editor_verified"
    operational_status: str = "open"
    capacity_notes: Optional[str] = None
    contact_phone: Optional[str] = None
    is_simulated: bool = False

# ----------------- Emergency Contact -----------------
class EmergencyContactOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    area_id: str
    service_name: str
    phone_number: str
    description: Optional[str] = None
    source_url: Optional[str] = None
    is_toll_free: bool

# ----------------- System Status -----------------
class StatusOut(BaseModel):
    status: str
    mode: str
    active_alerts_count: int
    safe_zones_count: int
    sources_healthy_count: int
    sources_total_count: int
    last_successful_refresh: Optional[datetime] = None
    sources: List[SourceOut] = []

# ----------------- Auth & User -----------------
class LoginRequest(BaseModel):
    username: str
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str
    role: str
    username: str

class UserOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    username: str
    role: str
    created_at: datetime

# ----------------- Audit Log -----------------
class AuditLogOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    user_id: Optional[str] = None
    action: str
    entity_type: str
    entity_id: Optional[str] = None
    timestamp: datetime
    details_json: Optional[str] = None
