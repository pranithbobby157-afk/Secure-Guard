# SafeRoute 🛡️
### Real-Time Crisis Communication for Tourists During Extreme Weather Events

**Target Hackathon:** IIITDM Kancheepuram 24-Hour Web Development Hackathon  
**Domain:** TravelTech  
**Team / Project:** Bits & Bytes — SafeRoute  

---

## 📌 Problem Statement & Context

When localized extreme weather events occur — such as severe cyclones, intense monsoonal cloudbursts, and flash flooding in coastal Tamil Nadu (Chennai, Kancheepuram, and Nilgiris) — foreign and visiting tourists are acutely vulnerable:
- **Language Barriers:** Emergency broadcasts and disaster management notices issued in local languages (e.g. Tamil) are unintelligible to international and non-local travellers.
- **Geographic Unfamiliarity:** Tourists cannot interpret local administrative boundaries, low-lying flood-prone roads (e.g., Velachery, Madipakkam, ECR), or identify verified designated emergency shelters.
- **Information Fragmentation:** Critical advisories are scattered across disparate portals, leading tourists to rely on chaotic social media rumours or wander into inundated danger zones.

---

## 💡 The SafeRoute Solution

**SafeRoute** is an authoritative, multilingual crisis communication and shelter navigation web platform designed specifically for travellers caught in extreme weather disasters.

### Core Ethical & Safety Mandates:
1. **Never Invent Safety:** SafeRoute never declares an unmonitored location "safe" merely because no alert is listed.
2. **Preserve Original Texts:** Translations are displayed **side-by-side** with the authoritative government notice to preserve original proper nouns, dates, and instructions.
3. **No Login Friction:** Public tourists access all life-safety advisories with zero registration or credentials required.
4. **Resilient Degraded States:** If an upstream weather API goes down, SafeRoute explicitly shows an amber warning with the last cached timestamp rather than misleading users with "0 alerts".
5. **No Dangerous Pathfinding:** Straight-line distances to designated shelters are marked as approximations; SafeRoute never claims an unverified flooded road is safe to cross.

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 19, TypeScript, Vite, Leaflet, Lucide Icons, Custom CSS Design System |
| **Backend** | Python 3.14, FastAPI, SQLAlchemy (WAL mode), Pydantic v2 |
| **Data Store** | SQLite (zero-config, high-performance local & server deployment) |
| **Geospatial** | Leaflet OpenStreetMap tiles, Haversine spherical distance engine |
| **Testing** | Pytest test suite, FastAPI TestClient |
| **Authentication** | HMAC tamper-evident token system, role-based authorization |

---

## 🚀 Key Features

- **🌐 Multilingual Crisis Engine:** Dynamic side-by-side translation into **English**, **தமிழ் (Tamil)**, **हिन्दी (Hindi)**, and **Français (French)** with source text hashing and linguistic caching.
- **🗺️ Interactive Geospatial Map:** Custom Leaflet layers displaying hazard zones (red/amber circles), verified relief shelters (emerald shield markers), and user position beacon with accessible list alternative.
- **📍 Location-Aware Shelter Locator:** Computes approximate straight-line distance to nearby relief hubs using browser geolocation (retained solely in memory for privacy).
- **🚨 Scenario Simulation Switcher:** Built-in presenter control bar allowing judges to switch between:
  1. *Cyclone Red Alert* (active crisis)
  2. *All Clear* (disclaimers & vigilance)
  3. *Source Outage* (stale data & degraded feed resilience)
- **🔒 Authenticated Editor Portal:** Role-guarded administrative portal to curate simulated advisories, monitor feed health, and review immutable audit logs.
- **📞 Regional Emergency Helplines:** One-click directory of verified emergency numbers for the jurisdiction (**112**, **1070**, **1913**, **108**, **1077**).

---

## ⚡ Quick Start & Run Instructions

### Prerequisites
- Python 3.10+
- Node.js 18+ and npm

### Method 1: One-Click Runner (Windows)
Double-click `run_dev.bat` in the root directory. It will start both the backend API and frontend dev server simultaneously in separate windows.

### Method 2: Manual Terminal Startup

#### 1. Backend Setup
```bash
cd backend
python -m pip install -r requirements.txt
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```
Backend runs at: `http://127.0.0.1:8000`  
Interactive API Docs (Swagger): `http://127.0.0.1:8000/docs`

#### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev -- --host 127.0.0.1 --port 5173
```
Frontend runs at: `http://127.0.0.1:5173`

---

## 🧪 Running Automated Tests

SafeRoute includes a full backend test suite verifying alert schemas, staleness logic, Haversine distance calculations, translation caching, and admin authorization:

```bash
cd backend
python -m pytest -v tests/
```
All 8 test suites pass with 100% success.

---

## 📡 REST API Summary

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | Health check & readiness probe |
| `GET` | `/api/status` | System health, healthy source counts & last sync time |
| `GET` | `/api/areas` | List supported geographic sectors (Chennai, Kancheepuram, Nilgiris) |
| `GET` | `/api/alerts` | Query active alerts with area, hazard type, and severity filters |
| `GET` | `/api/alerts/{id}` | Alert details with source provenance and staleness metadata |
| `GET` | `/api/safe-zones` | Query relief centers with coordinates and user distance sorting |
| `GET` | `/api/emergency-contacts` | Jurisdiction disaster helpline numbers (112, 1070, 1913) |
| `GET` | `/api/translations/{id}` | Retrieve or generate translation for target language code |
| `POST` | `/api/auth/login` | Authenticate editor/admin user |
| `POST` | `/api/admin/alerts` | Publish curated or simulated crisis notice (Editor only) |
| `POST` | `/api/admin/sources/{id}/toggle-status` | Simulate feed downtime for test demonstrations |
| `GET` | `/api/admin/audit-logs` | Retrieve chronological server audit log trail |
| `POST` | `/api/demo/scenario` | Presenter scenario switcher for judging demo |

---

## 🏛️ Authoritative Data Provenance

1. **India Meteorological Department (IMD):** Regional Specialised Meteorological Centre (RSMC) Chennai bulletin feeds.
2. **Tamil Nadu State Disaster Management Authority (TNSDMA):** State Emergency Operations Centre (SEOC) directives.
3. **Greater Chennai Corporation (GCC):** 24x7 Flood Control Room & Ripon Building relief shelter registry.

---

## 🔒 Privacy & Security

- **Zero Location Logging:** User coordinates are processed in browser RAM and are never persisted to database tables, logs, or analytics.
- **Role-Based Server Guards:** Public endpoints are read-only. Mutation endpoints verify JWT/HMAC bearer tokens.
- **Audit Logging:** Every administrative action is recorded with actor ID, timestamp, and payload changes.

---

## 🎬 Demo Video Guide
A 3-minute video script formatted for hackathon evaluation is available at:  
👉 [`docs/demo_script.md`](file:///c:/Users/bf772/OneDrive/Desktop/NEW_HACKATHON/docs/demo_script.md)

---

## 👥 Hackathon Credits
Built with ❤️ by team **Bits & Bytes** for the **IIITDM Kancheepuram 24-Hour Web Development Hackathon (October 2026)**.

# Secure-Guard

