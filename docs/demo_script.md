# SafeRoute — 3-Minute Demo Video Script
## IIITDM Kancheepuram 24-Hour Web Development Hackathon
**Track:** TravelTech (Real-Time Crisis Communication for Tourists During Extreme Weather Events)

---

### [0:00 – 0:30] Introduction & Problem Statement
- **Visual:** Open SafeRoute dashboard on `http://127.0.0.1:5173`.
- **Narration:**
  > "Hello judges! When severe cyclones and flash floods strike coastal regions like Chennai or Kancheepuram, tourists and visitors face three critical vulnerabilities:
  > 1. Language barriers — emergency warnings are issued in Tamil or regional scripts that foreign and inter-state visitors cannot read.
  > 2. Geographic unfamiliarity — tourists don't know low-lying areas or where official shelters are located.
  > 3. Fragmented information and unverified rumours.
  >
  > Welcome to **SafeRoute** — an authoritative, multilingual crisis communication and shelter navigation aid built for foreign and visiting travellers during extreme weather emergencies."

---

### [0:30 – 1:15] The Public Tourist Experience & Dual-Language Engine
- **Visual:**
  - Point to the sticky Header with Area dropdown (`Chennai Coastal District`).
  - Point to the active **Emergency Banner** showing the Cyclone Red Alert issued by the India Meteorological Department.
  - Switch the language dropdown from **English** to **தமிழ் (Tamil)**, then to **हिन्दी (Hindi)**.
- **Narration:**
  > "Notice our core safety principle: SafeRoute requires **no login** for tourists. 
  > Here, tourists immediately see active bulletins with issuing authority, timestamp, and verification status.
  > 
  > Most importantly, observe our **Linguistic Preservation Engine**: When we change the language to Tamil or Hindi, SafeRoute does not blindly replace the government notice. It displays the **authoritative original notice side-by-side with the translated version**, ensuring critical names, numbers, and dates remain verifiable."

---

### [1:15 – 1:55] Location-Aware Safe Zone Locator & Interactive Map
- **Visual:**
  - Click **'Use My Location'** — show approximate location dot.
  - Hover over the designated relief shelters on the map (Santhome Relief Centre, Ripon Disaster Hub, Velachery Higher Secondary School).
  - Open the shelter card to display address, capacity, and calculated straight-line distance.
- **Narration:**
  > "Clicking 'Use My Location' calculates approximate distance to verified relief shelters in real time using the Haversine formula.
  > 
  > In accordance with our safety mandate, coordinates remain strictly in browser memory for privacy, and SafeRoute clearly informs travellers that straight-line distances are approximations and never claims an unverified road is safe to cross."

---

### [1:55 – 2:30] Degraded Feed Handling & Stale Data Transparency
- **Visual:**
  - Click **'3. Source Outage (Stale State)'** in the Hackathon Demo Scenarios bar.
  - Point to the prominent amber warning banner that appears at the top.
- **Narration:**
  > "A fatal flaw in many crisis apps is silently showing '0 alerts' when an external weather API goes down, misleading users into thinking they are safe.
  > 
  > SafeRoute handles this with resilient state monitoring. When the upstream IMD feed is degraded, SafeRoute prominently displays an amber alert: *'External weather feed degraded. Presenting official bulletin cached at [Timestamp]'*. We never falsely claim conditions are safe."

---

### [2:30 – 3:00] Editor Portal & Audit Logging
- **Visual:**
  - Click **'Editor'** in the top-right corner.
  - Sign in with authorized administrator credentials.
  - Show the **Source Feeds** health monitor and the **Audit Trail** displaying timestamped server logs.
  - Click **'Helplines (112)'** button in the header showing direct emergency contacts (112, 1070, 1913, 108).
- **Narration:**
  > "Authorized emergency personnel can log into the Editor Portal to publish clearly labelled simulated notices, trigger upstream syncs, and monitor source health — with every single action recorded in immutable server audit logs.
  > 
  > SafeRoute brings together authoritative information, linguistic clarity, shelter provenance, and transparent reliability when travellers need it most. Thank you!"

---

### Quick Demo Checklist Before Recording:
- [ ] Backend running (`http://127.0.0.1:8000`)
- [ ] Frontend running (`http://127.0.0.1:5173`)
- [ ] Browser zoom set to 100% or 110%
- [ ] Record using OBS or screen recorder (1080p, 60fps)
- [ ] Export MP4 and place inside repository or link in README
