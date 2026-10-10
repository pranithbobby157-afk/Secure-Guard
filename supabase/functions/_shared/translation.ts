import { SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2.45.4';
import { Alert, Translation } from './types.ts';
import { sha256Hex } from './security.ts';

export const DICTIONARY_MAP: Record<string, Record<string, string>> = {
  ta: {
    title_prefix: '[தமிழ் மொழிபெயர்ப்பு]',
    'SIMULATION: Red Alert — Cyclone Warning for North Coastal Tamil Nadu':
      'உருவகப்படுத்தல்: சிவப்பு எச்சரிக்கை — வட கடலோர தமிழ்நாட்டிற்கான புயல் எச்சரிக்கை',
    'SIMULATION: Severe Waterlogging & Inundation in Low-Lying Sectors':
      'உருவகப்படுத்தல்: தாழ்வான பகுதிகளில் கடுமையான வெள்ளப்பெருக்கு மற்றும் நீர் தேக்கம்',
    'SIMULATION: Heavy Rainfall Advisory & Gusty Winds':
      'உருவகப்படுத்தல்: கனமழை ஆலோசனை மற்றும் பலத்த காற்று',
    'Cyclone Warning': 'புயல் எச்சரிக்கை',
    'Flood Advisory': 'வெள்ள எச்சரிக்கை',
    'Evacuation Notice': 'வெளியேற்ற அறிவிப்பு',
    'Do not venture into sea or flooded underpasses.':
      'கடல் பகுதிக்கோ அல்லது வெள்ளம் சூழ்ந்த சுரங்கப்பாதைகளுக்கோ செல்ல வேண்டாம்.',
    'Stay indoors in sturdy buildings. Charge mobile phones and keep emergency supplies ready.':
      'உறுதியான கட்டிடங்களுக்குள் இருக்கவும். மொபைல் போன்களை சார்ஜ் செய்து அவசர கால பொருட்களை தயாராக வைக்கவும்.',
    'Move to designated GCC relief centers if residing in ground-floor residences in flood-prone zones.':
      'வெள்ள அபாயம் உள்ள பகுதிகளில் தரைத்தளத்தில் வசிப்பவர்கள் நியமிக்கப்பட்ட GCC நிவாரண மையங்களுக்கு செல்லவும்.',
  },
  hi: {
    title_prefix: '[हिंदी अनुवाद]',
    'SIMULATION: Red Alert — Cyclone Warning for North Coastal Tamil Nadu':
      'सिमुलेशन: रेड अलर्ट — उत्तरी तटीय तमिलनाडु के लिए चक्रवात चेतावनी',
    'SIMULATION: Severe Waterlogging & Inundation in Low-Lying Sectors':
      'सिमुलेशन: निचले इलाकों में भारी जलभराव और बाढ़',
    'SIMULATION: Heavy Rainfall Advisory & Gusty Winds':
      'सिमुलेशन: भारी बारिश की सलाह और तेज हवाएं',
    'Cyclone Warning': 'चक्रवात चेतावनी',
    'Flood Advisory': 'बाढ़ सलाह',
    'Evacuation Notice': 'निकासी सूचना',
    'Do not venture into sea or flooded underpasses.':
      'समुद्र या जलमग्न सबवे में न जाएं।',
    'Stay indoors in sturdy buildings. Charge mobile phones and keep emergency supplies ready.':
      'मजबूत इमारतों के अंदर रहें। फोन चार्ज रखें और आपातकालीन सामान तैयार रखें।',
    'Move to designated GCC relief centers if residing in ground-floor residences in flood-prone zones.':
      'यदि बाढ़ संभावित क्षेत्रों में भूतल पर रहते हैं तो जीसीसी राहत केंद्रों में जाएं।',
  },
  fr: {
    title_prefix: '[Traduction Française]',
    'SIMULATION: Red Alert — Cyclone Warning for North Coastal Tamil Nadu':
      'SIMULATION : Alerte Rouge — Avis de cyclone pour la côte nord du Tamil Nadu',
    'SIMULATION: Severe Waterlogging & Inundation in Low-Lying Sectors':
      'SIMULATION : Inondations sévères et submersion dans les zones basses',
    'SIMULATION: Heavy Rainfall Advisory & Gusty Winds':
      'SIMULATION : Avis de fortes pluies et vents violents',
    'Cyclone Warning': 'Avis de cyclone',
    'Flood Advisory': "Avis d'inondation",
    'Evacuation Notice': "Avis d'évacuation",
    'Do not venture into sea or flooded underpasses.':
      'Ne vous aventurez pas en mer ni dans les passages souterrains inondés.',
    'Stay indoors in sturdy buildings. Charge mobile phones and keep emergency supplies ready.':
      'Restez à l’intérieur dans des bâtiments solides. Chargez vos téléphones et préparez les fournitures d’urgence.',
    'Move to designated GCC relief centers if residing in ground-floor residences in flood-prone zones.':
      'Rendez-vous dans les centres de secours désignés par le GCC si vous résidez au rez-de-chaussée dans des zones inondables.',
  },
};

export async function computeHash(text: string): Promise<string> {
  const hex = await sha256Hex(text);
  return hex.substring(0, 16);
}

export async function getOrCreateTranslation(
  supabase: SupabaseClient,
  alert: Alert,
  targetLanguage: string
): Promise<Translation | null> {
  if (targetLanguage === alert.original_language) {
    return null;
  }

  const fullText = `${alert.title} | ${alert.description_original} | ${alert.instruction_original || ''}`;
  const textHash = await computeHash(fullText);

  // Check cache in DB
  const { data: existing, error: selectErr } = await supabase
    .from('translations')
    .select('*')
    .eq('alert_id', alert.id)
    .eq('target_language', targetLanguage)
    .eq('source_text_hash', textHash)
    .maybeSingle();

  if (!selectErr && existing) {
    return existing as Translation;
  }

  const langMap = DICTIONARY_MAP[targetLanguage] || {};
  const translatedTitle = langMap[alert.title] || `[${targetLanguage.toUpperCase()}] ${alert.title}`;
  const translatedDesc =
    langMap[alert.description_original] ||
    `[${targetLanguage.toUpperCase()} Translation]: ${alert.description_original}`;
  const translatedInst = alert.instruction_original
    ? langMap[alert.instruction_original] ||
      `[${targetLanguage.toUpperCase()} Instructions]: ${alert.instruction_original}`
    : null;

  const translationId = `trans-${alert.id}-${targetLanguage}-${textHash.substring(0, 8)}`;
  const nowIso = new Date().toISOString();

  const newTrans: Translation = {
    id: translationId,
    alert_id: alert.id,
    target_language: targetLanguage,
    translated_title: translatedTitle,
    translated_description: translatedDesc,
    translated_instruction: translatedInst,
    provider: 'SafeRoute Crisis Linguistic Engine v1.0',
    source_text_hash: textHash,
    created_at: nowIso,
  };

  const { data: inserted, error: insertErr } = await supabase
    .from('translations')
    .upsert(newTrans)
    .select('*')
    .single();

  if (insertErr) {
    console.error('Failed to cache translation in DB:', insertErr);
    return newTrans;
  }

  return inserted as Translation;
}
