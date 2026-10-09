import datetime
from sqlalchemy import (
    Column, String, Integer, Float, Boolean, DateTime, Text, ForeignKey
)
from sqlalchemy.orm import relationship
from app.database import Base

def get_utc_now():
    return datetime.datetime.now(datetime.timezone.utc).replace(tzinfo=None)


class Source(Base):
    __tablename__ = "sources"

    id = Column(String, primary_key=True, index=True)
    name = Column(String, nullable=False)
    category = Column(String, nullable=False)  # weather_agency, disaster_management, municipal_authority
    base_url = Column(String, nullable=True)
    geographic_coverage = Column(String, nullable=False)
    authority_level = Column(String, nullable=False)
    last_attempt_at = Column(DateTime, default=get_utc_now)
    last_success_at = Column(DateTime, default=get_utc_now)
    health_status = Column(String, default="healthy")  # healthy, degraded, unavailable
    attribution_text = Column(String, nullable=False)

    alerts = relationship("Alert", back_populates="source")


class Area(Base):
    __tablename__ = "areas"

    id = Column(String, primary_key=True, index=True)
    name = Column(String, nullable=False)
    state_region = Column(String, nullable=False)
    center_lat = Column(Float, nullable=False)
    center_lng = Column(Float, nullable=False)
    default_zoom = Column(Integer, default=11)
    boundary_geojson = Column(Text, nullable=True)

    alerts = relationship("Alert", back_populates="area")
    safe_zones = relationship("SafeZone", back_populates="area")
    contacts = relationship("EmergencyContact", back_populates="area")


class Alert(Base):
    __tablename__ = "alerts"

    id = Column(String, primary_key=True, index=True)
    source_id = Column(String, ForeignKey("sources.id"), nullable=False)
    external_id = Column(String, nullable=True)
    area_id = Column(String, ForeignKey("areas.id"), nullable=False)
    title = Column(String, nullable=False)
    description_original = Column(Text, nullable=False)
    instruction_original = Column(Text, nullable=True)
    original_language = Column(String, default="en")
    hazard_type = Column(String, nullable=False)  # cyclone, flood, heavy_rain, waterlogging, storm
    severity = Column(String, nullable=False)      # critical, warning, watch, advisory
    status = Column(String, default="active")       # active, expired, cancelled
    issued_at = Column(DateTime, default=get_utc_now)
    effective_at = Column(DateTime, nullable=True)
    expires_at = Column(DateTime, nullable=True)
    retrieved_at = Column(DateTime, default=get_utc_now)
    source_url = Column(String, nullable=True)
    verification_status = Column(String, default="official_source")  # official_source, editor_verified, simulated
    is_simulated = Column(Boolean, default=False)
    lat = Column(Float, nullable=True)
    lng = Column(Float, nullable=True)
    polygon_geojson = Column(Text, nullable=True)

    source = relationship("Source", back_populates="alerts")
    area = relationship("Area", back_populates="alerts")
    translations = relationship("Translation", back_populates="alert", cascade="all, delete-orphan")


class SafeZone(Base):
    __tablename__ = "safe_zones"

    id = Column(String, primary_key=True, index=True)
    area_id = Column(String, ForeignKey("areas.id"), nullable=False)
    name = Column(String, nullable=False)
    facility_type = Column(String, nullable=False)  # designated_shelter, relief_centre, hospital
    address = Column(String, nullable=False)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    source_name = Column(String, nullable=False)
    source_url = Column(String, nullable=True)
    verification_status = Column(String, default="official_verified")
    last_verified_at = Column(DateTime, default=get_utc_now)
    operational_status = Column(String, default="open")  # open, on_standby, unverified
    capacity_notes = Column(String, nullable=True)
    contact_phone = Column(String, nullable=True)
    is_simulated = Column(Boolean, default=False)

    area = relationship("Area", back_populates="safe_zones")


class Translation(Base):
    __tablename__ = "translations"

    id = Column(String, primary_key=True, index=True)
    alert_id = Column(String, ForeignKey("alerts.id"), nullable=False)
    target_language = Column(String, nullable=False)  # en, ta, hi, fr
    translated_title = Column(String, nullable=False)
    translated_description = Column(Text, nullable=False)
    translated_instruction = Column(Text, nullable=True)
    provider = Column(String, default="SafeRoute Linguistic Engine")
    source_text_hash = Column(String, nullable=False)
    created_at = Column(DateTime, default=get_utc_now)

    alert = relationship("Alert", back_populates="translations")


class EmergencyContact(Base):
    __tablename__ = "emergency_contacts"

    id = Column(String, primary_key=True, index=True)
    area_id = Column(String, ForeignKey("areas.id"), nullable=False)
    service_name = Column(String, nullable=False)
    phone_number = Column(String, nullable=False)
    description = Column(String, nullable=True)
    source_url = Column(String, nullable=True)
    is_toll_free = Column(Boolean, default=True)

    area = relationship("Area", back_populates="contacts")


class User(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True, index=True)
    username = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)
    role = Column(String, default="editor")  # admin, editor
    created_at = Column(DateTime, default=get_utc_now)


class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(String, primary_key=True, index=True)
    user_id = Column(String, ForeignKey("users.id"), nullable=True)
    action = Column(String, nullable=False)
    entity_type = Column(String, nullable=False)
    entity_id = Column(String, nullable=True)
    timestamp = Column(DateTime, default=get_utc_now)
    details_json = Column(Text, nullable=True)
