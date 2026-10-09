from contextlib import asynccontextmanager
from fastapi import FastAPI, Depends, Body
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from app.config import PROJECT_NAME, PROJECT_VERSION, CORS_ORIGINS
from app.database import engine, Base, get_db
from app.seed_data import seed_database
from app.models import Alert, Source
from app.routers import alerts, safe_zones, areas, contacts, translations, status, auth, admin

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize schema and seed data on startup
    Base.metadata.create_all(bind=engine)
    seed_database()
    yield

app = FastAPI(
    title=PROJECT_NAME,
    version=PROJECT_VERSION,
    description="Real-Time Authoritative Crisis Communication for Tourists During Extreme Weather Events",
    lifespan=lifespan
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(status.router)
app.include_router(alerts.router)
app.include_router(safe_zones.router)
app.include_router(areas.router)
app.include_router(contacts.router)
app.include_router(translations.router)
app.include_router(auth.router)
app.include_router(admin.router)

# Demo scenario switcher for video presentation & judging
@app.post("/api/demo/scenario")
def set_demo_scenario(
    scenario: str = Body(..., embed=True),
    db: Session = Depends(get_db)
):
    """
    Convenient switcher for hackathon demonstration:
    - 'cyclone_active': Cyclone red alert active, sources healthy
    - 'all_clear': All alerts resolved/cancelled to demo the 'no active alerts' state
    - 'source_outage': IMD weather source marked degraded to demo stale-data banner
    """
    if scenario == "all_clear":
        alerts_list = db.query(Alert).all()
        for a in alerts_list:
            a.status = "cancelled"
        sources = db.query(Source).all()
        for s in sources:
            s.health_status = "healthy"
        db.commit()
        return {"scenario": "all_clear", "message": "All alerts marked cancelled. SafeRoute displays no-active-alerts state with disclaimer."}
    
    elif scenario in ("cyclone_active", "default"):
        alerts_list = db.query(Alert).all()
        for a in alerts_list:
            a.status = "active"
        sources = db.query(Source).all()
        for s in sources:
            s.health_status = "healthy"
        db.commit()
        return {"scenario": scenario, "message": "Active crisis alerts restored with healthy source feeds."}

    elif scenario == "source_outage":
        alerts_list = db.query(Alert).all()
        for a in alerts_list:
            a.status = "active"
        sources = db.query(Source).all()
        for s in sources:
            if s.id == "source-imd":
                s.health_status = "degraded"
            else:
                s.health_status = "healthy"
        db.commit()
        return {"scenario": "source_outage", "message": "IMD feed marked degraded. Frontend will display explicit stale-data warning."}

    return {"scenario": scenario, "message": "Unknown scenario"}
