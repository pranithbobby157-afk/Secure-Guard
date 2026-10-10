# SafeRoute 🛡️
### Real-Time Crisis Communication & Shelter Navigation for Tourists During Extreme Weather Events

[![Production Status](https://img.shields.io/badge/Production-Live-success?style=for-the-badge&logo=vercel)](https://secure-route-delta.vercel.app)
[![Supabase Backend](https://img.shields.io/badge/Supabase-Active-3ECF8E?style=for-the-badge&logo=supabase)](https://supabase.com)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![React 19](https://img.shields.io/badge/React-19.2-61DAFB?style=for-the-badge&logo=react)](https://react.dev/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115-009688?style=for-the-badge&logo=fastapi)](https://fastapi.tiangolo.com/)
[![Tests Passing](https://img.shields.io/badge/Tests-30%2F30%20Passing-brightgreen?style=for-the-badge&logo=checkmarx)](https://github.com/rohithkarthik25-code/Secure-Route)

**Event:** IIITDM Kancheepuram 24-Hour Web Development Hackathon  
**Track:** TravelTech  
**Team / Project:** Bits & Bytes — SafeRoute  
**Live Production URL:** [https://secure-route-delta.vercel.app](https://secure-route-delta.vercel.app)  
**Cloud Backend & Edge Functions:** Supabase (`ijbsprdkrhnimhiknpxe`)  
**Official GitHub Repository:** [rohithkarthik25-code/Secure-Route](https://github.com/rohithkarthik25-code/Secure-Route.git)  

---

## 🎥 Hackathon Demo Video

> **Google Drive Demo Video Link:**  
> 🔗 **[Watch the SafeRoute Demo Video on Google Drive](https://drive.google.com/drive/folders/1eZV0XeShkFdx9qnvbQTdoYXOF3zmAeMg?usp=drive_link)**  
>  
> *A full step-by-step video script, presenter screenplay, and timestamps are available in [`DEMO_VIDEO_SCRIPT.md`](DEMO_VIDEO_SCRIPT.md).*

---

## 📌 Problem Statement & Context

When localized extreme weather disasters strike coastal tourist hubs — such as severe cyclones, monsoonal cloudbursts, and flash flooding in Tamil Nadu (Chennai Coastal Zone, Kancheepuram, and the Nilgiris) — visiting domestic and foreign tourists are uniquely vulnerable:

1. **Severe Language Barriers:** Official emergency bulletins and evacuation orders issued in regional scripts (e.g., Tamil) cannot be understood by international travellers or domestic tourists from non-Tamil-speaking states.
2. **Geographic Unfamiliarity:** Tourists cannot interpret local administrative boundaries, flood-prone low-lying thoroughfares (e.g., Velachery, Madipakkam, ECR, OMR), or locate officially designated government relief shelters.
3. **Information Fragmentation & Social Media Panic:** Unverified WhatsApp rumors and sensationalized social media claims cause dangerous confusion, often leading panic-stricken tourists directly into submerged corridors.

---

## 💡 The SafeRoute Solution

**SafeRoute** is an authoritative, multilingual crisis communication and shelter navigation web platform designed specifically for tourists and non-local travellers caught in extreme weather emergencies.

### Core Ethical & Safety Mandates:
- **Zero Login Friction:** Public tourists access all life-safety advisories, shelter directories, route checks, and emergency phrasebooks with zero registration, login, or credentials required.
- **Never Invent Safety:** SafeRoute never declares an unmonitored area "safe" merely because no alert is listed. Missing data is surfaced with clear caveats.
- **Side-by-Side Linguistic Preservation:** Translations into Tamil, Hindi, French, and English are displayed alongside the authoritative government bulletin to preserve original proper nouns, evacuation coordinates, and contact details.
- **Transparent Degraded Feed Monitoring:** If an upstream government feed encounters downtime, SafeRoute prominently displays an amber degraded status with the last cached timestamp rather than falsely claiming "0 active alerts".
- **Zero-Knowledge Location Privacy:** Tourist geolocation coordinates are computed strictly in browser RAM for Haversine distance calculations and are **never** persisted to server logs, databases, or tracking telemetry.
- **Approximation Disclaimers:** Straight-line distances to designated relief shelters are explicitly marked as approximations; SafeRoute never claims an unmonitored flooded road is safe to cross.

---

## 🚀 Key Modules & Capabilities

### 1. 🌐 Real-Time Multi-Hazard Crisis Dashboard (`/`)
- Aggregates live advisories across cyclones, storm surges, extreme rain, and urban waterlogging.
- Displays issuing department provenance (IMD, TNSDMA, GCC), severity badges, and actionable instructions.
- Includes continuous upstream feed health monitoring with automatic degraded state fallback.

### 2. 🗺️ Interactive Conditions & Geospatial Shelter Map (`/map`)
- Built with custom Leaflet layers displaying live hazard danger zones (pulsating red/amber zones) and verified government relief shelters (emerald shield pins).
- **"Use My Location"** one-click GPS positioning centers the map and sorts shelters by straight-line proximity.
- Interactive popups display shelter capacity, 24/7 contact phone numbers, and operational status.

### 3. 🛣️ Route & Travel Corridor Check with 1-Click Re-Routing (`/routes`)
- Calculates transit safety vectors between regional tourist hubs (e.g., Chennai ⇄ Mahabalipuram, Chennai ⇄ Pondicherry).
- **Embedded Corridor Map:** Renders the route corridor polyline, a 20 km geographic safety buffer zone, and intersecting active hazard warnings.
- **"Re-route to Live Map":** Instantly redirects the user to the full interactive crisis map centered on affected transit regions.
- **Offline Route Saving:** Lets travellers save evaluated corridors to browser `localStorage` for offline access during network blackouts.

### 4. 🔍 WhatsApp & Social Media Rumor Verification Engine (`/verify`)
- Counteracts viral misinformation during disaster scenarios.
- Performs multi-token linguistic cross-matching against official government bulletins.
- Delivers instant verdict badges: **"OFFICIAL MATCH"** with source provenance or **"UNVERIFIED / RUMOR"** with corrective context.

### 5. 🗣️ Offline Multilingual Emergency Phrasebook (`/phrasebook`)
- Essential crisis phrases categorized by *Medical & First Aid*, *Shelter & Evacuation*, *Transit & Movement*, and *Food & Water*.
- Full translations in **English**, **தமிழ் (Tamil)**, and **हिन्दी (Hindi)**.
- **Web Speech API Audio Pronunciation:** Plays synthesized local speech for on-the-ground communication with rescue workers.
- **1-Tap Clipboard Copy:** Quick-copy local script for messaging and SMS.

### 6. 💾 Saved Offline Resources (`/saved`)
- Persists pinned emergency shelters, evaluated route corridors, and critical advisories in browser local storage.
- Operates reliably even during cellular network congestion or complete mobile data loss.

### 7. ⚡ High-Contrast SOS Quick Mode
- Accessible via the **Quick Mode** button in the header.
- Designed for low-battery, low-bandwidth, high-stress disaster conditions.
- Strips heavy graphics to present high-contrast, one-tap emergency helpline dialers (**112**, **1070**, **1913**, **108**) and immediate shelter details.

### 8. 🔒 Role-Based Operations Portal & Editor Access (`/editor`)
- Multi-tier access control guarded by PostgreSQL Row-Level Security (RLS) policies:
  - **Citizen User (`user`):** Accesses verified visitor portal, personalized safety status, and crisis navigation.
  - **Crisis Editor (`editor`):** Authorized to register verified relief shelters and publish crisis bulletins.
  - **System Administrator (`admin`):** Full control over data source telemetry toggles, shelter registries, and immutable audit logs.
- **Google OAuth Single Sign-On:** Integrated via Supabase Auth with automatic user-to-role provisioning.
- **Shelter & Place Registration (`CreateSafeZoneModal`):** Complete registration interface with GPS coordinate capture.
- **Alert Broadcasting (`CreateAlertModal`):** Geocoded alert publisher with latitude and longitude plotting.

---

## 🛠️ Architecture & Technology Stack

SafeRoute features a resilient **dual-stack backend architecture**: a serverless cloud backend deployed on **Supabase Edge Functions** with **PostgreSQL**, alongside a lightweight local **FastAPI** backend for zero-cloud environments.

```
┌────────────────────────────────────────────────────────────────────────┐
│                        SafeRoute Web Client                            │
│           (React 19, TypeScript, Vite, Leaflet, Custom CSS)            │
└───────────────────┬────────────────────────────────┬───────────────────┘
                    │                                │
            (Cloud Production)                 (Local Fallback)
                    ▼                                ▼
┌──────────────────────────────────────┐  ┌──────────────────────────────┐
│       Supabase Edge Functions        │  │       FastAPI Backend        │
│          (Deno, TypeScript)          │  │        (Python 3.14)         │
│  - REST API Routing & Handlers       │  │  - SQLAlchemy, Pydantic v2   │
│  - JWT & HMAC Auth Gateways          │  │  - SQLite (WAL Mode)         │
│  - Multi-source Ingestion Engine     │  │  - Haversine Distance Engine │
└───────────────────┬──────────────────┘  └──────────────────────────────┘
                    ▼
┌──────────────────────────────────────┐
│         Supabase PostgreSQL          │
│   - Row Level Security (RLS)         │
│   - Users, Alerts, Safe Zones        │
│   - Sources, Translations, Audits    │
└──────────────────────────────────────┘
```

| Layer | Technologies |
|---|---|
| **Frontend Framework** | React 19, TypeScript 5.9, Vite 8, React DOM |
| **Geospatial & Mapping** | Leaflet 1.9, OpenStreetMap Tiles, Haversine Spherical Distance Engine |
| **Styling & UI** | Custom CSS Design System, Responsive Glassmorphism, Outfit & Inter Typography |
| **Cloud Backend** | Supabase Edge Functions (Deno / TypeScript), RESTful API Architecture |
| **Cloud Database** | PostgreSQL 15 on Supabase with Row Level Security (RLS) on all 8 tables |
| **Authentication** | Supabase Auth (Google OAuth 2.0 Web Client) + HMAC SHA-256 Bearer Tokens |
| **Local Backend** | Python 3.14, FastAPI, SQLAlchemy (WAL Mode), Pydantic v2, SQLite |
| **Hosting & Deployment** | Vercel (Frontend CI/CD & Production Build), Supabase Cloud |
| **Testing** | Node.js Test Runner (18 tests), Pytest (12 tests) |

---

## 🔐 Role-Based Access Control (RBAC) Matrix

| Capability | Citizen User (`user`) | Crisis Editor (`editor`) | System Administrator (`admin`) |
|---|:---:|:---:|:---:|
| View Public Alerts, Shelters & Routes | ✅ | ✅ | ✅ |
| Access Emergency Phrasebook & Quick Mode | ✅ | ✅ | ✅ |
| Verify Rumors Against Bulletins | ✅ | ✅ | ✅ |
| Access Operations Portal (`/editor`) | ✅ (Citizen Portal) | ✅ (Operations Panel) | ✅ (Full Admin Control) |
| Register New Safe Shelters / Places | ❌ | ✅ | ✅ |
| Broadcast New Crisis Alerts | ❌ | ✅ | ✅ |
| Toggle Upstream Data Sources (Simulation) | ❌ | ❌ | ✅ |
| View Immutable System Audit Logs | ❌ | ❌ | ✅ |

### Pre-configured Test Accounts:
- **System Administrator:** `admin` / `admin123`
- **Crisis Editor:** `editor` / `editor123`
- **Standard User:** `user` / `user123`
- **Google OAuth Sign-In:** Direct sign-in using the *"Continue with Google"* button.

---

## 🏛️ Authoritative Data Provenance

All crisis alerts and bulletins displayed in SafeRoute originate from authoritative Indian disaster management bodies:

1. **India Meteorological Department (IMD):** Regional Specialised Meteorological Centre (RSMC) Chennai bulletin feeds.
2. **Tamil Nadu State Disaster Management Authority (TNSDMA):** State Emergency Operations Centre (SEOC) directives and color-coded advisories.
3. **Greater Chennai Corporation (GCC):** 24x7 Flood Control Room & Ripon Building designated relief shelter registry.

---

## 🧪 Automated Testing Suite

SafeRoute enforces rigorous automated testing across both edge and backend runtimes:

### 1. Edge Functions Test Suite (Node.js)
```bash
node tests/test_edge_functions.mjs
```
```
✔ Password hashing and verification matches SafeRoute specification
✔ HMAC-SHA256 Token matches Python backend token contract
✔ Haversine distance calculation and sorting
✔ Ingestion freshness correctly computes staleness based on hours and source health
✔ Multilingual translation dictionary produces expected localized titles
✔ buildApiUrl normalizes endpoints for both Supabase Edge Functions and FastAPI
✔ Strict token decoder rejects expired tokens, missing claims, and tampered signatures
✔ Password policy enforces minimum 8 characters and prevents empty rotations
✔ getSecretKey rejects missing or empty SECRET_KEY
✔ getSecretKey rejects SECRET_KEY shorter than 32 characters
✔ getSecretKey works with valid SECRET_KEY of at least 32 characters
✔ Token creation and verification use same secret; different secret is rejected
✔ resolveBaseUrl correctly handles explicit env vars, production fallback, and local dev fallback
✔ Dashboard status logic decouples bulletin staleness from source health
✔ Google OAuth tokens are verified via Supabase Auth and isolated from administrative privileges
✔ Route corridor calculation evaluates distance and intersects active hazard buffers
✔ Message verification correctly identifies official matches, partial matches, and rejects unverified rumors
✔ Multilingual emergency phrasebook contains all required categories and distinct translations

Tests: 18 passed, 0 failed, 100% success rate
```

### 2. Python Backend Test Suite (Pytest)
```bash
cd backend
pytest tests/
```
```
12 passed in 0.26s (100% success rate)
```

### 3. Frontend Production Build & TypeScript Verification
```bash
cd frontend
npm run build
```
```
✓ 90 modules transformed.
dist/index.html                   1.25 kB
dist/assets/index.css            98.09 kB
dist/assets/index.js            776.79 kB
✓ built in 462ms (0 TypeScript errors)
```

---

## ⚡ Quick Start & Local Run Guide

### Prerequisites
- Node.js 18+ and npm
- Python 3.10+ (optional, for local FastAPI backend)

### Method 1: Frontend against Production Cloud (Recommended)
```bash
cd frontend
npm install
npm run dev
```
Open [http://localhost:5173](http://localhost:5173). The frontend connects seamlessly to the live Supabase Cloud Edge Functions.

### Method 2: One-Click Local Full-Stack (Windows)
Double-click `run_dev.bat` in the project root to spin up both the FastAPI backend and Vite frontend dev server in separate terminal windows.

### Method 3: Manual Terminal Startup
```bash
# Terminal 1: Backend
cd backend
python -m pip install -r requirements.txt
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload

# Terminal 2: Frontend
cd frontend
npm install
npm run dev -- --host 127.0.0.1 --port 5173
```

---

## 📡 REST & Edge Functions API Reference

| Method | Endpoint | Access Level | Description |
|---|---|:---:|---|
| `GET` | `/api/health` | Public | System readiness & health check |
| `GET` | `/api/status` | Public | Upstream source telemetry, sync timestamps & degraded flags |
| `GET` | `/api/areas` | Public | Supported geographic sectors (Chennai, Kancheepuram, Nilgiris) |
| `GET` | `/api/alerts` | Public | Active crisis bulletins filtered by area, severity, and hazard |
| `GET` | `/api/alerts/:id` | Public | Detailed alert with source provenance & staleness metrics |
| `GET` | `/api/safe-zones` | Public | Designated relief shelters with lat/lng coordinates and capacity |
| `GET` | `/api/emergency-contacts` | Public | Jurisdiction helpline directory (112, 1070, 1913, 108) |
| `GET` | `/api/translations/:id` | Public | Dual-language side-by-side translation payloads (EN, TA, HI, FR) |
| `POST` | `/api/auth/login` | Public | Authenticate `admin`, `editor`, or `user` accounts |
| `GET` | `/api/auth/me` | Authenticated | Validate session and retrieve authenticated role permissions |
| `POST` | `/api/admin/alerts` | Editor / Admin | Publish new crisis notice with geocoded coordinates |
| `POST` | `/api/admin/safe-zones` | Editor / Admin | Register new verified relief shelter with coordinates & capacity |
| `POST` | `/api/admin/sources/:id/toggle-status` | Admin Only | Toggle upstream data source active status for disaster simulation |
| `GET` | `/api/admin/audit-logs` | Admin Only | Retrieve immutable server audit log trail |

---

## 👥 Hackathon Team Credits

Built with ❤️ by **Team Bits & Bytes** for the **IIITDM Kancheepuram 24-Hour Web Development Hackathon (October 2026)**.

- **Lead Developer & System Architect:** Rohith Karthik ([@rohithkarthik25-code](https://github.com/rohithkarthik25-code))
- **Official Repository:** [https://github.com/rohithkarthik25-code/Secure-Route.git](https://github.com/rohithkarthik25-code/Secure-Route.git)
- **Demo Video:** [Google Drive Demo Folder](https://drive.google.com/drive/folders/1eZV0XeShkFdx9qnvbQTdoYXOF3zmAeMg?usp=drive_link)
