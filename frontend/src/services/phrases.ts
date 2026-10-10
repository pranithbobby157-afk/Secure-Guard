export type PhraseCategory =
  | 'help'
  | 'medical'
  | 'police'
  | 'directions'
  | 'needs'
  | 'danger'
  | 'shelter'
  | 'missing'
  | 'translation';

export interface EmergencyPhrase {
  id: string;
  category: PhraseCategory;
  en: string;
  ta: string;
  taPhonetic: string;
  hi: string;
  hiPhonetic: string;
  fr: string;
}

export const EMERGENCY_PHRASES: EmergencyPhrase[] = [
  // 1. Requesting Help
  {
    id: 'phrase-help-urgent',
    category: 'help',
    en: 'Please help me! I am in danger.',
    ta: 'தயவுசெய்து எனக்கு உதவுங்கள்! நான் ஆபத்தில் இருக்கிறேன்.',
    taPhonetic: 'Thayavuseithu enakku uthavungal! Naan aabathil irukkiren.',
    hi: 'कृपया मेरी मदद करें! मैं खतरे में हूँ।',
    hiPhonetic: 'Kripya meri madad karein! Main khatre mein hoon.',
    fr: "S'il vous plaît aidez-moi ! Je suis en danger."
  },
  {
    id: 'phrase-help-tourist',
    category: 'help',
    en: 'I am a foreign tourist. I need immediate help.',
    ta: 'நான் ஒரு வெளிநாட்டு சுற்றுலாப் பயணி. எனக்கு உடனடியாக உதவி தேவை.',
    taPhonetic: 'Naan oru velinaattu sutrulaap payani. Enakku udanadiyaaga uthavi thevai.',
    hi: 'मैं एक विदेशी पर्यटक हूँ। मुझे तत्काल सहायता चाहिए।',
    hiPhonetic: 'Main ek videshi paryatak hoon. Mujhe tatkaal sahayata chahiye.',
    fr: "Je suis un touriste étranger. J'ai besoin d'une aide immédiate."
  },

  // 2. Medical Emergencies
  {
    id: 'phrase-med-ambulance',
    category: 'medical',
    en: 'Please call an ambulance immediately (108).',
    ta: 'உடனடியாக ஆம்புலன்ஸ் (108) அழைக்கவும்.',
    taPhonetic: 'Udanadiyaaga ambulance (108) azhaikkavum.',
    hi: 'कृपया तुरंत एम्बुलेंस (108) बुलाएँ।',
    hiPhonetic: 'Kripya turant ambulance (108) bulaayein.',
    fr: "S'il vous plaît appelez une ambulance immédiatement (108)."
  },
  {
    id: 'phrase-med-hospital',
    category: 'medical',
    en: 'Where is the nearest hospital or emergency clinic?',
    ta: 'அருகிலுள்ள மருத்துவமனை அல்லது அவசர சிகிச்சை மையம் எங்கு உள்ளது?',
    taPhonetic: 'Arugilulla maruthuvamanai engu ullathu?',
    hi: 'निकटतम अस्पताल या आपातकालीन क्लिनिक कहाँ है?',
    hiPhonetic: 'Nikat-tam aspatal ya aapat-kaaleen clinic kahan hai?',
    fr: "Où se trouve l'hôpital ou la clinique d'urgence le plus proche ?"
  },
  {
    id: 'phrase-med-injured',
    category: 'medical',
    en: 'Someone is severely injured and bleeding.',
    ta: 'ஒருவருக்கு பலத்த காயம் ஏற்பட்டு ரத்தம் வழிகிறது.',
    taPhonetic: 'Oruvarukku balatha kaayam erpattu ratham vazhigirathu.',
    hi: 'कोई गंभीर रूप से घायल है और खून बह रहा है।',
    hiPhonetic: 'Koi gambhir roop se ghaayal hai aur khoon beh raha hai.',
    fr: "Quelqu'un est grièvement blessé et saigne."
  },

  // 3. Police or Assistance
  {
    id: 'phrase-police-call',
    category: 'police',
    en: 'Please call the police (112 / 100).',
    ta: 'காவல்துறையை அழைக்கவும் (112 / 100).',
    taPhonetic: 'Kaavalthuraiyai azhaikkavum (112 / 100).',
    hi: 'कृपया पुलिस (112 / 100) को बुलाएँ।',
    hiPhonetic: 'Kripya police (112 / 100) ko bulaayein.',
    fr: "S'il vous plaît appelez la police (112 / 100)."
  },
  {
    id: 'phrase-police-station',
    category: 'police',
    en: 'Where is the nearest police station?',
    ta: 'அருகிலுள்ள காவல் நிலையம் எங்கு உள்ளது?',
    taPhonetic: 'Arugilulla kaaval nilaiyam engu ullathu?',
    hi: 'निकटतम पुलिस स्टेशन कहाँ है?',
    hiPhonetic: 'Nikat-tam police station kahan hai?',
    fr: "Où se trouve le commissariat de police le plus proche ?"
  },

  // 4. Asking for Directions & Evacuation
  {
    id: 'phrase-dir-safe',
    category: 'directions',
    en: 'Which way is safe from the flooding/storm?',
    ta: 'வெள்ளம்/புயலில் இருந்து தப்பிக்க எந்த வழி பாதுகாப்பானது?',
    taPhonetic: 'Vellam/puyalil irunthu thappikka entha vazhi paathukaapaanathu?',
    hi: 'बाढ़/तूफान से सुरक्षित रास्ता कौन सा है?',
    hiPhonetic: 'Baadh/toofan se surakshit raasta kaun sa hai?',
    fr: 'Quel chemin est sûr face aux inondations/à la tempête ?'
  },
  {
    id: 'phrase-dir-airport',
    category: 'directions',
    en: 'How can I get to Chennai Central railway station or the airport?',
    ta: 'சென்னை சென்ட்ரல் ரயில் நிலையம் அல்லது விமான நிலையத்திற்கு எப்படி செல்வது?',
    taPhonetic: 'Chennai Central railway station allathu vimaana nilaiyathirku eppadi selvathu?',
    hi: 'चेन्नई सेंट्रल रेलवे स्टेशन या हवाई अड्डे कैसे पहुँचूँ?',
    hiPhonetic: 'Chennai Central railway station ya hawai adde kaise pahunchein?',
    fr: "Comment puis-je me rendre à la gare de Chennai Central ou à l'aéroport ?"
  },

  // 5. Medical & Dietary Need
  {
    id: 'phrase-need-water',
    category: 'needs',
    en: 'I need clean drinking water and baby food/medicine.',
    ta: 'எனக்கு சுத்தமான குடிநீர் மற்றும் மருந்து தேவை.',
    taPhonetic: 'Enakku suthamaana kudineer matrum marunthu thevai.',
    hi: 'मुझे स्वच्छ पीने का पानी और दवा चाहिए।',
    hiPhonetic: 'Mujhe swachh peene ka paani aur dawa chahiye.',
    fr: "J'ai besoin d'eau potable propre et de médicaments."
  },
  {
    id: 'phrase-need-asthma',
    category: 'needs',
    en: 'I have severe asthma / diabetes and need my prescription medication.',
    ta: 'எனக்கு ஆஸ்துமா / நீரிழிவு நோய் உள்ளது, மருந்து தேவை.',
    taPhonetic: 'Enakku aasthuma / neerizhivu noi ullathu, marunthu thevai.',
    hi: 'मुझे गंभीर अस्थमा / मधुमेह है और डॉक्टर की दवा चाहिए।',
    hiPhonetic: 'Mujhe asthma / madhumeh hai aur dawa chahiye.',
    fr: "J'ai de l'asthme sévère / du diabète et j'ai besoin de mes médicaments."
  },

  // 6. Communicating Danger
  {
    id: 'phrase-danger-water',
    category: 'danger',
    en: 'Stop! The water level is too deep and electrical wires are fallen.',
    ta: 'நில்லுங்கள்! தண்ணீர் ஆழமாக உள்ளது மற்றும் மின்சார கம்பிகள் அறுந்து விழுந்துள்ளன.',
    taPhonetic: 'Nillungal! Thanneer aazhamaaga ullathu matrum minsara kambigal vizhunthullana.',
    hi: 'रुकिए! पानी बहुत गहरा है और बिजली के तार गिरे हुए हैं।',
    hiPhonetic: 'Rukiye! Paani bahut gehra hai aur bijli ke taar gire hue hain.',
    fr: "Arrêtez-vous ! L'eau est trop profonde et des câbles électriques sont tombés."
  },
  {
    id: 'phrase-danger-building',
    category: 'danger',
    en: 'This building is not safe. We must evacuate immediately.',
    ta: 'இந்த கட்டிடம் பாதுகாப்பானது அல்ல. உடனே வெளியேற வேண்டும்.',
    taPhonetic: 'Intha kattidam paathukaapaanathu alla. Udane veliyera vendum.',
    hi: 'यह इमारत सुरक्षित नहीं है। हमें तुरंत बाहर निकलना होगा।',
    hiPhonetic: 'Yeh imaarat surakshit nahin hai. Humein turant nikalna hoga.',
    fr: 'Ce bâtiment est dangereux. Nous devons évacuer immédiatement.'
  },

  // 7. Finding Shelter
  {
    id: 'phrase-shelter-find',
    category: 'shelter',
    en: 'Where is the official government relief shelter?',
    ta: 'அரசு நிவாரண தங்குமிடம் எங்கு அமைந்துள்ளது?',
    taPhonetic: 'Arasu nivaarana thangumidam engu amainthullathu?',
    hi: 'आधिकारिक सरकारी राहत शिविर कहाँ है?',
    hiPhonetic: 'Aadhikaarik sarkari rahat shivir kahan hai?',
    fr: "Où se trouve le centre d'hébergement d'urgence officiel ?"
  },
  {
    id: 'phrase-shelter-space',
    category: 'shelter',
    en: 'Is there space available for emergency accommodation?',
    ta: 'தங்குவதற்கு இடம் உள்ளதா?',
    taPhonetic: 'Thanguvatharku idam ullathaa?',
    hi: 'क्या आपातकालीन ठहरने के लिए जगह उपलब्ध है?',
    hiPhonetic: 'Kya aapat-kaaleen theharne ke liye jagah uplabdh hai?',
    fr: "Y a-t-il de la place disponible pour un hébergement d'urgence ?"
  },

  // 8. Reporting a Missing Person
  {
    id: 'phrase-missing-report',
    category: 'missing',
    en: 'I lost my family member / travel companion during the evacuation.',
    ta: 'வெளியேற்றத்தின் போது எனது குடும்ப உறுப்பினரை / உடன் வந்தவரை தொலைத்துவிட்டேன்.',
    taPhonetic: 'Veliyettrathin pothu enathu kudumba uruppinarai tholaithuvitten.',
    hi: 'निकासी के दौरान मेरा परिवार का सदस्य / साथी बिछड़ गया है।',
    hiPhonetic: 'Nikaasi ke dauran mera saathi bichhad gaya hai.',
    fr: "J'ai perdu un membre de ma famille / mon compagnon lors de l'évacuation."
  },

  // 9. Translation Assistance
  {
    id: 'phrase-trans-english',
    category: 'translation',
    en: 'Does anyone speak English or French here?',
    ta: 'இங்கே யாருக்காவது ஆங்கிலம் அல்லது பிரெஞ்சு பேசத் தெரியுமா?',
    taPhonetic: 'Inge yaarukkaavathu aangilam allathu French pesa theriyumaa?',
    hi: 'क्या यहाँ कोई अंग्रेज़ी या फ्रेंच बोलता है?',
    hiPhonetic: 'Kya yahan koi Angrezi ya French bolta hai?',
    fr: "Est-ce que quelqu'un parle anglais ou français ici ?"
  }
];

export const CATEGORY_LABELS: Record<PhraseCategory, { en: string; ta: string; hi: string; fr: string }> = {
  help: { en: 'Requesting Help', ta: 'உதவி கோருதல்', hi: 'मदद माँगना', fr: "Demande d'aide" },
  medical: { en: 'Medical Emergencies', ta: 'மருத்துவ அவசரம்', hi: 'चिकित्सा आपातकाल', fr: 'Urgences médicales' },
  police: { en: 'Police Assistance', ta: 'காவல்துறை உதவி', hi: 'पुलिस सहायता', fr: 'Assistance policière' },
  directions: { en: 'Directions & Routes', ta: 'வழிகள் & வழிகாட்டுதல்', hi: 'दिशा-निर्देश व मार्ग', fr: 'Directions & Itinéraires' },
  needs: { en: 'Urgent Needs', ta: 'அவசர தேவைகள்', hi: 'अत्यावश्यक ज़रूरतें', fr: 'Besoins urgents' },
  danger: { en: 'Warning of Danger', ta: 'ஆபத்து எச்சரிக்கை', hi: 'खतरे की चेतावनी', fr: 'Alerte danger' },
  shelter: { en: 'Finding Shelter', ta: 'தங்குமிடம் தேடுதல்', hi: 'आश्रय की तलाश', fr: "Recherche d'abri" },
  missing: { en: 'Missing Persons', ta: 'காணாமல் போனவர்கள்', hi: 'लापता व्यक्ति', fr: 'Personnes disparues' },
  translation: { en: 'Language & Translation', ta: 'மொழி உதவி', hi: 'भाषा व अनुवाद', fr: 'Langue & Traduction' }
};
