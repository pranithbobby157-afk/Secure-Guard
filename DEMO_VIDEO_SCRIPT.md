# SafeRoute 🛡️ — Official Hackathon Demo Video Script

**Event:** IIITDM Kancheepuram 24-Hour Web Development Hackathon (Bits & Bytes)  
**Domain:** TravelTech — Real-Time Crisis Communication for Tourists During Extreme Weather Events  
**Live Production URL:** [https://secure-route-delta.vercel.app](https://secure-route-delta.vercel.app)  
**Cloud Backend & Edge Functions:** Supabase (`ijbsprdkrhnimhiknpxe`)  
**Official Repository:** [rohithkarthik25-code/Secure-Route](https://github.com/rohithkarthik25-code/Secure-Route.git)  
**Demo Video Google Drive Link:** [https://drive.google.com/drive/folders/1eZV0XeShkFdx9qnvbQTdoYXOF3zmAeMg?usp=drive_link](https://drive.google.com/drive/folders/1eZV0XeShkFdx9qnvbQTdoYXOF3zmAeMg?usp=drive_link)  
**Target Video Duration:** 4 to 5 Minutes  

---

## 🎬 Video Overview & Presenter Flow

| Timestamp | Phase / Section | Key Feature Demonstrated | Primary Screen / Component |
|---|---|---|---|
| **0:00 – 0:40** | Introduction & Problem Context | The Tourist Crisis Dilemma | Live Production Landing (`/`) |
| **0:40 – 1:25** | Authoritative Alert Feed & Multi-Language Engine | Linguistic Preservation (EN / TA / HI / FR) | Dashboard & Alert Detail |
| **1:25 – 2:05** | Conditions & Geospatial Shelter Map | Leaflet Map, GPS Beacon, Safe Zones | Conditions & Shelters (`/map`) |
| **2:05 – 2:50** | Route Corridor Assessment & 1-Click Re-Routing | Corridor Buffer & Danger Zone Intersect | Route Check (`/routes`) |
| **2:50 – 3:30** | Rumor Verification & Fake News Debunker | Official Bulletin Match vs. Rumor | Verify Engine (`/verify`) |
| **3:30 – 4:05** | Offline Multilingual Phrasebook & SOS Quick Mode | Audio Pronunciation & High-Contrast SOS | Phrasebook & Quick Mode Modal |
| **4:05 – 4:45** | Role-Based Access Control & Operations Portal | Google OAuth, Admin / Editor Privileges | Editor Portal (`/editor`) & Admin Modal |
| **4:45 – 5:00** | Architectural Resilience & Conclusion | Supabase RLS, Vercel, Dual-Stack APIs | Summary & Data Sources (`/sources`) |

---

## 🎙️ Step-by-Step Screenplay & Narration

### [0:00 – 0:40] Scene 1: Introduction & The Tourist Vulnerability Dilemma
- **Visual Setup:**
  - Full screen browser open at `https://secure-route-delta.vercel.app`.
  - Cursor highlights the clean, authoritative top navigation header: SafeRoute logo, Location Selector (`Chennai Coastal & Urban Core`), Language Switcher, Emergency Contacts button, and Quick Mode button.
- **On-Screen Actions:**
  - Show the live homepage loading instantly with zero login friction.
  - Scroll smoothly down the main dashboard showing active emergency banners.
- **Presenter Voiceover:**
  > *"Respected judges and evaluators, welcome to **SafeRoute** — built by team **Bits & Bytes** for the IIITDM Kancheepuram Hackathon.*  
  >  
  > *When extreme weather disasters strike coastal tourist hubs — such as Cyclone Michaung or sudden monsoonal cloudbursts in Chennai and Kancheepuram — visiting and foreign tourists face life-threatening challenges:  
  > 1. **Language barriers** when official broadcasts are issued in regional scripts like Tamil.  
  > 2. **Geographic unfamiliarity**, leaving visitors unaware of low-lying flood basins and designated relief shelters.  
  > 3. **Rampant social media misinformation** that leads panic-stricken travellers straight into inundated corridors.  
  >  
  > *SafeRoute is built on three unshakeable ethical principles: **Zero Login Friction** for tourists, **Never Inventing Safety**, and **Side-by-Side Linguistic Preservation**."*

---

### [0:40 – 1:25] Scene 2: Authoritative Alert Feed & Dual-Language Engine
- **Visual Setup:**
  - Dashboard view with the active **Cyclone Critical Alert** from the India Meteorological Department (IMD) and **Severe Waterlogging Warning** from the Greater Chennai Corporation (GCC).
- **On-Screen Actions:**
  - Click on the language dropdown in the header. Switch from **English** to **தமிழ் (Tamil)**.
  - Hover over the alert card showing the translated title and instructions alongside the original English/Tamil text.
  - Switch to **हिन्दी (Hindi)**.
  - Point to the **Feed Health indicator**: "Feed Active (3/3 Sources Active)" with green status indicator.
- **Presenter Voiceover:**
  > *"Here on the central dashboard, tourists immediately receive verified life-safety advisories from official authorities — including the IMD and Greater Chennai Corporation.  
  >  
  > Observe our **Linguistic Preservation Engine**: When we toggle between English, Tamil, and Hindi, SafeRoute does not replace the official notification with an ambiguous translation. It presents the translation side-by-side with the authoritative original bulletin, preserving critical proper nouns, designated evacuation points, and hotline timestamps.  
  >  
  > Furthermore, look at our Feed Health Monitor: it continuously tracks all three upstream government telemetry sources. If a source encounters downtime, SafeRoute explicitly surfaces an amber degraded state with cached timestamps — we never mislead users with a false '0 alerts' state."*

---

### [1:25 – 2:05] Scene 3: Interactive Crisis Map & Shelter Locator
- **Visual Setup:**
  - Click **'Conditions & shelters'** tab in the navigation bar (`/map`).
- **On-Screen Actions:**
  - Interactive Leaflet map initializes centered on the selected district with custom tile layers.
  - Highlight the pulsating **hazard circles** (red for critical cyclone zones, amber for waterlogged transit roads).
  - Click the **'Use My Location'** GPS button. The map centers on the current GPS coordinates with a blue beacon pin.
  - Click on an emerald shield icon on the map (e.g., *Santhome Community Relief Centre*).
  - Pop-up opens displaying shelter capacity, 24/7 hotline, address, and straight-line distance.
- **Presenter Voiceover:**
  > *"Moving to **Conditions & Shelters**, tourists are presented with an interactive geospatial map that visualizes danger and safety simultaneously.  
  >  
  > Pulsating red and amber circles delineate active flood zones and gale-force wind sectors. Emerald shield markers highlight officially designated government relief shelters.  
  >  
  > When a tourist clicks 'Use My Location', SafeRoute computes the nearest relief center using the Haversine formula. In strict adherence to our privacy mandate, geolocation coordinates exist exclusively in browser RAM and are never transmitted to our backend or persisted in databases."*

---

### [2:05 – 2:50] Scene 4: Route Corridor Check & 1-Click Re-Routing
- **Visual Setup:**
  - Click **'Route Check'** tab in the navigation bar (`/routes`).
- **On-Screen Actions:**
  - Select origin: `Chennai Coastal & Urban Core`.
  - Select destination: `Mahabalipuram (Mamallapuram)`.
  - Click **'Assess Route Corridor'**.
  - Show the **Interactive Transit Corridor Map** that renders directly inside the assessment card:
    - Origin pin at Chennai.
    - Destination pin at Mahabalipuram.
    - Cyan polyline connecting the corridor.
    - 20 km shaded safety buffer zone circle.
    - Intersecting danger zones (e.g., active cyclone simulation along ECR).
  - Point to the active advisories listed below the map with risk severity badges.
  - Click the new **'Re-route to Live Map'** button.
  - Watch the interface smoothly transition to the full interactive map view centered on the affected region.
- **Presenter Voiceover:**
  > *"Next is one of SafeRoute's standout features: the **Route & Travel Corridor Check**.  
  >  
  > Tourists often need to travel between hubs — such as Chennai to the UNESCO heritage site in Mahabalipuram. With one click, our engine computes the direct transit vector and checks for intersecting hazard buffer zones.  
  >  
  > Notice the embedded interactive map: it plots the corridor path, highlights the 20-kilometer geographic buffer zone, and identifies overlapping hazard warnings along the East Coast Road.  
  >  
  > If a tourist wants to see detour relief points, clicking **'Re-route to Live Map'** immediately transports them to the full operational map view. We also provide a **'Save Route'** feature that persists this corridor in browser local storage for offline reference when cell towers fail."*

---

### [2:50 – 3:30] Scene 5: WhatsApp & Rumor Verification Engine
- **Visual Setup:**
  - Click **'Verify'** tab in the navigation bar (`/verify`).
- **On-Screen Actions:**
  - Click one of the pre-filled sample rumor buttons: *"Chembarambakkam dam opened 50,000 cusecs without warning"*.
  - Click **'Verify Against Official Bulletins'**.
  - Show the instant verification result:
    - Red **'UNVERIFIED / RUMOR'** banner.
    - Explanation citing the latest official GCC and Water Resources Department releases.
    - Clear safety advice: *"Do not forward unverified WhatsApp forwards."*
  - Paste or select an official notification: *"Severe Cyclone Advisory"*.
  - Show the green **'OFFICIAL MATCH'** badge with source attribution, matching bulletin ID, and issuing authority.
- **Presenter Voiceover:**
  > *"During floods, WhatsApp forwards and viral social media rumors cause severe panic.  
  >  
  > Our **Verification Engine** allows travellers to paste any received SMS, tweet, or WhatsApp text. SafeRoute performs multi-token linguistic cross-matching against official government bulletins.  
  >  
  > Rumors claiming unannounced dam water discharges are immediately flagged as **Unverified Rumors** with authoritative context, while genuine advisories receive an **Official Match** badge with issuing department credentials."*

---

### [3:30 – 4:05] Scene 6: Offline Phrasebook & SOS Quick Mode
- **Visual Setup:**
  - Click **'Phrasebook'** (`/phrasebook`), then click **'Quick Mode'** (`⚡ Quick Mode` button).
- **On-Screen Actions:**
  - In Phrasebook:
    - Select category filter: **Medical & First Aid** or **Shelter & Evacuation**.
    - Click **'Play Audio'** on *"Where is the nearest flood shelter?"* (plays native Tamil audio synthesized via Web Speech API).
    - Click **'Copy'** button to copy the Tamil script for messaging.
  - Click **'Quick Mode'** in the top navigation:
    - High-contrast, stark-accessible emergency modal pops up.
    - Shows one-tap helpline dialers (**112**, **1070**, **1913**), current offline status, and largest nearby shelter.
- **Presenter Voiceover:**
  > *"For on-the-ground communication, the **Offline Phrasebook** equips international travellers with essential emergency phrases in Tamil, Hindi, and English. Travellers can play synthesized local audio or copy phrases into chat apps.  
  >  
  > In severe power outages or high-stress situations, clicking **'Quick Mode'** launches an ultra-high-contrast, low-cognitive-load emergency screen. It strips away complex visuals, putting one-tap emergency helpline buttons and immediate shelter details within instant reach."*

---

### [4:05 – 4:45] Scene 7: Role-Based Operations Portal & Admin Access
- **Visual Setup:**
  - Click **'Editor access'** (`/editor`) in the top navigation.
- **On-Screen Actions:**
  - Demonstrate authentication options:
    - **Google OAuth Sign-In**: Click "Continue with Google" (authenticated via Supabase Auth with automatic role assignment).
    - **Role Selector**: Show pre-configured test credentials for **Admin** (`admin / admin123`), **Editor** (`editor / editor123`), and **Citizen** (`user / user123`).
  - Log in as **Administrator**:
    - Show the **Live Operations Dashboard**.
    - Click the **'Places & Shelters'** tab: displays all active relief centers with coordinates and status.
    - Click **'Register Place'** button: opens the `CreateSafeZoneModal`.
    - Show fields: Facility Name, Shelter Type, Jurisdiction, Latitude & Longitude with **"Use GPS"** button, and Capacity.
    - Click **'Broadcast Alert'**: opens `CreateAlertModal` with auto-populated latitude and longitude.
    - Show the **Data Sources & Upstream Health** toggles and the immutable **Server Audit Trail**.
- **Presenter Voiceover:**
  > *"Now let's examine SafeRoute's backend governance and security.  
  >  
  > We support **Google OAuth Single Sign-On** powered by Supabase Auth, along with role-guarded credential access. The system enforces three distinct roles protected by PostgreSQL Row-Level Security:  
  > - **Citizen Users**: Access personalized safety tools and view-only status.  
  > - **Crisis Editors**: Authorized to register verified relief shelters and draft emergency bulletins.  
  > - **System Administrators**: Full privileges to toggle telemetry feeds, publish urgent alerts, and inspect immutable audit logs.  
  >  
  > When administrators register a new shelter or issue an alert with precise coordinates, it immediately renders across both the interactive map and the transit corridor engine."*

---

### [4:45 – 5:00] Scene 8: Architecture, Testing & Conclusion
- **Visual Setup:**
  - Switch to terminal / test summary and repository overview.
- **On-Screen Actions:**
  - Show the test suites: **18/18 Node Edge function tests passing** and **12/12 pytest tests passing**.
  - Show the live Vercel production deployment URL.
- **Presenter Voiceover:**
  > *"SafeRoute is built with exceptional engineering rigor:  
  > - **Dual-Stack Resilience**: Full Supabase cloud deployment with TypeScript Edge Functions and PostgreSQL RLS, complemented by a local FastAPI backend.  
  > - **100% Automated Test Pass Rate**: 18 Node.js edge tests and 12 Python backend tests covering token validation, Haversine routing, linguistic caching, and feed health.  
  > - **Live on Vercel**: Completely deployed, production-ready, and responsive on all devices.  
  >  
  > SafeRoute empowers travellers to navigate natural disasters with confidence, clarity, and authoritative safety. Thank you!"*

---

## 📋 Recording Checklist & Best Practices

1. **Display & Resolution:**
   - Record at **1080p (1920x1080)** or **4K (3840x2160)** at 60 fps.
   - Set browser zoom to **100%** or **110%** for maximum legibility of text and badges.
2. **Audio Setup:**
   - Use a clear microphone with background noise suppression.
   - Speak with an energetic, authoritative, and confident presentation tone.
3. **Demo Credentials to Keep Handy:**
   - **Admin Access:** `admin` / `admin123` (Full administrative & source control).
   - **Editor Access:** `editor` / `editor123` (Alert & shelter management).
   - **Citizen User:** `user` / `user123` (Standard verified viewer).
   - **Google OAuth:** Works via the **"Continue with Google"** button with automatic role mapping.
4. **Uploaded Video Drive Destination:**
   - Upload completed MP4 to: [Google Drive Demo Folder](https://drive.google.com/drive/folders/1eZV0XeShkFdx9qnvbQTdoYXOF3zmAeMg?usp=drive_link).
