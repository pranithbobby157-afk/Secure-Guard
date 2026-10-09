# SafeRoute — End-to-End Implementation Plan
## Real-Time Crisis Communication for Tourists During Extreme Weather Events

**Project type:** 24-hour web-development hackathon MVP, designed to grow into a more robust product  
**Primary users:** Tourists, local visitors, emergency-information editors, and administrators  
**Core objective:** Bring trustworthy emergency information together, explain it in the traveller’s preferred language, and help them find authoritative guidance and designated safe locations.

> **Safety principle:** SafeRoute is an information and communication aid, not an emergency authority. It must never invent warnings, declare a location safe because no alert is shown, or present an unverified route as safe. Preserve the original official notice, clearly label its source and freshness, and direct users to local emergency services and authorities for urgent decisions.

---

## 1. Product scope and success criteria

### 1.1 Problem to solve

During floods, cyclones, severe rainfall, and other extreme-weather events, tourists may not understand local announcements, know the geography, or know which online reports to trust. Warnings, road closures, shelter information, and instructions may be spread across different channels and languages.

SafeRoute should help a traveller answer these questions quickly:

1. What official alerts affect my selected area or current location?
2. Who issued each alert, and when was it last updated?
3. Which places or roads are explicitly identified as affected?
4. Where are the designated shelters or official assistance points?
5. What does the original instruction say in my preferred language?
6. What should I do to access authoritative guidance or contact emergency services?
7. If connectivity is weak, what previously saved information can I still read—and how old is it?

### 1.2 MVP goals

The first version should include:

- A responsive dashboard.
- Emergency-alert collection and normalization.
- Alert source, publication time, last-checked time, and verification status.
- Area selection and optional browser geolocation.
- Map with alert markers and designated safe-zone markers.
- Search/filter for alerts and safe zones.
- Multilingual presentation of official notices.
- Clear stale-data and unavailable-data states.
- Emergency guidance and official contact information, configured for the target location.
- A simple admin/editor workflow for curated notices and simulated demo scenarios.
- A working backend, persistent data store, tests, deployment, README, and demo video.

### 1.3 Features to postpone until after the MVP

Do not make these prerequisites for a working demo:

- Automatically routing people through live hazard zones.
- Predicting floods or cyclone paths.
- AI-generated safety recommendations.
- Unverified crowdsourced reports shown as facts.
- Push notifications across every browser/device.
- Hospital, police, or municipal system integrations without permission.
- A native mobile app.
- Sophisticated offline maps.

These features introduce reliability, data-access, privacy, or scope risks. Add them only after the core information workflow is reliable.

### 1.4 Definition of done

The MVP is ready when a user can:

1. Open the public application without creating an account.
2. Select a demo/target area or grant optional location permission.
3. See alerts with source and freshness information.
4. Filter alerts and view their details.
5. open a map and distinguish alert locations from designated shelters.
6. Choose a language and read a translation beside the original notice.
7. See an explicit “information unavailable” or “last updated” state when data cannot be retrieved.
8. Open the official source or emergency-contact information.
9. Use the interface on a phone-sized screen.
10. Complete the main journey using the deployed public link.

An administrator/editor should also be able to add or update a clearly labelled simulated notice and shelter record for the demo, with server-side validation and an audit entry.

---

## 2. User roles and permissions

### 2.1 Tourist / public user

No account should be required to read public alerts. This reduces friction during an emergency.

Can:
- View alerts and details.
- Select an area.
- Optionally share browser location.
- Search and filter.
- View designated safe zones.
- Change language.
- Save selected information locally, if implemented.
- Open official source links and configured emergency contacts.

Cannot:
- Change official alert records.
- Mark an alert as verified.
- Create or edit designated shelters.
- Access administrator tools.

### 2.2 Information editor

Can:
- Sign in to the restricted editor interface.
- Create a clearly labelled local/demo notice when authorised.
- Update or expire a curated notice.
- Add a source URL and supporting details.
- Add a shelter record only if authorised and supported by a reliable source.
- Mark a record’s verification state according to the project’s editorial policy.

Cannot:
- Give themselves administrator privileges.
- alter audit history.
- publish a record without required fields and server-side validation.

### 2.3 Administrator

Can:
- Manage editor accounts and roles.
- Configure approved sources, locations, and emergency contacts.
- Review audit logs.
- Disable or correct an erroneous record.
- View data-source health and ingestion errors.

### 2.4 Enforce roles on the server

Hiding buttons in the frontend is not access control. Every restricted API endpoint must verify the authenticated user and their role on the server. Public users must not be able to modify data by calling an endpoint directly.

---

## 3. Recommended architecture

For a 24-hour hackathon, keep the architecture simple: one web frontend, one backend API, one database, and a small background refresh process if time permits.

```text
                         ┌─────────────────────────┐
                         │ Official data sources   │
                         │ Weather / authority     │
                         │ advisories / open data  │
                         └────────────┬────────────┘
                                      │
                           Scheduled/manual ingestion
                                      │
                         ┌────────────▼────────────┐
                         │ Backend ingestion layer │
                         │ Validate, normalize,    │
                         │ deduplicate, timestamp  │
                         └────────────┬────────────┘
                                      │
┌──────────────────┐       ┌─────────▼────────────┐
│ React frontend   │◄─────►│ Backend REST API     │
│ Dashboard, map,  │ HTTPS │ Auth, filtering,      │
│ detail, language │       │ permissions, logging  │
└─────────┬────────┘       └─────────┬────────────┘
          │                          │
          │ Browser geolocation      │
          │ (optional, consented)    │
          │                ┌─────────▼────────────┐
          │                │ Database             │
          │                │ Alerts, sources,     │
          │                │ areas, shelters,     │
          │                │ translations, audit  │
          │                └──────────────────────┘
          │
          └── Map tiles / geocoding / translation provider
              through approved client or backend integration
```

### 3.1 Suggested technology stack

Choose the stack the team already knows. One practical option:

- **Frontend:** React + TypeScript + Vite.
- **Styling:** Tailwind CSS or plain CSS with reusable components.
- **Backend:** Python + Flask (FastAPI is also reasonable).
- **Database:** PostgreSQL; SQLite is acceptable for a tightly scoped local prototype, but use a deployment-compatible persistent database for the final demo.
- **Maps:** Leaflet with an appropriate tile provider.
- **Validation:** Pydantic (FastAPI) or Marshmallow/manual schemas (Flask).
- **Authentication:** Secure session-based auth or a reputable managed authentication service.
- **Testing:** Pytest for backend, and a small set of frontend/component or end-to-end checks.
- **Deployment:** Any reliable host that supports the frontend, API, and persistent database.
- **Version control:** GitHub.

Do not introduce microservices, a message queue, Kubernetes, or multiple databases for a one-day MVP.

### 3.2 Logical backend modules

Organize code by responsibility:

- `alerts`: alert list, detail, filters, status, and freshness.
- `sources`: source registry and source metadata.
- `ingestion`: external fetch, parsing, validation, deduplication, and refresh status.
- `locations`: areas and optional location matching.
- `safe_zones`: designated shelters/assistance points and provenance.
- `translations`: translation cache and original-language preservation.
- `guidance`: approved general guidance and location-specific official contacts.
- `auth`: login, logout, role checks, and session handling.
- `admin`: editor workflows and configuration.
- `audit`: record changes and administrator actions.
- `health`: readiness, liveness, and data-source status.

---

## 4. Begin with the dashboard and user journey

The dashboard is the first screen and must communicate the current information state immediately. It should not overwhelm tourists with charts or technical terminology.

### 4.1 Dashboard layout

**A. Header**
- SafeRoute logo/name.
- Current selected area.
- Language selector.
- Location button (“Use my location”).
- “Data last checked” indicator.
- Accessible menu for help/about.

**B. Emergency status banner**
- Show the most relevant active official alert, if one exists.
- Display severity exactly as supplied or mapped using documented rules.
- Include issuer, issued time, expiry if supplied, and source link.
- If no alert is returned, say “No active alerts were returned by the connected sources as of [time]. This does not guarantee conditions are safe.”
- If the source is down, say “Unable to refresh alerts; showing information last retrieved at [time]” or show no data if there is no cached data.

**C. Alert summary cards**
- Active alerts.
- Alerts affecting the selected area.
- Official road/area notices, if supported by available data.
- Data-source freshness.
Do not show numerical counts unless they are computed from actual stored records.

**D. Map preview**
- Map with a legend.
- Distinct marker styles for alert locations and designated safe zones.
- A list alternative for users who cannot use the map.
- Clicking a marker opens a short summary and a link to the full detail.

**E. “What should I know?” alert list**
Each card should contain:
- Title.
- Severity.
- Affected area.
- Issuing authority/source.
- Issued/updated time.
- Freshness badge.
- Original-language availability and translated-language availability.
- “View details” action.

**F. Safe-zone panel**
- Nearby designated shelters/assistance points when reliable records exist.
- Distance only when user location and safe-zone coordinates are available.
- Hours/capacity only if sourced; otherwise do not invent them.
- Source and last verification time.
- A visible note that the listing does not guarantee the facility is open or reachable.

**G. Emergency help panel**
- Official emergency contact numbers for the configured jurisdiction.
- Official authority websites or hotline links.
- Clear “If you are in immediate danger, contact local emergency services” wording.
- Never assume one country’s emergency number is valid everywhere.

**H. Footer**
- Data sources.
- Last refresh time.
- Privacy note.
- Accessibility/help.
- Clear notice that SafeRoute is not an emergency authority.

### 4.2 Dashboard states to design

Build the following states intentionally:

1. **Loading:** skeletons or a simple loading message.
2. **Data available:** alerts and timestamps appear.
3. **No active alert returned:** explain the limited meaning of this result.
4. **Source failure:** show cached data and its age, if available.
5. **No cached data:** state that current information could not be loaded.
6. **Location denied:** continue with manual area selection.
7. **Location unavailable:** allow search/manual selection.
8. **No shelters in data:** say no designated safe-zone records are available for this area; do not imply none exist in reality.
9. **Translation unavailable:** show the original notice and an error/availability message.
10. **Offline:** show only cached data and its timestamp, where supported.

---

## 5. Component 1 — Emergency information collection

This component gathers information from approved sources and converts it into a consistent format.

### 5.1 Identify the target geography first

Before selecting APIs, decide which region the hackathon demo covers (for example, one city or coastal district). Do not try to cover the whole world in the MVP.

Record:
- Country/region.
- Supported languages.
- Official weather agency.
- Disaster-management/emergency authority.
- Official road-closure or evacuation information sources, if available.
- Reliable shelter data source, if available.
- Correct emergency contact information.

**Important:** The project statement does not specify actual APIs or data providers. The team must verify availability, licensing, geographic coverage, update frequency, terms of use, and whether each provider offers alerts rather than only forecasts.

### 5.2 Classify source types

Maintain a source registry with:
- Source name.
- Source category (weather, government advisory, road closure, shelter).
- Official website or API endpoint.
- Geographic coverage.
- Supported format.
- Expected refresh interval.
- Last successful retrieval.
- Current health status.
- Attribution requirements.
- Whether it is authoritative, supplementary, or user-submitted.

Use authoritative sources for emergency warnings. A general weather forecast API is not automatically a source for official evacuation orders or road closures.

### 5.3 Build a normalized alert model

External providers use different field names and formats. Convert each source record into a shared schema.

Suggested alert fields:
- `id`: internal unique identifier.
- `source_id`: source registry reference.
- `external_id`: source’s alert ID, when present.
- `title`: short alert title.
- `description_original`: original notice text.
- `instruction_original`: original instruction text, if supplied.
- `language_original`: language code.
- `hazard_type`: flood, cyclone, heavy rain, storm, heat, or other source-supported type.
- `severity`: source severity plus normalized display category, if safely mappable.
- `status`: active, expired, cancelled, or unknown.
- `issued_at`: source publication time.
- `effective_at`: start time, if provided.
- `expires_at`: expiry time, if provided.
- `retrieved_at`: when SafeRoute fetched it.
- `source_updated_at`: source’s own update time, if provided.
- `area_name`: human-readable affected area.
- `geometry`: point or polygon if supplied and supported.
- `source_url`: link to the original source.
- `verification_status`: official-source, editor-verified, unverified, or simulated.
- `raw_payload_reference`: optional safe reference to source response for debugging; avoid retaining unnecessary personal data.

Do not guess severity or affected geography when a source does not provide enough information. Use “unknown” or omit the field with an explanation.

### 5.4 Ingestion workflow

For each source:

1. Fetch data over HTTPS.
2. Set a timeout and handle connection errors.
3. Check response status and content type.
4. Parse the response.
5. Validate required fields.
6. Convert times to a consistent timezone-aware format (store UTC; display local time with the timezone).
7. Normalize the source’s hazard and severity categories only using documented mapping rules.
8. Validate coordinates and geographic geometry.
9. Generate a stable identity using source ID + external alert ID, or a documented fallback.
10. Upsert the alert so repeat refreshes do not create duplicates.
11. Record retrieval time and source health.
12. Preserve original source text and source URL.
13. Mark expired/cancelled notices according to source status and timestamps.
14. Record errors without exposing API keys or sensitive response details to the public.
15. Return the last successful refresh time to the frontend.

### 5.5 Deduplication

The same notice may be returned on repeated fetches. Use a stable key such as `(source_id, external_id)` where available.

If no external ID exists, a cautious fallback may use a normalized title, source, affected area, and issued time. Do not merge alerts merely because they have similar wording; two nearby areas may have separate notices.

### 5.6 Refresh strategy

For the MVP:
- Provide a manual refresh action with rate limiting.
- Refresh approved sources at a reasonable interval that respects provider guidance.
- Cache successful results.
- Avoid repeated API calls every time a visitor opens the dashboard.
- Display both source publication/update time and SafeRoute retrieval time.
- Do not keep retrying aggressively when a source is unavailable.

If a background scheduler is too much for the hackathon, a protected admin refresh button or a scheduled host job is sufficient.

### 5.7 Handling failures and stale data

Each source should have a state:
- `healthy`
- `degraded`
- `unavailable`
- `never_succeeded`

On failure:
- Keep the last successful record only if the interface labels it as cached/stale.
- Never silently present old data as current.
- Show the last successful retrieval time.
- Do not infer that no alert exists because the API failed.
- Log the failure and allow a controlled retry.

### 5.8 Simulated demo data

If real emergency feeds are not accessible during the hackathon:
- Create clearly marked fictional alerts and a fictional map scenario.
- Use a visible “SIMULATION — NOT A LIVE WARNING” label.
- Do not mix simulated records with real official alerts without clear labels.
- Include realistic timestamps and status changes for testing, but do not imply the fictional event is happening.
- Explain in the README which data is live and which is simulated.

---

## 6. Component 2 — Location-aware risk information

This component helps users understand which records relate to the area they are in or intend to visit.

### 6.1 Location input options

Offer two equally usable paths:

1. **Use my location:** browser geolocation, only after the user chooses it.
2. **Choose an area manually:** search or select a city/district from a supported list.

Never require geolocation to use the application. A user may deny permission, have a device without GPS, or be using a shared computer.

### 6.2 Browser geolocation

When the user selects “Use my location”:

1. Explain why location is requested.
2. Request browser permission.
3. Handle permission denied, timeout, unavailable position, and success.
4. Use coordinates only for the necessary area filtering or distance calculation.
5. Avoid storing precise coordinates unless there is a clear need and explicit consent.
6. Provide a way to clear or change the selected location.
7. Do not put precise coordinates in analytics, application logs, or URLs.

For a hackathon MVP, keep the coordinates in browser memory and send them to the backend only if necessary. Prefer deriving a broad area in the browser or using a documented area-selection flow where possible.

### 6.3 Define “risk” carefully

Do not invent a single risk score without a validated methodology. Instead, show source-supported facts:
- Official alert severity.
- Whether the selected area is included in an alert’s affected geography.
- Officially reported closure or hazard records.
- Data freshness.
- Source and verification status.

If the project later introduces a combined risk indicator, document the inputs, rules, uncertainty, and limitations. It must not replace official instructions.

### 6.4 Map implementation

Map layers:
- **Alert points/areas:** official alert locations or polygons where supplied.
- **Reported hazard points/areas:** only when there is a reliable source and clear verification status.
- **Road closures:** only if suitable authoritative data exists.
- **Designated safe zones:** verified shelters or assistance points from approved sources.
- **User location:** only with permission; use a distinct marker.

Map requirements:
- Include a legend and visible labels.
- Use distinct icons/shapes, not color alone, for accessibility.
- Include zoom controls and marker popups.
- Ensure markers are keyboard-accessible where the map library permits.
- Provide a list/table alternative to the map.
- Show the source and update time for each feature.
- Do not draw fabricated flood boundaries.
- Do not label an area “safe” merely because no alert polygon covers it.

### 6.5 Area matching

If an alert has an official polygon, determine whether the selected point lies inside it using a tested geospatial function/library. If an alert only names a region, match it only to the supported administrative area and explain the coarser accuracy.

Do not pretend that a city-level warning provides street-level precision.

### 6.6 Distance to a designated shelter

If coordinates are available for both user and shelter:
- Calculate straight-line distance for display, clearly label it as approximate.
- Do not describe straight-line distance as walking distance or a safe route.
- Only show route directions if a routing provider is available and road hazards/closures can be accounted for appropriately.
- Otherwise link to official directions or show the location without claiming route safety.

### 6.7 Search and filters

Allow users to filter by:
- Selected area.
- Hazard type.
- Severity, if the source provides it.
- Active/expired status.
- Official versus simulated/unverified status.
- Recently updated records.

Use server-side filtering for larger data sets; client-side filtering is acceptable for a small, fixed demo dataset.

### 6.8 Location-aware alert logic

A basic rule:
1. Read the selected area or consented coordinates.
2. Fetch alerts with matching supported geography.
3. Rank current active alerts first, then by source-supported severity and update time.
4. Clearly distinguish exact polygon matches from broader area-name matches.
5. Show a reason such as “This official alert names your selected district.”
6. Never state “you are safe” based on an empty result.

---

## 7. Component 3 — Multilingual communication

Translation should improve access to the original information without changing its meaning.

### 7.1 Language selector

Place the language selector in the header and make it available from alert details.

For the MVP, support a small number of languages relevant to the target location and team’s ability to test them. For example, English and Tamil may be useful for a Tamil Nadu demonstration, with another language added only if the workflow remains reliable.

### 7.2 Preserve the original

Every translated notice should retain:
- Original text.
- Original language.
- Translated text.
- Target language.
- Translation provider/method.
- Translation timestamp.
- A label that it is a translation.
- A way to view the original source notice.

Never replace the original official message with translated text.

### 7.3 Translation workflow

1. Fetch and validate the original notice.
2. Identify the original language if the source provides it; avoid relying solely on uncertain auto-detection.
3. Check the translation cache for the same alert revision and target language.
4. If no cached translation exists, call the selected translation service.
5. Set request timeouts and handle quota/errors.
6. Store the translated text and provider metadata.
7. Display original and translation together or allow a clear toggle.
8. Mark the translation as machine-generated if applicable.
9. Preserve critical names, locations, timestamps, and numbers carefully.
10. Provide a “translation unavailable” state that still shows the original.

### 7.4 Cache key

A translation cache key should include:
- Alert ID.
- A hash/version of the original text.
- Target language.
- Translation provider/model version if relevant.

If the source text changes, invalidate or regenerate the translation. Never reuse a translation for an older alert revision.

### 7.5 Simplifying instructions

A separate “Simplify this notice” feature can provide plain-language wording, but only after the translation workflow is reliable.

If using an LLM:
- Send only the required public notice text.
- Instruct the model not to add actions or facts.
- Require the output to preserve locations, time windows, and warnings.
- Keep the original visible.
- Label the simplification as AI-generated.
- Do not treat generated text as an authoritative source.
- Test with conflicting, incomplete, and ambiguous notices.
- If the model fails or adds unsupported details, show the original only.

For a 24-hour MVP, a deterministic summary template may be safer than a free-form AI assistant.

### 7.6 Accessibility and language quality

- Use a readable font and sufficient text size.
- Avoid text embedded in images.
- Support keyboard navigation.
- Make language changes easy to reverse.
- Test long translated text and mobile layouts.
- Preserve emergency terms and proper nouns.
- Ask a fluent speaker to review sample translations where possible.

---

## 8. Component 4 — Safe-zone and emergency guidance

This component presents designated shelters, assistance points, and official guidance. It must not imply that a facility is open or reachable unless that is supported by current data.

### 8.1 Safe-zone data model

Suggested fields:
- `id`
- `name`
- `type` (designated shelter, official assistance point, hospital, other approved category)
- `address`
- `latitude`
- `longitude`
- `area_id`
- `source_id`
- `source_url`
- `verification_status`
- `last_verified_at`
- `opening_status` (only if a reliable source provides it)
- `capacity` (only if a reliable source provides it)
- `accessibility_notes` (only if verified)
- `contact_information` (only if published and verified)
- `created_at`
- `updated_at`

Do not invent capacity, operating hours, accessibility features, or availability.

### 8.2 Safe-zone list and detail view

Each safe-zone card should show:
- Name and category.
- Address and map position.
- Source and verification status.
- Last verified time.
- Distance from user, if available.
- Opening status only when supported.
- A link to the official record or directions source.
- A clear note that conditions may change and the facility may not be reachable.

If the data has not been verified recently, show that explicitly.

### 8.3 Emergency guidance content

Use a small, reviewed set of general guidance cards, such as:
- Follow current instructions from local emergency authorities.
- Avoid areas officially reported as flooded or closed.
- Do not enter floodwater or cross a closed road.
- Keep your phone charged when possible.
- Share your location with a trusted person if safe to do so.
- Contact local emergency services if in immediate danger.

This is general guidance, not a substitute for local official instructions. Have the content reviewed for the selected region and link to relevant authorities.

### 8.4 Emergency contact directory

Maintain jurisdiction-specific entries:
- Service name.
- Contact number or official channel.
- Region in which it applies.
- Official source URL.
- Last verification date.

Do not hardcode one emergency number as universal. If the location is unknown, tell the user to consult local authorities or their official emergency directory rather than showing a potentially incorrect number.

### 8.5 Route guidance limits

For the MVP, show designated locations and source links. Do not claim to calculate a safe evacuation route unless:
- A suitable routing source is available.
- Current road closures and hazards are incorporated.
- The limitations are explained.
- The result does not conflict with official evacuation instructions.

A generic shortest-path API can route through a dangerous area. A route is not “safe” simply because it is the shortest.

---

## 9. Additional product components

### 9.1 Alert details page

When a user opens an alert, display:
- Title and hazard type.
- Original notice.
- Translation, if available.
- Issuing authority.
- Official source link.
- Affected area and map.
- Issue, effective, update, and expiry times where provided.
- Source freshness.
- Verification/simulation label.
- Related official instructions.
- Related designated safe zones only if the relationship is supported.
- A warning if the data is stale or unavailable.

### 9.2 Source transparency panel

A source detail panel should explain:
- Who issued the information.
- What type of information the source provides.
- When it was last fetched.
- Whether the last refresh succeeded.
- Whether a record is official, editor-verified, unverified, or simulated.
- Link to the original record.

This is central to the product’s trust model.

### 9.3 Notifications (optional)

Browser push notifications require permission, service-worker configuration, and additional testing. If included:
- Ask for permission only after explaining the benefit.
- Let users choose areas/hazard types.
- Do not repeatedly prompt after denial.
- Include source, location, and timestamp.
- Link to the full alert.
- Avoid sending duplicate notifications.
- Never send simulated alerts to users as if they were real.

For the hackathon, an in-app alert banner is enough if push delivery would threaten the core scope.

### 9.4 Offline/low-connectivity support (optional)

A simple progressive web app can cache:
- Application shell.
- Previously viewed official guidance.
- Previously viewed alerts.
- Saved emergency contacts.

Every cached record must show its retrieval time and a “may be outdated” label. Do not imply cached data is current. Do not cache sensitive location history.

### 9.5 Feedback and correction report (optional)

Allow a user to report:
- A broken source link.
- A possible duplicate alert.
- An incorrect translation.
- A safe-zone listing that appears outdated.

Keep public reports separate from verified data. Do not let a user-submitted report directly alter an official warning or mark a shelter safe. Route it to an editor for review.

### 9.6 Administration and monitoring

Provide an editor dashboard with:
- Source health.
- Last successful refresh per source.
- Number of active alerts.
- Failed ingestion jobs.
- Alerts awaiting review.
- Expiring or stale records.
- Recent audit entries.

The admin dashboard is for maintaining data quality, not a replacement for the public tourist dashboard.

---

## 10. Database design

A relational schema is suitable because alerts, sources, translations, areas, and safe zones have clear relationships.

### 10.1 Suggested tables

#### `users`
- `id`
- `email` or username
- `password_hash` or managed-auth identity
- `role`
- `created_at`
- `last_login_at`

Never store plaintext passwords. If using managed authentication, keep only the provider identity and necessary role/profile fields.

#### `sources`
- `id`
- `name`
- `category`
- `base_url`
- `geographic_coverage`
- `authority_level`
- `refresh_interval`
- `last_attempt_at`
- `last_success_at`
- `health_status`
- `attribution_text`

#### `areas`
- `id`
- `name`
- `country_code`
- `region_code`
- `timezone`
- Optional official boundary geometry and provenance.

#### `alerts`
- `id`
- `source_id`
- `external_id`
- `title`
- `description_original`
- `instruction_original`
- `original_language`
- `hazard_type`
- `source_severity`
- `display_severity`
- `status`
- `issued_at`
- `effective_at`
- `expires_at`
- `source_updated_at`
- `retrieved_at`
- `area_id`
- Optional geometry
- `source_url`
- `verification_status`
- `is_simulated`
- `created_at`
- `updated_at`

#### `translations`
- `id`
- `alert_id`
- `source_text_hash`
- `target_language`
- `translated_title`
- `translated_description`
- `translated_instruction`
- `provider`
- `provider_version`
- `created_at`
- `review_status`

#### `safe_zones`
- `id`
- `name`
- `type`
- `address`
- `latitude`
- `longitude`
- `area_id`
- `source_id`
- `source_url`
- `verification_status`
- `last_verified_at`
- Optional sourced operational details
- `is_simulated`
- `created_at`
- `updated_at`

#### `emergency_contacts`
- `id`
- `service_name`
- `phone_or_channel`
- `area_id`
- `source_url`
- `last_verified_at`
- `is_active`

#### `audit_logs`
- `id`
- `actor_user_id`
- `action`
- `entity_type`
- `entity_id`
- `timestamp`
- `reason`
- Safe, minimal metadata (never secrets)

#### `ingestion_runs`
- `id`
- `source_id`
- `started_at`
- `finished_at`
- `status`
- `records_received`
- `records_created`
- `records_updated`
- `error_code`
- Sanitized error summary

### 10.2 Relationships

- One source can provide many alerts.
- One alert can have multiple translations.
- One area can contain many alerts and safe zones.
- One source can provide many safe zones.
- One user can perform many audited actions.
- One source can have many ingestion runs.

### 10.3 Indexes and constraints

Consider:
- Unique constraint on `(source_id, external_id)` when external IDs exist.
- Index on alert status, expiry, issue time, and area.
- Index on safe-zone area.
- Unique or deduplication rule for translations by alert revision and target language.
- Foreign keys to prevent orphaned source and area references.
- Validation that latitude is between -90 and 90 and longitude between -180 and 180.
- Check that expiry is not earlier than issue time unless the source data legitimately requires special handling.
- Keep all times timezone-aware.

For the MVP, do not over-engineer geometry storage. Use simple coordinates or supported GeoJSON until a real geographic query need exists.

---

## 11. API design

The following routes are illustrative. Adjust them to the chosen backend framework.

### 11.1 Public endpoints

- `GET /api/health` — application health.
- `GET /api/status` — source refresh times and availability summary.
- `GET /api/areas` — supported areas.
- `GET /api/alerts` — list alerts with filters such as `area`, `status`, `hazard_type`, `language`, `limit`, and `cursor`.
- `GET /api/alerts/{id}` — one alert with source and freshness metadata.
- `GET /api/safe-zones` — designated safe zones filtered by area or bounding box.
- `GET /api/safe-zones/{id}` — safe-zone detail.
- `GET /api/emergency-contacts?area=...` — verified contact entries for a supported area.
- `GET /api/translations/{alert_id}?language=...` — cached translation, if available.

### 11.2 Authentication/editor endpoints

- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/auth/me`
- `POST /api/admin/alerts` — create a permitted curated/simulated alert.
- `PATCH /api/admin/alerts/{id}` — update an authorised record.
- `POST /api/admin/safe-zones` — create a safe-zone record from a supported source.
- `PATCH /api/admin/safe-zones/{id}` — update an authorised record.
- `POST /api/admin/sources/{id}/refresh` — trigger a protected, rate-limited refresh.
- `GET /api/admin/ingestion-runs` — view ingestion history.
- `GET /api/admin/audit-logs` — view audit history.

### 11.3 API response principles

- Return consistent JSON.
- Use correct HTTP status codes.
- Validate all query parameters and request bodies.
- Paginate results if needed.
- Never expose API keys, stack traces, password hashes, or internal secrets.
- Use clear error codes, for example `SOURCE_UNAVAILABLE`, `AREA_NOT_SUPPORTED`, and `TRANSLATION_UNAVAILABLE`.
- Include `retrieved_at`, source details, and verification status in relevant responses.
- Do not treat a source error as an empty successful alert list.

Example response shape:

```json
{
  "data": [
    {
      "id": "alert-demo-001",
      "title": "SIMULATION: Heavy rainfall advisory",
      "hazard_type": "heavy_rain",
      "status": "active",
      "verification_status": "simulated",
      "is_simulated": true,
      "issued_at": "2026-10-09T10:00:00Z",
      "retrieved_at": "2026-10-09T10:05:00Z",
      "area_name": "Demo Coastal District",
      "source": {
        "name": "SafeRoute Demo Dataset",
        "url": null
      }
    }
  ],
  "meta": {
    "data_mode": "simulation",
    "last_successful_refresh": "2026-10-09T10:05:00Z"
  }
}
```

This is an example shape, not a real warning or live data.

---

## 12. Frontend page and component plan

Suggested structure:

```text
src/
  app/
    App.tsx
    routes.tsx
  components/
    Header.tsx
    LanguageSelector.tsx
    LocationSelector.tsx
    EmergencyStatusBanner.tsx
    AlertCard.tsx
    AlertList.tsx
    AlertFilters.tsx
    FreshnessBadge.tsx
    SourceBadge.tsx
    MapView.tsx
    MapLegend.tsx
    SafeZoneCard.tsx
    EmergencyContactCard.tsx
    LoadingState.tsx
    ErrorState.tsx
    EmptyState.tsx
    SimulationBanner.tsx
  pages/
    DashboardPage.tsx
    AlertDetailsPage.tsx
    SafeZonesPage.tsx
    GuidancePage.tsx
    SourcesPage.tsx
    AdminLoginPage.tsx
    AdminDashboardPage.tsx
    AdminAlertEditorPage.tsx
  services/
    api.ts
    alerts.ts
    safeZones.ts
    translations.ts
    location.ts
  hooks/
    useAlerts.ts
    useSelectedArea.ts
    useLanguage.ts
  types/
    alert.ts
    source.ts
    safeZone.ts
  utils/
    dateTime.ts
    severity.ts
    geo.ts
```

Keep components focused. For example, `AlertCard` should display an alert, not independently fetch data, translate it, and make authorization decisions.

### Page responsibilities

**Dashboard page**
- Fetch source status, current-area alerts, and relevant safe zones.
- Display the emergency banner, alert list, map preview, and contacts.
- Handle loading, empty, stale, and error states.

**Alert details page**
- Show the complete original notice, translation, source, timestamps, affected area, and map.
- Explain stale or simulated status.

**Safe zones page**
- Show designated safe zones as a map and list.
- Provide filters and provenance.
- Avoid unverified “open now” claims.

**Guidance page**
- Show reviewed general guidance and official links.
- Display the region to which the content applies.

**Sources page**
- Explain connected sources and freshness.
- Distinguish official feeds from demo data.

**Admin pages**
- Require authentication and role checks.
- Allow approved records to be maintained.
- Show validation errors and audit outcomes.

---

## 13. End-to-end user flow

### 13.1 Tourist journey

1. Tourist opens the public dashboard.
2. App loads the selected/default area and source status.
3. Tourist selects a language.
4. Tourist optionally shares location or manually chooses an area.
5. Frontend requests alerts and safe zones for that area.
6. Backend queries the database and reports source freshness.
7. Dashboard displays current records and labels simulated or stale data.
8. Tourist selects an alert.
9. Details page shows the original notice, source, affected area, and timestamps.
10. Tourist switches to a translated version if available.
11. Tourist views designated safe zones and official contact information.
12. Tourist follows official source links or contacts the appropriate authority.

### 13.2 Editor journey

1. Editor signs in.
2. Backend verifies credentials and role.
3. Editor opens the admin dashboard.
4. Editor creates or updates a permitted notice.
5. Backend validates source, text, timestamps, geography, and required labels.
6. Backend stores the change and writes an audit log.
7. Public dashboard reflects the updated record.
8. The UI clearly identifies the record’s source and verification/simulation state.

### 13.3 Ingestion journey

1. Scheduler or authorised editor triggers a refresh.
2. Backend retrieves source data.
3. Each record is parsed and validated.
4. Valid records are normalized and deduplicated.
5. Database upsert stores changes.
6. Ingestion run records success/failure and counts.
7. Source freshness is updated.
8. Frontend retrieves the normalized data.
9. If the source failed, UI displays a stale/unavailable message rather than claiming there are no alerts.

---

## 14. Security, privacy, and responsible handling

Emergency applications should minimize the amount of personal data they collect.

### 14.1 Location privacy

- Ask for location only after a user action.
- Explain why it is needed.
- Keep location optional.
- Avoid persistent location history.
- Do not log precise coordinates.
- Do not send coordinates to unrelated third-party services.
- Provide manual area selection.

### 14.2 Authentication and sessions

- Use a well-maintained authentication library or managed provider.
- Store only password hashes if managing passwords.
- Use HTTPS in deployment.
- Set secure, HTTP-only, SameSite cookies when using cookie sessions.
- Add CSRF protection for cookie-authenticated state-changing requests.
- Rate-limit login and admin refresh endpoints.
- Do not store long-lived secrets in frontend code.

### 14.3 API secrets

- Store secrets in deployment environment variables.
- Add `.env` to `.gitignore`.
- Commit an `.env.example` containing placeholder names only.
- Restrict API keys by domain, endpoint, or quota where the provider allows it.
- Rotate any secret that is accidentally committed.

### 14.4 Input validation

Validate:
- Alert titles and text length.
- URLs and allowed protocols.
- Dates and time zones.
- Coordinate ranges.
- User roles.
- File uploads, if any are added.
- Request body size.

Avoid rendering untrusted HTML from a notice. Render text safely and sanitize any content that must support limited formatting.

### 14.5 Audit and error logging

Log:
- Source refresh started/finished.
- Record created or updated.
- Editor actions.
- Failed authorization attempts.
- Validation failures.

Do not log:
- API keys.
- Passwords.
- Session tokens.
- Unnecessary precise user locations.
- Sensitive personal information.

### 14.6 Threats to consider

- Fake alert submission.
- Editor account compromise.
- Incorrect or stale source data.
- Translation that changes the meaning.
- Duplicate notifications.
- Malicious source URLs.
- API quota exhaustion.
- Unauthorized record edits.
- Misleading map markers.
- Old cached data displayed as current.

The design should make the source and timestamp visible, restrict publishing rights, preserve audit history, and clearly label simulated/unverified information.

---

## 15. Testing plan

Testing must cover both normal operation and failure cases. A successful API response alone does not mean the system is safe or usable.

### 15.1 Backend unit tests

Test:
- Normalization of an alert.
- Missing optional fields.
- Missing required fields.
- Invalid timestamps.
- Expired and cancelled alerts.
- Duplicate ingestion.
- Severity mapping.
- Coordinate validation.
- Translation cache invalidation.
- Distance calculations.
- Area filtering.
- Role authorization.

### 15.2 API integration tests

Test:
- List alerts.
- Filter by area and status.
- Read alert details.
- Retrieve safe zones.
- Retrieve emergency contacts.
- Source timeout.
- Invalid query parameters.
- Unauthenticated admin access.
- Citizen attempting to edit an alert.
- Editor creating a simulated notice.
- Admin update recorded in the audit log.

### 15.3 Frontend tests/manual checks

Check:
- Dashboard loads on desktop and mobile.
- Language selector changes the displayed text.
- Location denial does not block use.
- Map markers open the correct records.
- Alert details preserve original text.
- Translation failure still shows the original notice.
- Stale records are visibly labelled.
- Source failure is not displayed as “no alerts.”
- Keyboard focus is visible.
- Text contrast and font sizes are readable.
- Empty states are understandable.

### 15.4 Failure simulations

Intentionally test:
- Weather/source API returns a server error.
- Network request times out.
- Translation quota is exhausted.
- A source returns malformed JSON.
- No location permission is available.
- There are no safe-zone records.
- A notice has expired.
- Database is temporarily unavailable.
- An alert has no geometry.
- A source’s last successful retrieval is old.

### 15.5 Demo acceptance checklist

Before recording:
- The public link works in an incognito/private browser.
- The application does not require local setup.
- Demo data is clearly labelled.
- No API keys appear in the browser or repository.
- At least one complete user journey works.
- At least one source-failure/stale-data state has been checked.
- The map has a visible legend.
- Translation preserves the original.
- Emergency contacts match the selected demo region and have been checked against an official source, or are clearly simulated.
- The README explains setup, architecture, APIs, limitations, and data provenance.

---

## 16. Deployment plan

### 16.1 Separate configuration from code

Use environment variables for:
- Database connection.
- Session/authentication secret.
- Weather/API keys.
- Translation API keys.
- Allowed frontend origin.
- Runtime environment.
- Refresh interval.

Do not place secrets in source code.

### 16.2 Deployment sequence

1. Create the GitHub repository.
2. Add frontend, backend, database schema/migrations, and `.env.example`.
3. Run tests locally.
4. Provision the production database.
5. Apply migrations.
6. Configure backend environment variables.
7. Deploy backend and verify `/api/health`.
8. Configure the frontend API base URL.
9. Deploy the frontend.
10. Configure CORS narrowly for the deployed frontend.
11. Add initial verified source metadata and clearly labelled demo records.
12. Test the public app from a separate browser/device.
13. Test location permission, map tiles, translation, and source links.
14. Check server logs for errors and secrets.
15. Record the deployment URL and exact setup steps in the README.

### 16.3 Demo mode

If live emergency APIs are not reliable enough for the presentation, create a dedicated demo mode with fixed, fictional data. The UI must show a persistent “SIMULATION — NOT LIVE EMERGENCY INFORMATION” label. Never silently switch from live data to fabricated data.

---

## 17. GitHub repository and README

Suggested repository:

```text
saferoute/
  frontend/
  backend/
  database/
    migrations/
    seed_demo_data.sql
  docs/
    architecture.md
    data-sources.md
    api.md
    demo-script.md
  tests/
  .env.example
  .gitignore
  README.md
```

The README should include:

1. Project title and problem statement.
2. What the application does.
3. Screenshots.
4. Feature list.
5. Architecture diagram.
6. Technology stack.
7. Data sources and their roles.
8. Which records are live, curated, simulated, or translated.
9. Setup instructions.
10. Environment variables.
11. Database migrations/seed instructions.
12. API endpoint summary.
13. Testing instructions.
14. Deployment link.
15. Known limitations.
16. Privacy and safety design.
17. Team contributions.
18. Credits and third-party libraries/APIs.

The hackathon rules require a GitHub repository, a two-to-five-minute demo video in the repository, and a README describing the problem, solution, and setup instructions. Verify the final submission process and deadline against the organizer’s latest communication.

---

## 18. Two-to-five-minute demo-video script

A concise demo should show a single coherent story rather than listing every feature.

### 0:00–0:20 — Problem
Explain that tourists may face fragmented warnings, unfamiliar geography, and language barriers during extreme weather.

### 0:20–0:45 — Dashboard
Show the area selector, language selector, emergency status banner, data freshness, and alert list. State whether the scenario is simulated or live.

### 0:45–1:20 — Alert details and source
Open an alert. Show the original notice, issuing source, issue/update times, affected area, and verification label.

### 1:20–1:50 — Language support
Change language and show the translation beside or in place of the original while retaining access to the original.

### 1:50–2:25 — Map and designated safe zones
Show alert markers, safe-zone markers, the legend, source information, and approximate distance if available. Explain that a map marker does not guarantee a route is safe.

### 2:25–2:55 — Source reliability
Show the source freshness or a deliberately tested stale-data state. Demonstrate that a source failure does not get misrepresented as “no alerts.”

### 2:55–3:25 — Admin/editor
If time allows, show an authorised editor adding a clearly labelled demo notice and the public dashboard reflecting the change.

### Final 10–20 seconds — Impact and limitations
Explain how the system makes emergency information easier to find and understand, and acknowledge that actual usefulness depends on authoritative data availability and freshness.

Do not stage fake live warnings or claim real-world safety validation that has not been performed.

---

## 19. Suggested 24-hour execution schedule

This schedule assumes a small team that can work in parallel. Adjust it to the team’s skill level.

| Elapsed time | Workstream | Deliverable |
|---|---|---|
| Hour 0–1 | Agree on geography, user journey, scope, and responsibilities | Scope freeze and shared task board |
| Hour 1–2 | Create repository, architecture, database schema, and wireframe | Project skeleton |
| Hour 2–5 | Backend models, seed data, public APIs | Alerts and safe-zone endpoints work |
| Hour 2–5 | In parallel: dashboard, header, alert cards, responsive layout | Frontend shell |
| Hour 5–8 | Connect dashboard to API, filters, details page | End-to-end alert browsing |
| Hour 8–11 | Add one real, verified data source if feasible; otherwise clearly labelled demo ingestion | Normalized alert records |
| Hour 11–14 | Map, area selector, optional geolocation | Location-aware browsing |
| Hour 14–16 | Translation and original-text preservation | Multilingual alert details |
| Hour 16–18 | Safe-zone list, emergency contacts, guidance | Complete tourist workflow |
| Hour 18–19 | Editor flow and source status | Data-maintenance path |
| Hour 19–20 | Failure states, authorization, and critical tests | More robust MVP |
| Hour 20–21 | Deploy early and fix deployment issues | Public URL |
| Hour 21–22 | Mobile/accessibility pass and demo-data verification | Presentation-ready app |
| Hour 22–23 | README, screenshots, demo recording | Submission materials |
| Hour 23–24 | Final test, repository check, submission buffer | Ready-to-submit project |

**Protect the core workflow.** If you fall behind, postpone push notifications, AI chat, complex route planning, and advanced offline support. Do not sacrifice source attribution, freshness labels, basic security, or deployment.

---

## 20. Team division (if multiple people are available)

### Person A — Frontend and dashboard
- Dashboard layout.
- Alert cards and details.
- Language selector.
- Responsive design.
- Loading/error/empty states.

### Person B — Backend and database
- Schema and migrations.
- Public APIs.
- Filtering.
- Authentication and roles.
- Audit logs.

### Person C — Maps and data ingestion
- Source research.
- Normalization and deduplication.
- Map layers and legend.
- Safe-zone display.
- Source freshness.

### Person D — Integration, testing, and presentation
- Connect frontend and backend.
- Test failure cases.
- Deployment.
- README and screenshots.
- Demo script and recording.

If there are fewer team members, combine roles. Agree on API response shapes and database field names early so parallel work does not conflict.

---

## 21. Prioritized implementation backlog

### P0 — Must work
- [ ] Responsive dashboard.
- [ ] One supported demo area.
- [ ] Alert list and details.
- [ ] Source, timestamps, and verification/simulation labels.
- [ ] Explicit stale/error/no-data states.
- [ ] Manual area selection.
- [ ] Map with legend and alert markers where geometry is available.
- [ ] Safe-zone list/map records with provenance.
- [ ] Original notice and at least one tested translation path.
- [ ] Official guidance/contact links for the chosen region.
- [ ] Backend validation and restricted editor access.
- [ ] Public deployment.
- [ ] README and demo video.

### P1 — Add if P0 is stable
- [ ] Optional browser geolocation.
- [ ] More hazard filters.
- [ ] Cached translations.
- [ ] Source-health admin panel.
- [ ] Audit log view.
- [ ] A second language.
- [ ] More robust scheduled refresh.

### P2 — Future development
- [ ] Browser push notifications.
- [ ] Progressive web app and offline cache.
- [ ] Crowdsourced reports with moderation.
- [ ] Additional official data providers.
- [ ] More sophisticated geospatial matching.
- [ ] Route guidance that accounts for authoritative closure data.
- [ ] Carefully evaluated AI simplification.
- [ ] Analytics on alert coverage and freshness.

---

## 22. Major decisions to make before coding

Do not start implementation until the team has agreed on these items:

1. **Target geography:** One city/district for the MVP.
2. **Source strategy:** Which authoritative warning source will be used, and what happens if it is inaccessible?
3. **Demo mode:** What is simulated, and how is it labelled?
4. **Languages:** Which two languages will be tested end to end?
5. **Safe-zone provenance:** Where do shelter/assistance records come from?
6. **Location policy:** Is geolocation optional, and is precise location stored? Prefer not storing it.
7. **Stack:** Use familiar technologies.
8. **API contract:** Agree on field names and response formats before frontend/backend integration.
9. **MVP boundary:** No route-safety claims or AI-generated emergency advice in the initial version.
10. **Deployment:** Pick the hosting approach early and test a minimal deployment before the app is complete.

---

## 23. Final recommended MVP

For a convincing 24-hour project, build this exact end-to-end experience:

1. A tourist opens SafeRoute.
2. They choose a supported area and preferred language.
3. The dashboard shows official or clearly labelled simulated alerts with source and freshness information.
4. The tourist opens an alert and sees the original notice and translation.
5. They view the affected area and designated safe zones on a map.
6. They see verified contact information and links to local authorities.
7. If a source is unavailable, the app clearly explains the limitation and labels any cached data.
8. An authorised editor can maintain a clearly labelled demo notice.
9. The app is deployed publicly, tested on mobile, documented, and demonstrated in a short video.

This version has a clear user journey, real full-stack work, visible technical features, and manageable scope. It also avoids pretending that a hackathon prototype can guarantee safety during a real disaster.

**Final principle:** Make the source, timestamp, uncertainty, and status of every emergency-related record visible. In this project, trustworthy communication is more important than adding the largest number of features.
