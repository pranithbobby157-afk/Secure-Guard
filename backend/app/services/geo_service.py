import math
from typing import Optional, List, Dict, Any

def haversine_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """
    Calculate the great circle distance between two points on Earth in kilometers.
    """
    R = 6371.0  # Earth's radius in kilometers
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = (
        math.sin(dlat / 2) ** 2
        + math.cos(math.radians(lat1))
        * math.cos(math.radians(lat2))
        * math.sin(dlon / 2) ** 2
    )
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    distance = R * c
    return round(distance, 2)

def annotate_safe_zones_with_distance(
    safe_zones: List[Any], user_lat: Optional[float], user_lng: Optional[float]
) -> List[Dict[str, Any]]:
    """
    Given a list of SafeZone models and optional user coordinates,
    returns serialized dictionaries with approximate distance and sorted if coordinates are given.
    """
    results = []
    for sz in safe_zones:
        item = {
            "id": sz.id,
            "area_id": sz.area_id,
            "name": sz.name,
            "facility_type": sz.facility_type,
            "address": sz.address,
            "latitude": sz.latitude,
            "longitude": sz.longitude,
            "source_name": sz.source_name,
            "source_url": sz.source_url,
            "verification_status": sz.verification_status,
            "last_verified_at": sz.last_verified_at,
            "operational_status": sz.operational_status,
            "capacity_notes": sz.capacity_notes,
            "contact_phone": sz.contact_phone,
            "is_simulated": sz.is_simulated,
            "distance_km": None
        }
        if user_lat is not None and user_lng is not None:
            dist = haversine_distance(user_lat, user_lng, sz.latitude, sz.longitude)
            item["distance_km"] = dist
        results.append(item)

    if user_lat is not None and user_lng is not None:
        results.sort(key=lambda x: x["distance_km"] if x["distance_km"] is not None else float("inf"))

    return results
