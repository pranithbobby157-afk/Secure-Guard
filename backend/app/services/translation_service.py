import hashlib
import datetime
from typing import Optional
from sqlalchemy.orm import Session
from app.models import Translation, Alert

# High-fidelity domain-specific translations for extreme weather terminology
DICTIONARY_MAP = {
    "ta": {
        "title_prefix": "[தமிழ் மொழிபெயர்ப்பு]",
        "SIMULATION: Red Alert — Cyclone Warning for North Coastal Tamil Nadu": "உருவகப்படுத்தல்: சிவப்பு எச்சரிக்கை — வட கடலோர தமிழ்நாட்டிற்கான புயல் எச்சரிக்கை",
        "SIMULATION: Severe Waterlogging & Inundation in Low-Lying Sectors": "உருவகப்படுத்தல்: தாழ்வான பகுதிகளில் கடுமையான வெள்ளப்பெருக்கு மற்றும் நீர் தேக்கம்",
        "SIMULATION: Heavy Rainfall Advisory & Gusty Winds": "உருவகப்படுத்தல்: கனமழை ஆலோசனை மற்றும் பலத்த காற்று",
        "Cyclone Warning": "புயல் எச்சரிக்கை",
        "Flood Advisory": "வெள்ள எச்சரிக்கை",
        "Evacuation Notice": "வெளியேற்ற அறிவிப்பு",
        "Do not venture into sea or flooded underpasses.": "கடல் பகுதிக்கோ அல்லது வெள்ளம் சூழ்ந்த சுரங்கப்பாதைகளுக்கோ செல்ல வேண்டாம்.",
        "Stay indoors in sturdy buildings. Charge mobile phones and keep emergency supplies ready.": "உறுதியான கட்டிடங்களுக்குள் இருக்கவும். மொபைல் போன்களை சார்ஜ் செய்து அவசர கால பொருட்களை தயாராக வைக்கவும்.",
        "Move to designated GCC relief centers if residing in ground-floor residences in flood-prone zones.": "வெள்ள அபாயம் உள்ள பகுதிகளில் தரைத்தளத்தில் வசிப்பவர்கள் நியமிக்கப்பட்ட GCC நிவாரண மையங்களுக்கு செல்லவும்."
    },
    "hi": {
        "title_prefix": "[हिंदी अनुवाद]",
        "SIMULATION: Red Alert — Cyclone Warning for North Coastal Tamil Nadu": "सिमुलेशन: रेड अलर्ट — उत्तरी तटीय तमिलनाडु के लिए चक्रवात चेतावनी",
        "SIMULATION: Severe Waterlogging & Inundation in Low-Lying Sectors": "सिमुलेशन: निचले इलाकों में भारी जलभराव और बाढ़",
        "SIMULATION: Heavy Rainfall Advisory & Gusty Winds": "सिमुलेशन: भारी बारिश की सलाह और तेज हवाएं",
        "Cyclone Warning": "चक्रवात चेतावनी",
        "Flood Advisory": "बाढ़ सलाह",
        "Evacuation Notice": "निकासी सूचना",
        "Do not venture into sea or flooded underpasses.": "समुद्र या जलमग्न सबवे में न जाएं।",
        "Stay indoors in sturdy buildings. Charge mobile phones and keep emergency supplies ready.": "मजबूत इमारतों के अंदर रहें। फोन चार्ज रखें और आपातकालीन सामान तैयार रखें।",
        "Move to designated GCC relief centers if residing in ground-floor residences in flood-prone zones.": "यदि बाढ़ संभावित क्षेत्रों में भूतल पर रहते हैं तो जीसीसी राहत केंद्रों में जाएं।"
    },
    "fr": {
        "title_prefix": "[Traduction Française]",
        "SIMULATION: Red Alert — Cyclone Warning for North Coastal Tamil Nadu": "SIMULATION : Alerte Rouge — Avis de cyclone pour la côte nord du Tamil Nadu",
        "SIMULATION: Severe Waterlogging & Inundation in Low-Lying Sectors": "SIMULATION : Inondations sévères et submersion dans les zones basses",
        "SIMULATION: Heavy Rainfall Advisory & Gusty Winds": "SIMULATION : Avis de fortes pluies et vents violents",
        "Cyclone Warning": "Avis de cyclone",
        "Flood Advisory": "Avis d'inondation",
        "Evacuation Notice": "Avis d'évacuation",
        "Do not venture into sea or flooded underpasses.": "Ne vous aventurez pas en mer ni dans les passages souterrains inondés.",
        "Stay indoors in sturdy buildings. Charge mobile phones and keep emergency supplies ready.": "Restez à l'intérieur dans des bâtiments solides. Chargez vos téléphones et préparez les fournitures d'urgence.",
        "Move to designated GCC relief centers if residing in ground-floor residences in flood-prone zones.": "Rendez-vous dans les centres de secours désignés par le GCC si vous résidez au rez-de-chaussée dans des zones inondables."
    }
}

def compute_hash(text: str) -> str:
    return hashlib.sha256(text.encode("utf-8")).hexdigest()[:16]

def get_or_create_translation(
    db: Session, alert: Alert, target_language: str
) -> Optional[Translation]:
    if target_language == alert.original_language:
        # No translation needed if same language
        return None

    full_text = f"{alert.title} | {alert.description_original} | {alert.instruction_original or ''}"
    text_hash = compute_hash(full_text)

    # Check cache in DB
    existing = (
        db.query(Translation)
        .filter(
            Translation.alert_id == alert.id,
            Translation.target_language == target_language,
            Translation.source_text_hash == text_hash
        )
        .first()
    )
    if existing:
        return existing

    # Generate translation using dictionary / fallback synthesis
    lang_map = DICTIONARY_MAP.get(target_language, {})
    translated_title = lang_map.get(alert.title, f"[{target_language.upper()}] {alert.title}")
    
    # Translate description if mapped, else annotate safely
    translated_desc = lang_map.get(
        alert.description_original,
        f"[{target_language.upper()} Translation]: {alert.description_original}"
    )
    
    # Translate instruction if mapped
    translated_inst = None
    if alert.instruction_original:
        translated_inst = lang_map.get(
            alert.instruction_original,
            f"[{target_language.upper()} Instructions]: {alert.instruction_original}"
        )

    translation = Translation(
        id=f"trans-{alert.id}-{target_language}-{text_hash[:8]}",
        alert_id=alert.id,
        target_language=target_language,
        translated_title=translated_title,
        translated_description=translated_desc,
        translated_instruction=translated_inst,
        provider="SafeRoute Crisis Linguistic Engine v1.0",
        source_text_hash=text_hash,
        created_at=datetime.datetime.now(datetime.timezone.utc).replace(tzinfo=None)
    )
    db.add(translation)
    db.commit()
    db.refresh(translation)
    return translation
