import { FormEvent, ReactNode, useMemo, useState } from "react";

type Language = "en" | "ta" | "hi" | "fr";
type Page = "dashboard" | "conditions" | "contacts" | "editor";
type Scenario = "default" | "cyclone" | "clear" | "outage";
type IconName =
  | "alert" | "arrow" | "building" | "calendar" | "check" | "chevron"
  | "clock" | "cloud" | "document" | "external" | "eye" | "globe"
  | "home" | "hospital" | "info" | "layers" | "location" | "lock"
  | "mail" | "menu" | "minus" | "phone" | "plus" | "rain" | "route"
  | "search" | "settings" | "shield" | "user" | "users" | "warning" | "x";

const messages = {
  en: {
    lang: "English", tagline: "TOURIST CRISIS COMMUNICATION", dashboard: "Dashboard",
    conditions: "Conditions & shelters", contacts: "Emergency contacts", editor: "Editor access",
    selectLocation: "Selected location", useLocation: "Use my location", location: "Chennai Coastal & Metropolitan District, Tamil Nadu",
    heading: "Your travel safety dashboard", intro: "Official alerts, local guidance, and emergency resources for your selected area.",
    freshness: "Demo data shown · No live source connected", checked: "Source connection not configured",
    currentAlerts: "Current alerts", filters: "Filter alerts", all: "All", cyclone: "Cyclone", rain: "Heavy rain",
    flooding: "Flooding / waterlogging", other: "Other", critical: "Critical", warning: "Warning",
    watch: "Watch", info: "Informational", simulation: "DEMO / SIMULATION", affected: "Affected area",
    instruction: "Recommended action", source: "Source", issued: "Issued", retrieved: "Last retrieved",
    verification: "Verification", unverified: "Simulated — not an official bulletin", metadata: "Source metadata",
    details: "View full details", hide: "Hide details", translated: "Unofficial translation",
    original: "Original demonstration bulletin (English)", notReplace: "This translation is provided for convenience and does not replace an original authority notice.",
    noAlerts: "No demonstration alerts in this view", noAlertsBody: "No matching sample records were found. This does not confirm that the selected area is safe.",
    explore: "Explore local conditions", exploreBody: "Review mapped resources and an accessible location list.",
    openMap: "Explore map and shelters", mapNote: "Map distances are approximate. They do not establish that a route is safe or that a location is unaffected.",
    shelterTitle: "Designated shelters and emergency resources", shelterIntro: "Demonstration listings only. Confirm with local authorities before travelling.",
    notVerified: "Not independently verified", demoListing: "Simulated listing", approximate: "Approx. distance",
    detailsAction: "View details", facility: "Facility type", address: "Area", sourceOrg: "Source organization",
    lastVerified: "Last verified", unavailable: "Not available in demo data", alternative: "Accessible location list",
    emergencyPlan: "Emergency action plan", planIntro: "Always follow the latest instructions from relevant local authorities.",
    step1: "Read the latest official alert.", step2: "Follow instructions from local authorities.",
    step3: "Avoid affected or restricted areas.", step4: "Identify an officially designated shelter when instructed.",
    step5: "Contact emergency services when necessary.", contactTitle: "Emergency contacts",
    contactIntro: "Configured regional services for the selected area. Confirm service availability when calling.",
    call: "Call", numberSource: "Configured reference", emergency: "Emergency response", emergencyDesc: "Single emergency number configured for India.",
    demoControls: "Demonstration scenario", default: "Default", redAlert: "Cyclone Red Alert",
    clearDemo: "All-Clear Demonstration", outage: "Source Outage / Stale Data", demoHint: "These controls only change simulated content.",
    defaultTitle: "Official feed connection is not configured", defaultBody: "SafeRoute cannot confirm current alerts for this area. Use official local channels for time-sensitive information.",
    clearTitle: "No active alerts returned in this demonstration", clearBody: "This is a simulated all-clear state, not confirmation that the area is safe.",
    outageTitle: "Official source unavailable", outageBody: "Information may be outdated. The last successful demonstration retrieval was 42 minutes ago.",
    alertTitle: "Demonstration: severe cyclonic weather warning", alertBody: "A simulated scenario showing how a high-severity bulletin would appear for coastal Chennai.",
    alertAction: "Review official authority updates and be prepared to follow local instructions. Do not use this demonstration for real-world decisions.",
    area: "Chennai coastal demonstration area", showAll: "Show all", mapUnavailable: "Interactive map data is unavailable",
    mapUnavailableBody: "The live map integration is not connected. Use the location list below and verify destinations with local authorities.",
    zoomIn: "Zoom in", zoomOut: "Zoom out", legend: "Map legend", shelter: "Shelter", hospital: "Hospital", selectedArea: "Selected area",
    sourcePanel: "Source transparency", sourceBody: "All alerts and facilities on this screen are demonstration records. No successful synchronization with an official feed is being represented.",
    signIn: "Secure editor sign in", signInIntro: "Authorized operations staff can manage alerts, sources, and publication status.",
    email: "Work email", password: "Password", continue: "Continue securely", authNote: "Authentication is handled by the configured backend. No credentials are stored in this interface.",
    authMissing: "Authentication backend is not connected in this UI concept.", preview: "Preview operations workspace",
    operations: "Operations workspace", alertManagement: "Alert management", createAlert: "Create alert",
    status: "Publication status", draft: "Draft", audit: "Audit log", sources: "Sources & freshness",
    lastChange: "Last change", editedBy: "Demo editor", unpublished: "Unpublished", returnPublic: "Return to public dashboard",
    skip: "Skip to main content", mobileNav: "Open navigation", close: "Close", loading: "Checking configured sources…",
    capacity: "Capacity", open: "Open", menu: "Menu",
  },
  ta: {
    lang: "தமிழ்", tagline: "சுற்றுலாப் பயணி நெருக்கடி தகவல் தொடர்பு", dashboard: "முகப்பு",
    conditions: "நிலவரம் & தங்குமிடங்கள்", contacts: "அவசர தொடர்புகள்", editor: "ஆசிரியர் அணுகல்",
    selectLocation: "தேர்ந்தெடுத்த இடம்", useLocation: "என் இருப்பிடத்தைப் பயன்படுத்து", location: "சென்னை கடலோர மற்றும் பெருநகர மாவட்டம், தமிழ்நாடு",
    heading: "உங்கள் பயணப் பாதுகாப்பு முகப்பு", intro: "தேர்ந்தெடுத்த பகுதிக்கான அதிகாரப்பூர்வ எச்சரிக்கைகள், உள்ளூர் வழிகாட்டுதல் மற்றும் அவசர வளங்கள்.",
    freshness: "மாதிரித் தரவு · நேரடி மூலம் இணைக்கப்படவில்லை", checked: "மூல இணைப்பு அமைக்கப்படவில்லை",
    currentAlerts: "தற்போதைய எச்சரிக்கைகள்", filters: "எச்சரிக்கைகளை வடிகட்டு", all: "அனைத்தும்", cyclone: "புயல்", rain: "கனமழை",
    flooding: "வெள்ளம் / நீர்த்தேக்கம்", other: "பிற", critical: "தீவிரம்", warning: "எச்சரிக்கை", watch: "கண்காணிப்பு", info: "தகவல்",
    simulation: "மாதிரி / ஒத்திகை", affected: "பாதிக்கப்பட்ட பகுதி", instruction: "பரிந்துரைக்கப்பட்ட நடவடிக்கை", source: "மூலம்", issued: "வெளியிடப்பட்டது",
    retrieved: "கடைசியாக பெறப்பட்டது", verification: "சரிபார்ப்பு", unverified: "ஒத்திகை — அதிகாரப்பூர்வ அறிவிப்பு அல்ல", metadata: "மூல விவரங்கள்",
    details: "முழு விவரங்கள்", hide: "விவரங்களை மறை", translated: "அதிகாரப்பூர்வமற்ற மொழிபெயர்ப்பு", original: "அசல் மாதிரி அறிவிப்பு (ஆங்கிலம்)",
    notReplace: "இந்த மொழிபெயர்ப்பு வசதிக்காக மட்டுமே; அதிகாரப்பூர்வ அறிவிப்பிற்கு மாற்றாகாது.",
    noAlerts: "இந்தக் காட்சியில் மாதிரி எச்சரிக்கைகள் இல்லை", noAlertsBody: "பொருந்தும் மாதிரி பதிவுகள் இல்லை. பகுதி பாதுகாப்பானது என்பதை இது உறுதிப்படுத்தாது.",
    explore: "உள்ளூர் நிலவரத்தை ஆராயுங்கள்", exploreBody: "வரைபட வளங்களையும் அணுகக்கூடிய இடப் பட்டியலையும் பாருங்கள்.", openMap: "வரைபடம் மற்றும் தங்குமிடங்கள்",
    mapNote: "வரைபட தூரங்கள் தோராயமானவை. பாதை பாதுகாப்பானது அல்லது இடம் பாதிக்கப்படவில்லை என்பதை அவை உறுதிசெய்யாது.",
    shelterTitle: "நியமிக்கப்பட்ட தங்குமிடங்கள் மற்றும் அவசர வளங்கள்", shelterIntro: "மாதிரிப் பட்டியல் மட்டுமே. பயணிக்கும் முன் உள்ளூர் அதிகாரிகளிடம் உறுதிப்படுத்தவும்.",
    notVerified: "சுயாதீனமாக சரிபார்க்கப்படவில்லை", demoListing: "மாதிரிப் பட்டியல்", approximate: "தோராயமான தூரம்", detailsAction: "விவரங்கள்",
    facility: "வசதி வகை", address: "பகுதி", sourceOrg: "மூல அமைப்பு", lastVerified: "கடைசி சரிபார்ப்பு", unavailable: "மாதிரித் தரவில் இல்லை",
    alternative: "அணுகக்கூடிய இடப் பட்டியல்", emergencyPlan: "அவசர நடவடிக்கை திட்டம்", planIntro: "தொடர்புடைய உள்ளூர் அதிகாரிகளின் சமீபத்திய அறிவுறுத்தல்களைப் பின்பற்றவும்.",
    step1: "சமீபத்திய அதிகாரப்பூர்வ எச்சரிக்கையைப் படிக்கவும்.", step2: "உள்ளூர் அதிகாரிகளின் அறிவுறுத்தல்களைப் பின்பற்றவும்.", step3: "பாதிக்கப்பட்ட அல்லது தடைசெய்யப்பட்ட பகுதிகளைத் தவிர்க்கவும்.",
    step4: "அறிவுறுத்தப்பட்டால் அதிகாரப்பூர்வ தங்குமிடத்தை அடையாளம் காணவும்.", step5: "தேவையானபோது அவசர சேவைகளைத் தொடர்பு கொள்ளவும்.",
    contactTitle: "அவசர தொடர்புகள்", contactIntro: "தேர்ந்தெடுத்த பகுதிக்காக அமைக்கப்பட்ட பிராந்திய சேவைகள்.", call: "அழைக்கவும்", numberSource: "அமைக்கப்பட்ட குறிப்பு",
    emergency: "அவசர உதவி", emergencyDesc: "இந்தியாவிற்காக அமைக்கப்பட்ட ஒருங்கிணைந்த அவசர எண்.",
    demoControls: "மாதிரி நிலை", default: "இயல்புநிலை", redAlert: "புயல் சிவப்பு எச்சரிக்கை", clearDemo: "அபாயமில்லை ஒத்திகை", outage: "மூலத் தடை / பழைய தரவு",
    demoHint: "இந்தக் கட்டுப்பாடுகள் மாதிரி உள்ளடக்கத்தை மட்டுமே மாற்றும்.", defaultTitle: "அதிகாரப்பூர்வ தரவு இணைப்பு அமைக்கப்படவில்லை",
    defaultBody: "இந்தப் பகுதிக்கான தற்போதைய எச்சரிக்கைகளை SafeRoute உறுதிப்படுத்த முடியாது.", clearTitle: "இந்த ஒத்திகையில் செயலில் உள்ள எச்சரிக்கைகள் இல்லை",
    clearBody: "இது மாதிரி நிலை; பகுதி பாதுகாப்பானது என்பதற்கான உறுதிப்படுத்தல் அல்ல.", outageTitle: "அதிகாரப்பூர்வ மூலம் கிடைக்கவில்லை",
    outageBody: "தகவல் பழையதாக இருக்கலாம். கடைசி மாதிரி பெறுதல் 42 நிமிடங்களுக்கு முன்.",
    alertTitle: "ஒத்திகை: கடுமையான புயல் வானிலை எச்சரிக்கை", alertBody: "சென்னை கடலோரப் பகுதிக்கான உயர் தீவிர மாதிரி அறிவிப்பு.",
    alertAction: "அதிகாரப்பூர்வ புதுப்பிப்புகளைப் பார்த்து உள்ளூர் அறிவுறுத்தல்களைப் பின்பற்றத் தயாராக இருங்கள்.", area: "சென்னை கடலோர மாதிரிப் பகுதி",
    showAll: "அனைத்தையும் காட்டு", mapUnavailable: "ஊடாடும் வரைபடத் தரவு கிடைக்கவில்லை", mapUnavailableBody: "நேரடி வரைபட இணைப்பு இல்லை. கீழே உள்ள பட்டியலைப் பயன்படுத்தி அதிகாரிகளுடன் உறுதிப்படுத்தவும்.",
    zoomIn: "பெரிதாக்கு", zoomOut: "சிறிதாக்கு", legend: "வரைபட விளக்கம்", shelter: "தங்குமிடம்", hospital: "மருத்துவமனை", selectedArea: "தேர்ந்த பகுதி",
    sourcePanel: "மூல வெளிப்படைத்தன்மை", sourceBody: "இந்தத் திரையில் உள்ள அனைத்தும் மாதிரிப் பதிவுகள். அதிகாரப்பூர்வ ஒத்திசைவு எதுவும் காட்டப்படவில்லை.",
    signIn: "பாதுகாப்பான ஆசிரியர் உள்நுழைவு", signInIntro: "அங்கீகரிக்கப்பட்ட பணியாளர்கள் எச்சரிக்கைகளையும் மூலங்களையும் நிர்வகிக்கலாம்.",
    email: "பணி மின்னஞ்சல்", password: "கடவுச்சொல்", continue: "பாதுகாப்பாகத் தொடரவும்", authNote: "அங்கீகாரம் அமைக்கப்பட்ட பின்தளத்தால் கையாளப்படுகிறது.",
    authMissing: "இந்த UI கருத்தில் அங்கீகார பின்தளம் இணைக்கப்படவில்லை.", preview: "செயல்பாட்டு பணியிடத்தை முன்னோட்டமிடு", operations: "செயல்பாட்டு பணியிடம்",
    alertManagement: "எச்சரிக்கை மேலாண்மை", createAlert: "எச்சரிக்கை உருவாக்கு", status: "வெளியீட்டு நிலை", draft: "வரைவு", audit: "தணிக்கைப் பதிவு",
    sources: "மூலங்கள் & புதுமை", lastChange: "கடைசி மாற்றம்", editedBy: "மாதிரி ஆசிரியர்", unpublished: "வெளியிடப்படவில்லை",
    returnPublic: "பொது முகப்புக்குத் திரும்பு", skip: "முதன்மை உள்ளடக்கத்திற்குச் செல்", mobileNav: "வழிசெலுத்தலைத் திற", close: "மூடு",
    loading: "அமைக்கப்பட்ட மூலங்களைச் சரிபார்க்கிறது…", capacity: "கொள்ளளவு", open: "திற", menu: "பட்டி",
  },
  hi: {
    lang: "हिन्दी", tagline: "पर्यटक संकट संचार", dashboard: "डैशबोर्ड", conditions: "स्थिति और आश्रय", contacts: "आपातकालीन संपर्क", editor: "संपादक प्रवेश",
    selectLocation: "चुना हुआ स्थान", useLocation: "मेरे स्थान का उपयोग करें", location: "चेन्नई तटीय और महानगरीय जिला, तमिलनाडु",
    heading: "आपका यात्रा सुरक्षा डैशबोर्ड", intro: "चुने हुए क्षेत्र के लिए आधिकारिक अलर्ट, स्थानीय मार्गदर्शन और आपात संसाधन।",
    freshness: "डेमो डेटा · कोई लाइव स्रोत जुड़ा नहीं", checked: "स्रोत कनेक्शन कॉन्फ़िगर नहीं है", currentAlerts: "वर्तमान अलर्ट", filters: "अलर्ट फ़िल्टर करें",
    all: "सभी", cyclone: "चक्रवात", rain: "भारी वर्षा", flooding: "बाढ़ / जलभराव", other: "अन्य", critical: "गंभीर", warning: "चेतावनी", watch: "निगरानी", info: "जानकारी",
    simulation: "डेमो / अनुकरण", affected: "प्रभावित क्षेत्र", instruction: "सुझाई गई कार्रवाई", source: "स्रोत", issued: "जारी", retrieved: "अंतिम प्राप्ति",
    verification: "सत्यापन", unverified: "अनुकरण — आधिकारिक बुलेटिन नहीं", metadata: "स्रोत मेटाडेटा", details: "पूरा विवरण", hide: "विवरण छिपाएँ",
    translated: "अनौपचारिक अनुवाद", original: "मूल डेमो बुलेटिन (अंग्रेज़ी)", notReplace: "यह अनुवाद केवल सुविधा के लिए है और आधिकारिक सूचना का स्थान नहीं लेता।",
    noAlerts: "इस दृश्य में कोई डेमो अलर्ट नहीं", noAlertsBody: "कोई मेल खाता नमूना रिकॉर्ड नहीं मिला। यह क्षेत्र के सुरक्षित होने की पुष्टि नहीं है।",
    explore: "स्थानीय स्थितियाँ देखें", exploreBody: "मानचित्र संसाधन और सुलभ स्थान सूची देखें।", openMap: "मानचित्र और आश्रय देखें",
    mapNote: "मानचित्र की दूरियाँ अनुमानित हैं। वे मार्ग के सुरक्षित होने या स्थान के अप्रभावित होने की पुष्टि नहीं करतीं।",
    shelterTitle: "निर्धारित आश्रय और आपात संसाधन", shelterIntro: "केवल डेमो सूची। जाने से पहले स्थानीय अधिकारियों से पुष्टि करें।",
    notVerified: "स्वतंत्र रूप से सत्यापित नहीं", demoListing: "डेमो सूची", approximate: "अनुमानित दूरी", detailsAction: "विवरण", facility: "सुविधा प्रकार",
    address: "क्षेत्र", sourceOrg: "स्रोत संगठन", lastVerified: "अंतिम सत्यापन", unavailable: "डेमो डेटा में उपलब्ध नहीं", alternative: "सुलभ स्थान सूची",
    emergencyPlan: "आपात कार्य योजना", planIntro: "हमेशा स्थानीय अधिकारियों के नवीनतम निर्देशों का पालन करें।", step1: "नवीनतम आधिकारिक अलर्ट पढ़ें।",
    step2: "स्थानीय अधिकारियों के निर्देश मानें।", step3: "प्रभावित या प्रतिबंधित क्षेत्रों से बचें।", step4: "निर्देश मिलने पर आधिकारिक आश्रय पहचानें।",
    step5: "आवश्यकता पर आपात सेवाओं से संपर्क करें।", contactTitle: "आपातकालीन संपर्क", contactIntro: "चुने क्षेत्र के लिए कॉन्फ़िगर की गई सेवाएँ।",
    call: "कॉल करें", numberSource: "कॉन्फ़िगर संदर्भ", emergency: "आपात प्रतिक्रिया", emergencyDesc: "भारत के लिए कॉन्फ़िगर एकल आपात संख्या।",
    demoControls: "डेमो परिदृश्य", default: "डिफ़ॉल्ट", redAlert: "चक्रवात रेड अलर्ट", clearDemo: "ऑल-क्लियर डेमो", outage: "स्रोत बंद / पुराना डेटा",
    demoHint: "ये नियंत्रण केवल नकली सामग्री बदलते हैं।", defaultTitle: "आधिकारिक फ़ीड कनेक्शन कॉन्फ़िगर नहीं है",
    defaultBody: "SafeRoute इस क्षेत्र के वर्तमान अलर्ट की पुष्टि नहीं कर सकता।", clearTitle: "इस डेमो में कोई सक्रिय अलर्ट नहीं मिला",
    clearBody: "यह नकली ऑल-क्लियर स्थिति है, क्षेत्र के सुरक्षित होने की पुष्टि नहीं।", outageTitle: "आधिकारिक स्रोत उपलब्ध नहीं",
    outageBody: "जानकारी पुरानी हो सकती है। पिछली सफल डेमो प्राप्ति 42 मिनट पहले थी।", alertTitle: "डेमो: गंभीर चक्रवाती मौसम चेतावनी",
    alertBody: "तटीय चेन्नई के लिए उच्च-गंभीरता बुलेटिन कैसे दिखेगा इसका नमूना।", alertAction: "आधिकारिक अपडेट देखें और स्थानीय निर्देशों का पालन करें।",
    area: "चेन्नई तटीय डेमो क्षेत्र", showAll: "सभी दिखाएँ", mapUnavailable: "इंटरैक्टिव मानचित्र डेटा उपलब्ध नहीं",
    mapUnavailableBody: "लाइव मानचित्र जुड़ा नहीं है। नीचे की सूची उपयोग करें और अधिकारियों से पुष्टि करें।", zoomIn: "ज़ूम इन", zoomOut: "ज़ूम आउट",
    legend: "मानचित्र संकेत", shelter: "आश्रय", hospital: "अस्पताल", selectedArea: "चुना क्षेत्र", sourcePanel: "स्रोत पारदर्शिता",
    sourceBody: "इस स्क्रीन के सभी रिकॉर्ड डेमो हैं। कोई आधिकारिक सिंक प्रस्तुत नहीं किया गया है।", signIn: "सुरक्षित संपादक साइन इन",
    signInIntro: "अधिकृत कर्मचारी अलर्ट, स्रोत और प्रकाशन प्रबंधित कर सकते हैं।", email: "कार्य ईमेल", password: "पासवर्ड", continue: "सुरक्षित रूप से जारी रखें",
    authNote: "प्रमाणीकरण कॉन्फ़िगर किए गए बैकएंड द्वारा संभाला जाता है।", authMissing: "इस UI अवधारणा में प्रमाणीकरण बैकएंड जुड़ा नहीं है।",
    preview: "ऑपरेशन कार्यक्षेत्र देखें", operations: "ऑपरेशन कार्यक्षेत्र", alertManagement: "अलर्ट प्रबंधन", createAlert: "अलर्ट बनाएँ",
    status: "प्रकाशन स्थिति", draft: "ड्राफ़्ट", audit: "ऑडिट लॉग", sources: "स्रोत और ताज़गी", lastChange: "अंतिम बदलाव",
    editedBy: "डेमो संपादक", unpublished: "अप्रकाशित", returnPublic: "सार्वजनिक डैशबोर्ड पर लौटें", skip: "मुख्य सामग्री पर जाएँ",
    mobileNav: "नेविगेशन खोलें", close: "बंद करें", loading: "कॉन्फ़िगर स्रोत जाँचे जा रहे हैं…", capacity: "क्षमता", open: "खोलें", menu: "मेन्यू",
  },
  fr: {
    lang: "Français", tagline: "COMMUNICATION DE CRISE POUR VOYAGEURS", dashboard: "Tableau de bord", conditions: "Conditions et abris",
    contacts: "Contacts d’urgence", editor: "Accès éditeur", selectLocation: "Lieu sélectionné", useLocation: "Utiliser ma position",
    location: "District côtier et métropolitain de Chennai, Tamil Nadu", heading: "Votre tableau de bord de sécurité",
    intro: "Alertes officielles, conseils locaux et ressources d’urgence pour la zone sélectionnée.", freshness: "Données de démonstration · Aucune source en direct",
    checked: "Connexion aux sources non configurée", currentAlerts: "Alertes actuelles", filters: "Filtrer les alertes", all: "Toutes",
    cyclone: "Cyclone", rain: "Fortes pluies", flooding: "Inondation / accumulation d’eau", other: "Autre", critical: "Critique", warning: "Alerte",
    watch: "Veille", info: "Information", simulation: "DÉMO / SIMULATION", affected: "Zone concernée", instruction: "Action recommandée",
    source: "Source", issued: "Émise", retrieved: "Dernière récupération", verification: "Vérification", unverified: "Simulation — pas un bulletin officiel",
    metadata: "Métadonnées de source", details: "Voir tous les détails", hide: "Masquer les détails", translated: "Traduction non officielle",
    original: "Bulletin de démonstration original (anglais)", notReplace: "Cette traduction est fournie à titre pratique et ne remplace pas un avis officiel.",
    noAlerts: "Aucune alerte de démonstration dans cette vue", noAlertsBody: "Aucun exemple correspondant. Cela ne confirme pas que la zone est sûre.",
    explore: "Explorer les conditions locales", exploreBody: "Consultez les ressources cartographiées et la liste accessible.", openMap: "Explorer la carte et les abris",
    mapNote: "Les distances sont approximatives. Elles ne garantissent ni la sûreté d’un itinéraire ni qu’un lieu est épargné.",
    shelterTitle: "Abris désignés et ressources d’urgence", shelterIntro: "Listes de démonstration uniquement. Confirmez auprès des autorités avant tout déplacement.",
    notVerified: "Non vérifié indépendamment", demoListing: "Liste simulée", approximate: "Distance approx.", detailsAction: "Détails", facility: "Type d’établissement",
    address: "Zone", sourceOrg: "Organisation source", lastVerified: "Dernière vérification", unavailable: "Non disponible dans la démo", alternative: "Liste accessible",
    emergencyPlan: "Plan d’action d’urgence", planIntro: "Suivez toujours les dernières instructions des autorités locales.", step1: "Lisez la dernière alerte officielle.",
    step2: "Suivez les instructions des autorités locales.", step3: "Évitez les zones touchées ou interdites.", step4: "Identifiez un abri officiel lorsque demandé.",
    step5: "Contactez les secours si nécessaire.", contactTitle: "Contacts d’urgence", contactIntro: "Services régionaux configurés pour la zone sélectionnée.",
    call: "Appeler", numberSource: "Référence configurée", emergency: "Intervention d’urgence", emergencyDesc: "Numéro d’urgence unique configuré pour l’Inde.",
    demoControls: "Scénario de démonstration", default: "Par défaut", redAlert: "Alerte rouge cyclone", clearDemo: "Démo sans alerte",
    outage: "Source indisponible / données anciennes", demoHint: "Ces commandes modifient uniquement le contenu simulé.",
    defaultTitle: "La connexion au flux officiel n’est pas configurée", defaultBody: "SafeRoute ne peut pas confirmer les alertes actuelles pour cette zone.",
    clearTitle: "Aucune alerte active renvoyée dans cette démonstration", clearBody: "Il s’agit d’une simulation et non d’une confirmation de sécurité.",
    outageTitle: "Source officielle indisponible", outageBody: "Les informations peuvent être obsolètes. Dernière récupération simulée il y a 42 minutes.",
    alertTitle: "Démonstration : alerte météo cyclonique sévère", alertBody: "Simulation de l’affichage d’un bulletin de haute gravité pour Chennai.",
    alertAction: "Consultez les mises à jour officielles et suivez les instructions locales.", area: "Zone côtière de démonstration de Chennai",
    showAll: "Tout afficher", mapUnavailable: "Données cartographiques interactives indisponibles", mapUnavailableBody: "La carte en direct n’est pas connectée. Utilisez la liste et confirmez auprès des autorités.",
    zoomIn: "Zoom avant", zoomOut: "Zoom arrière", legend: "Légende", shelter: "Abri", hospital: "Hôpital", selectedArea: "Zone sélectionnée",
    sourcePanel: "Transparence des sources", sourceBody: "Toutes les données de cet écran sont simulées. Aucune synchronisation officielle n’est représentée.",
    signIn: "Connexion sécurisée éditeur", signInIntro: "Le personnel autorisé peut gérer alertes, sources et publication.", email: "E-mail professionnel",
    password: "Mot de passe", continue: "Continuer en sécurité", authNote: "L’authentification est gérée par le serveur configuré.",
    authMissing: "Le serveur d’authentification n’est pas connecté dans ce concept.", preview: "Prévisualiser l’espace opérations",
    operations: "Espace opérations", alertManagement: "Gestion des alertes", createAlert: "Créer une alerte", status: "Statut de publication",
    draft: "Brouillon", audit: "Journal d’audit", sources: "Sources et fraîcheur", lastChange: "Dernière modification", editedBy: "Éditeur démo",
    unpublished: "Non publiée", returnPublic: "Retour au tableau public", skip: "Aller au contenu principal", mobileNav: "Ouvrir la navigation",
    close: "Fermer", loading: "Vérification des sources configurées…", capacity: "Capacité", open: "Ouvrir", menu: "Menu",
  },
} as const;

type Copy = (typeof messages)[Language];

function Icon({ name, size = 20 }: { name: IconName; size?: number }) {
  const icons: Record<IconName, ReactNode> = {
    alert: <><path d="M12 9v4m0 4h.01"/><path d="M10.3 3.7 2.2 18a2 2 0 0 0 1.8 3h16a2 2 0 0 0 1.8-3L13.7 3.7a2 2 0 0 0-3.4 0Z"/></>,
    arrow: <path d="m9 18 6-6-6-6"/>, building: <><path d="M3 21h18M6 21V7l6-4 6 4v14M9 10h.01M15 10h.01M9 14h.01M15 14h.01M10 21v-3h4v3"/></>,
    calendar: <><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4M8 3v4M3 11h18"/></>, check: <path d="m5 12 4 4L19 6"/>,
    chevron: <path d="m6 9 6 6 6-6"/>, clock: <><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></>,
    cloud: <path d="M17.5 19H9a7 7 0 1 1 6.7-9h1.8a4.5 4.5 0 1 1 0 9Z"/>,
    document: <><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z"/><path d="M14 2v6h6M8 13h8M8 17h6"/></>,
    external: <><path d="M14 3h7v7M10 14 21 3"/><path d="M21 14v5a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5"/></>,
    eye: <><path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/></>,
    globe: <><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a15 15 0 0 1 0 18M12 3a15 15 0 0 0 0 18"/></>,
    home: <><path d="m3 11 9-8 9 8M5 10v11h14V10M9 21v-6h6v6"/></>, hospital: <><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M12 7v10M7 12h10"/></>,
    info: <><circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/></>, layers: <><path d="m12 2 9 5-9 5-9-5 9-5Z"/><path d="m3 12 9 5 9-5M3 17l9 5 9-5"/></>,
    location: <><path d="M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2.5"/></>,
    lock: <><rect x="4" y="10" width="16" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/></>, mail: <><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/></>,
    menu: <path d="M4 7h16M4 12h16M4 17h16"/>, minus: <path d="M5 12h14"/>, phone: <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.4 19.4 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 2 .7 2.9a2 2 0 0 1-.4 2.1L8.1 10a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4 13 13 0 0 0 2.9.7 2 2 0 0 1 1.6 1.9Z"/>,
    plus: <path d="M12 5v14M5 12h14"/>, rain: <><path d="M17.5 15H9a7 7 0 1 1 6.7-9h1.8a4.5 4.5 0 1 1 0 9Z"/><path d="m8 19-1 2m6-2-1 2m6-2-1 2"/></>,
    route: <><circle cx="6" cy="19" r="2"/><circle cx="18" cy="5" r="2"/><path d="M8 19h3a3 3 0 0 0 3-3V8a3 3 0 0 1 3-3"/></>,
    search: <><circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/></>, settings: <><circle cx="12" cy="12" r="3"/><path d="M19.4 15a2 2 0 0 0 .4 2.2l.1.1-2.8 2.8-.1-.1a2 2 0 0 0-2.2-.4 2 2 0 0 0-1.2 1.8V22H10v-.2A2 2 0 0 0 8.7 20a2 2 0 0 0-2.2.4l-.1.1-2.8-2.8.1-.1a2 2 0 0 0 .4-2.2 2 2 0 0 0-1.8-1.2H2v-4h.2A2 2 0 0 0 4 9a2 2 0 0 0-.4-2.2l-.1-.1 2.8-2.8.1.1a2 2 0 0 0 2.2.4A2 2 0 0 0 9.8 2.6V2h4v.2A2 2 0 0 0 15 4a2 2 0 0 0 2.2-.4l.1-.1 2.8 2.8-.1.1a2 2 0 0 0-.4 2.2 2 2 0 0 0 1.8 1.2h.6v4h-.2A2 2 0 0 0 19.4 15Z"/></>,
    shield: <><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z"/><path d="m9 12 2 2 4-4"/></>,
    user: <><circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/></>, users: <><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.9M16 3.1a4 4 0 0 1 0 7.8"/></>,
    warning: <><path d="M12 9v4m0 4h.01"/><path d="M10.3 3.7 2.2 18a2 2 0 0 0 1.8 3h16a2 2 0 0 0 1.8-3L13.7 3.7a2 2 0 0 0-3.4 0Z"/></>,
    x: <path d="m18 6-12 12M6 6l12 12"/>,
  };
  return <svg aria-hidden="true" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">{icons[name]}</svg>;
}

export default function App() {
  const [language, setLanguage] = useState<Language>("en");
  const [page, setPage] = useState<Page>("dashboard");
  const [scenario, setScenario] = useState<Scenario>("default");
  const [mobileNav, setMobileNav] = useState(false);
  const [editorPreview, setEditorPreview] = useState(false);
  const t = messages[language];

  const navigate = (next: Page) => {
    setPage(next);
    setMobileNav(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-[#F6F8FA] text-[#101828]">
      <a href="#main" className="skip-link">{t.skip}</a>
      <Header t={t} language={language} setLanguage={setLanguage} page={page} navigate={navigate} mobileNav={mobileNav} setMobileNav={setMobileNav} />
      <main id="main">
        {page === "dashboard" && <Dashboard t={t} language={language} scenario={scenario} setScenario={setScenario} navigate={navigate} />}
        {page === "conditions" && <Conditions t={t} />}
        {page === "contacts" && <Contacts t={t} />}
        {page === "editor" && <Editor t={t} preview={editorPreview} setPreview={setEditorPreview} navigate={navigate} />}
      </main>
      {page !== "contacts" && page !== "editor" && (
        <button type="button" className="emergency-fab" onClick={() => navigate("contacts")}><Icon name="phone" size={19}/><span>{t.contacts}</span></button>
      )}
    </div>
  );
}

function Header({ t, language, setLanguage, page, navigate, mobileNav, setMobileNav }: {
  t: Copy; language: Language; setLanguage: (l: Language) => void; page: Page; navigate: (p: Page) => void;
  mobileNav: boolean; setMobileNav: (v: boolean) => void;
}) {
  const nav: { key: Page; label: string }[] = [
    { key: "dashboard", label: t.dashboard }, { key: "conditions", label: t.conditions }, { key: "contacts", label: t.contacts },
  ];
  return (
    <header className="sticky top-0 z-40 border-b border-[#E2E8F0] bg-white">
      <div className="mx-auto flex h-16 max-w-[1440px] items-center gap-4 px-4 sm:px-6 lg:px-10">
        <button type="button" onClick={() => navigate("dashboard")} className="brand">
          <span className="brand-mark"><Icon name="shield" size={21}/></span>
          <span><strong>SafeRoute</strong><small>{t.tagline}</small></span>
        </button>
        <nav className="ms-7 hidden h-full items-center gap-1 lg:flex" aria-label="Primary">
          {nav.map(item => <button type="button" key={item.key} onClick={() => navigate(item.key)} aria-current={page === item.key ? "page" : undefined} className={`top-nav ${page === item.key ? "active" : ""}`}>{item.label}</button>)}
        </nav>
        <div className="ms-auto flex items-center gap-2">
          <label className="language-control">
            <span className="sr-only">{t.lang}</span><Icon name="globe" size={17}/>
            <select value={language} onChange={e => setLanguage(e.target.value as Language)} aria-label={t.lang}>
              <option value="en">English</option><option value="ta">தமிழ்</option><option value="hi">हिन्दी</option><option value="fr">Français</option>
            </select><Icon name="chevron" size={13}/>
          </label>
          <button type="button" onClick={() => navigate("contacts")} className="header-emergency"><Icon name="phone" size={17}/><span className="hidden sm:inline">{t.contacts}</span></button>
          <button type="button" onClick={() => navigate("editor")} className="hidden rounded-lg px-3 py-2 text-sm font-semibold text-[#475467] hover:bg-slate-50 md:block">{t.editor}</button>
          <button type="button" className="icon-button lg:hidden" onClick={() => setMobileNav(!mobileNav)} aria-expanded={mobileNav} aria-label={t.mobileNav}><Icon name={mobileNav ? "x" : "menu"}/></button>
        </div>
      </div>
      {mobileNav && <nav className="border-t border-[#E2E8F0] bg-white p-3 lg:hidden" aria-label="Mobile">{[...nav, { key: "editor" as Page, label: t.editor }].map(item => <button type="button" key={item.key} onClick={() => navigate(item.key)} className="mobile-nav">{item.label}<Icon name="arrow" size={17}/></button>)}</nav>}
      <div className="location-bar">
        <div className="mx-auto flex max-w-[1440px] items-center gap-3 px-4 py-2 sm:px-6 lg:px-10">
          <Icon name="location" size={16}/><span className="hidden text-xs font-semibold text-[#667085] sm:block">{t.selectLocation}</span>
          <button type="button" className="min-w-0 truncate text-start text-sm font-bold text-[#101828]">{t.location}</button>
          <Icon name="chevron" size={14}/><button type="button" className="ms-auto hidden items-center gap-2 text-xs font-bold text-[#007F78] sm:flex"><Icon name="route" size={15}/>{t.useLocation}</button>
        </div>
      </div>
    </header>
  );
}

function Dashboard({ t, language, scenario, setScenario, navigate }: {
  t: Copy; language: Language; scenario: Scenario; setScenario: (s: Scenario) => void; navigate: (p: Page) => void;
}) {
  const [hazard, setHazard] = useState("all");
  const hasAlert = scenario === "cyclone" && (hazard === "all" || hazard === "cyclone");
  return (
    <div className="page-shell">
      <section className="page-intro">
        <div>
          <div className="eyebrow"><Icon name="location" size={14}/>{t.location}</div>
          <h1>{t.heading}</h1><p>{t.intro}</p>
        </div>
        <div className="freshness"><span className="status-dot neutral"/><span><strong>{t.freshness}</strong><small>{t.checked}</small></span></div>
      </section>
      <StatusHero t={t} scenario={scenario}/>
      <DemoControl t={t} scenario={scenario} setScenario={setScenario}/>

      <section className="section-block" aria-labelledby="alerts-heading">
        <div className="section-heading"><div><span className="kicker">01 / ALERTS</span><h2 id="alerts-heading">{t.currentAlerts}</h2></div><span className="record-count">{hasAlert ? "1" : "0"}</span></div>
        <div className="filter-row" aria-label={t.filters}>
          {[["all",t.all],["cyclone",t.cyclone],["rain",t.rain],["flood",t.flooding],["other",t.other]].map(([key,label]) =>
            <button type="button" key={key} className={hazard === key ? "selected" : ""} onClick={() => setHazard(key)}>{label}</button>)}
        </div>
        {hasAlert ? <AlertCard t={t} language={language}/> : <EmptyAlerts t={t} scenario={scenario}/>}
      </section>

      <section className="section-block grid gap-6 lg:grid-cols-[1.35fr_.65fr]">
        <div className="map-teaser">
          <div className="map-teaser-copy">
            <span className="kicker">02 / LOCAL CONDITIONS</span><h2>{t.explore}</h2><p>{t.exploreBody}</p>
            <button type="button" className="primary-button" onClick={() => navigate("conditions")}>{t.openMap}<Icon name="arrow" size={17}/></button>
          </div>
          <div className="mini-map" aria-hidden="true"><span className="map-grid"/><span className="map-marker one"><Icon name="building" size={16}/></span><span className="map-marker two"><Icon name="hospital" size={16}/></span><span className="map-marker user"><span/></span></div>
          <p className="map-disclaimer"><Icon name="info" size={15}/>{t.mapNote}</p>
        </div>
        <ActionPlan t={t} compact/>
      </section>
      <SourcePanel t={t}/>
    </div>
  );
}

function StatusHero({ t, scenario }: { t: Copy; scenario: Scenario }) {
  const config = {
    default: { tone: "neutral", label: t.checked, title: t.defaultTitle, body: t.defaultBody, icon: "info" as IconName },
    cyclone: { tone: "critical", label: `${t.critical} · ${t.simulation}`, title: t.alertTitle, body: t.alertAction, icon: "warning" as IconName },
    clear: { tone: "clear", label: `${t.simulation} · ${t.clearDemo}`, title: t.clearTitle, body: t.clearBody, icon: "check" as IconName },
    outage: { tone: "warning", label: t.outage, title: t.outageTitle, body: t.outageBody, icon: "cloud" as IconName },
  }[scenario];
  return (
    <section className={`status-hero ${config.tone}`} aria-live="polite">
      <span className="hero-icon"><Icon name={config.icon} size={26}/></span>
      <div className="min-w-0 flex-1"><div className="hero-label">{config.label}</div><h2>{config.title}</h2><p>{config.body}</p>
        {scenario === "cyclone" && <div className="hero-meta"><span><Icon name="location" size={15}/>{t.area}</span><span><Icon name="clock" size={15}/>10:30 IST · 14 Nov 2025</span></div>}
      </div>
      <span className="source-state"><Icon name="info" size={15}/>{t.unverified}</span>
    </section>
  );
}

function DemoControl({ t, scenario, setScenario }: { t: Copy; scenario: Scenario; setScenario: (s: Scenario) => void }) {
  return <details className="demo-control"><summary><span><Icon name="settings" size={16}/>{t.demoControls}</span><strong>{scenario === "default" ? t.default : scenario === "cyclone" ? t.redAlert : scenario === "clear" ? t.clearDemo : t.outage}</strong><Icon name="chevron" size={15}/></summary>
    <div><p>{t.demoHint}</p><div className="demo-options">{[["default",t.default],["cyclone",t.redAlert],["clear",t.clearDemo],["outage",t.outage]].map(([key,label]) => <button type="button" key={key} onClick={() => setScenario(key as Scenario)} className={scenario === key ? "active" : ""}>{scenario === key && <Icon name="check" size={15}/>} {label}</button>)}</div></div>
  </details>;
}

function AlertCard({ t, language }: { t: Copy; language: Language }) {
  const [open, setOpen] = useState(false);
  return (
    <article className="alert-card">
      <div className="alert-accent"/><div className="alert-content">
        <div className="badge-row"><span className="severity critical"><Icon name="alert" size={13}/>{t.critical}</span><span className="demo-badge">{t.simulation}</span><span className="verified-state"><Icon name="info" size={14}/>{t.unverified}</span></div>
        <h3>{t.alertTitle}</h3><p className="alert-area"><Icon name="location" size={16}/><strong>{t.affected}:</strong> {t.area}</p>
        <p className="alert-description">{t.alertBody}</p>
        <div className="instruction"><Icon name="shield" size={20}/><div><strong>{t.instruction}</strong><p>{t.alertAction}</p></div></div>
        {language !== "en" && <div className="translation"><span>{t.translated}</span><p>{t.alertBody}</p><small>{t.notReplace}</small></div>}
        <dl className="alert-facts"><div><dt>{t.source}</dt><dd>SafeRoute scenario engine</dd></div><div><dt>{t.issued}</dt><dd>14 Nov 2025 · 10:30 IST</dd></div><div><dt>{t.retrieved}</dt><dd>{t.unavailable}</dd></div></dl>
        {open && <div className="metadata"><div><span>{t.original}</span><p>DEMONSTRATION ONLY: Severe cyclonic weather conditions may affect the Chennai coastal demonstration area. This text is not issued by an authority.</p></div><dl><div><dt>Record ID</dt><dd>DEMO-CYC-001</dd></div><div><dt>{t.verification}</dt><dd>{t.unverified}</dd></div><div><dt>{t.status}</dt><dd>{t.unpublished}</dd></div></dl></div>}
        <div className="alert-actions"><button type="button" className="primary-button" onClick={() => setOpen(!open)}>{open ? t.hide : t.details}<Icon name={open ? "chevron" : "arrow"} size={16}/></button><button type="button" className="text-button" onClick={() => setOpen(!open)}>{t.metadata}</button></div>
      </div>
    </article>
  );
}

function EmptyAlerts({ t, scenario }: { t: Copy; scenario: Scenario }) {
  return <div className="empty-state"><span><Icon name={scenario === "clear" ? "check" : "search"} size={25}/></span><h3>{t.noAlerts}</h3><p>{t.noAlertsBody}</p></div>;
}

function Conditions({ t }: { t: Copy }) {
  const [zoom, setZoom] = useState(12);
  return <div className="page-shell">
    <section className="page-intro"><div><div className="eyebrow"><Icon name="location" size={14}/>{t.location}</div><h1>{t.explore}</h1><p>{t.exploreBody}</p></div></section>
    <div className="conditions-layout">
      <section className="map-card" aria-labelledby="map-heading">
        <div className="map-card-head"><div><span className="kicker">OPENSTREETMAP</span><h2 id="map-heading">{t.explore}</h2></div><div className="map-tools"><button type="button" onClick={() => setZoom(Math.min(18, zoom + 1))} aria-label={t.zoomIn}><Icon name="plus"/></button><span>{zoom}</span><button type="button" onClick={() => setZoom(Math.max(8, zoom - 1))} aria-label={t.zoomOut}><Icon name="minus"/></button></div></div>
        <div className="map-frame">
          <iframe title={t.explore} src="https://www.openstreetmap.org/export/embed.html?bbox=80.215%2C12.96%2C80.31%2C13.12&layer=mapnik" loading="lazy"/>
          <div className="map-legend"><strong>{t.legend}</strong><span><i className="dot teal"/>{t.shelter}</span><span><i className="dot red"/>{t.hospital}</span><span><i className="dot blue"/>{t.selectedArea}</span></div>
        </div>
        <p className="map-disclaimer"><Icon name="info" size={15}/>{t.mapNote}</p>
      </section>
      <ActionPlan t={t}/>
    </div>
    <Shelters t={t}/>
    <SourcePanel t={t}/>
  </div>;
}

function Shelters({ t }: { t: Copy }) {
  const facilities = [
    { name: "Demo Coastal Community Hall", type: t.shelter, area: "North Chennai demonstration area", distance: "4.2 km", icon: "building" as IconName },
    { name: "Demo Metropolitan Relief Centre", type: t.shelter, area: "Central Chennai demonstration area", distance: "6.8 km", icon: "users" as IconName },
    { name: "Demo District Medical Facility", type: t.hospital, area: "South Chennai demonstration area", distance: "8.1 km", icon: "hospital" as IconName },
  ];
  return <section className="section-block" aria-labelledby="shelters-heading"><div className="section-heading"><div><span className="kicker">03 / RESOURCES</span><h2 id="shelters-heading">{t.shelterTitle}</h2><p>{t.shelterIntro}</p></div></div>
    <div className="shelter-list" aria-label={t.alternative}>{facilities.map((f, index) => <article key={f.name} className="shelter-row">
      <span className="facility-icon"><Icon name={f.icon} size={21}/></span><div className="facility-main"><div className="badge-row"><span className="demo-badge">{t.demoListing}</span><span className="unverified"><Icon name="info" size={13}/>{t.notVerified}</span></div><h3>{f.name}</h3><p>{f.type} · {f.area}</p></div>
      <dl><div><dt>{t.approximate}</dt><dd>{f.distance}</dd></div><div><dt>{t.sourceOrg}</dt><dd>SafeRoute demo dataset</dd></div><div><dt>{t.capacity}</dt><dd>{t.unavailable}</dd></div></dl>
      <details><summary>{t.detailsAction}<Icon name="chevron" size={15}/></summary><p><strong>{t.lastVerified}:</strong> {t.unavailable}. <strong>{t.address}:</strong> {f.area}. ID: DEMO-LOC-00{index + 1}.</p></details>
    </article>)}</div>
  </section>;
}

function ActionPlan({ t, compact = false }: { t: Copy; compact?: boolean }) {
  const steps = [t.step1,t.step2,t.step3,t.step4,t.step5];
  return <aside className={`action-plan ${compact ? "compact" : ""}`}><span className="kicker">GUIDANCE</span><h2>{t.emergencyPlan}</h2><p>{t.planIntro}</p><ol>{steps.map((step,i) => <li key={step}><span>{i+1}</span><p>{step}</p></li>)}</ol></aside>;
}

function Contacts({ t }: { t: Copy }) {
  return <div className="page-shell narrow">
    <section className="page-intro"><div><div className="eyebrow"><Icon name="phone" size={14}/>{t.location}</div><h1>{t.contactTitle}</h1><p>{t.contactIntro}</p></div></section>
    <div className="contact-hero"><span><Icon name="phone" size={27}/></span><div><small>{t.emergency}</small><strong>112</strong><p>{t.emergencyDesc}</p></div><a href="tel:112" className="call-button"><Icon name="phone" size={19}/>{t.call} 112</a></div>
    <div className="trust-note"><Icon name="info" size={19}/><p><strong>{t.numberSource}</strong><br/>{t.sourceBody}</p></div>
    <ActionPlan t={t}/>
  </div>;
}

function SourcePanel({ t }: { t: Copy }) {
  return <aside className="source-panel"><Icon name="document" size={20}/><div><h2>{t.sourcePanel}</h2><p>{t.sourceBody}</p></div><span>{t.simulation}</span></aside>;
}

function Editor({ t, preview, setPreview, navigate }: { t: Copy; preview: boolean; setPreview: (v: boolean) => void; navigate: (p: Page) => void }) {
  const [error, setError] = useState(false);
  const submit = (e: FormEvent) => { e.preventDefault(); setError(true); };
  if (!preview) return <div className="editor-shell"><button type="button" className="back-link" onClick={() => navigate("dashboard")}><Icon name="arrow" size={16}/>{t.returnPublic}</button>
    <div className="sign-in-layout"><section className="sign-in-brand"><span className="brand-mark large"><Icon name="shield" size={29}/></span><span className="kicker">SAFEROUTE OPERATIONS</span><h1>{t.signIn}</h1><p>{t.signInIntro}</p><div className="security-points"><span><Icon name="lock" size={18}/>{t.authNote}</span><span><Icon name="document" size={18}/>{t.audit}</span></div></section>
      <form className="sign-in-card" onSubmit={submit}><div className="form-icon"><Icon name="lock" size={22}/></div><h2>{t.signIn}</h2><p>{t.signInIntro}</p>
        <label><span>{t.email}</span><div><Icon name="mail" size={17}/><input type="email" required autoComplete="username"/></div></label>
        <label><span>{t.password}</span><div><Icon name="lock" size={17}/><input type="password" required autoComplete="current-password"/></div></label>
        {error && <p className="form-error" role="alert">{t.authMissing}</p>}<button type="submit" className="primary-button full">{t.continue}<Icon name="arrow" size={17}/></button>
        <button type="button" className="preview-button" onClick={() => setPreview(true)}><Icon name="eye" size={17}/>{t.preview}</button>
      </form>
    </div></div>;
  return <div className="ops-shell"><aside className="ops-sidebar"><button type="button" className="brand light" onClick={() => navigate("dashboard")}><span className="brand-mark"><Icon name="shield" size={20}/></span><span><strong>SafeRoute</strong><small>OPERATIONS</small></span></button>
    <nav><button className="active"><Icon name="alert" size={18}/>{t.alertManagement}</button><button><Icon name="layers" size={18}/>{t.sources}</button><button><Icon name="document" size={18}/>{t.audit}</button></nav>
    <button type="button" onClick={() => setPreview(false)} className="exit-preview">{t.close} · {t.preview}</button></aside>
    <main className="ops-main"><div className="ops-header"><div><span className="demo-badge">{t.simulation}</span><h1>{t.operations}</h1></div><button type="button" className="primary-button"><Icon name="plus" size={17}/>{t.createAlert}</button></div>
      <div className="ops-stats"><div><span>{t.draft}</span><strong>1</strong></div><div><span>{t.sources}</span><strong>0 / 3</strong></div><div><span>{t.status}</span><strong>{t.unpublished}</strong></div></div>
      <section className="ops-card"><div className="ops-card-head"><h2>{t.alertManagement}</h2><div className="search"><Icon name="search" size={17}/><input aria-label={t.filters}/></div></div>
        <div className="ops-alert-row"><span className="severity critical">{t.critical}</span><div><strong>{t.alertTitle}</strong><p>{t.area} · DEMO-CYC-001</p></div><span className="demo-badge">{t.draft}</span><span>{t.editedBy}<small>{t.lastChange}: 14 Nov, 10:38</small></span><button className="icon-button" aria-label={t.open}><Icon name="arrow"/></button></div>
      </section>
      <div className="ops-grid"><section className="ops-card"><h2>{t.sources}</h2><div className="source-health"><span className="status-dot neutral"/><div><strong>{t.defaultTitle}</strong><p>{t.checked}</p></div></div></section><section className="ops-card"><h2>{t.audit}</h2><p className="audit-entry"><Icon name="clock" size={17}/><span><strong>{t.editedBy}</strong><br/>{t.lastChange}: 14 Nov 2025 · 10:38 IST</span></p></section></div>
    </main>
  </div>;
}
