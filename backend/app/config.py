import os
from typing import List

PROJECT_NAME: str = "SafeRoute — Crisis Communication for Tourists"
PROJECT_VERSION: str = "1.0.0"
API_PREFIX: str = "/api"

DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./saferoute.db")
SECRET_KEY: str = os.getenv("SECRET_KEY", "saferoute-super-secure-crisis-comm-key-2026")
ALGORITHM: str = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24

CORS_ORIGINS: List[str] = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
    "*"
]

SUPPORTED_LANGUAGES: List[str] = ["en", "ta", "hi", "fr"]
DEFAULT_AREA_ID: str = "area-chennai-coastal"
