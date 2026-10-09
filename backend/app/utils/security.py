import hashlib
import hmac
import base64
import json
import time
from typing import Optional, Dict
from app.config import SECRET_KEY

def hash_password(password: str) -> str:
    salt = "saferoute_salt_"
    h = hashlib.sha256((salt + password).encode("utf-8")).hexdigest()
    return f"sha256${h}"

def verify_password(plain_password: str, hashed_password: str) -> bool:
    expected = hash_password(plain_password)
    return hmac.compare_digest(expected, hashed_password)

def create_access_token(data: dict, expires_in_seconds: int = 86400) -> str:
    payload = data.copy()
    payload["exp"] = int(time.time()) + expires_in_seconds
    raw = json.dumps(payload, separators=(',', ':')).encode('utf-8')
    b64_payload = base64.urlsafe_b64encode(raw).decode('utf-8')
    
    sig = hmac.new(SECRET_KEY.encode('utf-8'), b64_payload.encode('utf-8'), hashlib.sha256).hexdigest()
    return f"{b64_payload}.{sig}"

def decode_access_token(token: str) -> Optional[Dict]:
    try:
        parts = token.split(".")
        if len(parts) != 2:
            return None
        b64_payload, sig = parts
        expected_sig = hmac.new(SECRET_KEY.encode('utf-8'), b64_payload.encode('utf-8'), hashlib.sha256).hexdigest()
        if not hmac.compare_digest(sig, expected_sig):
            return None
        raw = base64.urlsafe_b64decode(b64_payload.encode('utf-8'))
        payload = json.loads(raw.decode('utf-8'))
        if payload.get("exp", 0) < int(time.time()):
            return None
        return payload
    except Exception:
        return None
