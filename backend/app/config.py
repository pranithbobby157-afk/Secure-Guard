import os
from typing import List
from dotenv import load_dotenv

load_dotenv()

PROJECT_NAME: str = "SafeRoute — Crisis Communication for Tourists"
PROJECT_VERSION: str = "1.0.0"
API_PREFIX: str = "/api"
ENVIRONMENT: str = os.getenv("ENVIRONMENT", "development")

DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./saferoute.db")
SECRET_KEY: str = os.getenv("SECRET_KEY", "saferoute-super-secure-crisis-comm-key-2026")
ALGORITHM: str = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24

default_origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
    "http://127.0.0.1:3000"
]
env_origins = os.getenv("CORS_ORIGINS", "")
if env_origins:
    CORS_ORIGINS: List[str] = [origin.strip() for origin in env_origins.split(",") if origin.strip()]
else:
    CORS_ORIGINS: List[str] = default_origins

SUPPORTED_LANGUAGES: List[str] = ["en", "ta", "hi", "fr"]
DEFAULT_AREA_ID: str = "area-chennai-coastal"

