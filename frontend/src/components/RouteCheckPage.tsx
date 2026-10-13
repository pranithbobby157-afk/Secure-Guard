import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { Alert, Area } from '../types';
import { Copy } from '../i18n/messages';
import { Icon } from './Icon';
import { Page } from './Header';
import {
  INDIAN_DESTINATIONS,
  IndianDestination,
  calculateHaversineDistanceKm,
  searchDestinations
} from '../services/destinations';
import { savedStore } from '../services/savedStore';

interface RouteCheckPageProps {
  t: Copy;
  alerts: Alert[];
  currentArea?: Area;
  userLocation: { lat: number; lng: number } | null;
  navigate?: (p: Page) => void;
}

export const RouteCheckPage: React.FC<RouteCheckPageProps> = ({
  t,
  alerts,
  currentArea,
  userLocation,
  navigate
}) => {
  const [startQuery, setStartQuery] = useState(
    currentArea?.name || 'Chennai (Central & Coastal)'
  );
  const [destQuery, setDestQuery] = useState('Mahabalipuram (Mamallapuram)');

  const [startDest, setStartDest] = useState<IndianDestination | null>(
    INDIAN_DESTINATIONS.find((d) => d.id === 'dest-chennai') || INDIAN_DESTINATIONS[0]
  );
  const [endDest, setEndDest] = useState<IndianDestination | null>(
    INDIAN_DESTINATIONS.find((d) => d.id === 'dest-mahabalipuram') || INDIAN_DESTINATIONS[1]
  );

  const [isCalculated, setIsCalculated] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleUseGps = () => {
    if (!userLocation) return;
    const gpsDest: IndianDestination = {
      id: 'dest-current-gps',
      name: `GPS Location (${userLocation.lat.toFixed(2)}, ${userLocation.lng.toFixed(2)})`,
      state: currentArea?.state_region || 'Tamil Nadu',
      lat: userLocation.lat,
      lng: userLocation.lng,
      category: 'metropolitan'
    };
    setStartDest(gpsDest);
    setStartQuery(gpsDest.name);
  };

  const handleSwap = () => {
    const tempQ = startQuery;
    const tempD = startDest;
    setStartQuery(destQuery);
    setStartDest(endDest);
    setDestQuery(tempQ);
    setEndDest(tempD);
  };

  const handleCalculate = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSavedSuccess(false);

    if (!startDest || !endDest) {
      setErrorMsg('Please select valid start and destination locations from the suggestions list.');
      return;
    }

    if (startDest.id === endDest.id) {
      setErrorMsg('Start point and destination cannot be identical. Please pick a different destination.');
      return;
    }

    setIsCalculated(true);
  };

  // Compute straight-line distance
  const distanceKm =
    startDest && endDest
      ? calculateHaversineDistanceKm(
          startDest.lat,
          startDest.lng,
          endDest.lat,
          endDest.lng
        )
      : 0;

  // Midpoint approximation
  const midLat = startDest && endDest ? (startDest.lat + endDest.lat) / 2 : 0;
  const midLng = startDest && endDest ? (startDest.lng + endDest.lng) / 2 : 0;

  // Find hazards intersecting or within corridor (within 40km of start, mid, or end)
  const activeAlerts = alerts.filter((a) => a.status === 'active');
  const corridorHazards = activeAlerts.filter((alert) => {
    if (!alert.lat || !alert.lng) return true; // General area advisory applies
    const dStart = calculateHaversineDistanceKm(alert.lat, alert.lng, startDest!.lat, startDest!.lng);
    const dMid = calculateHaversineDistanceKm(alert.lat, alert.lng, midLat, midLng);
    const dEnd = calculateHaversineDistanceKm(alert.lat, alert.lng, endDest!.lat, endDest!.lng);
    return dStart <= 40 || dMid <= 40 || dEnd <= 40;
  });

  const handleSaveRoute = () => {
    if (!startDest || !endDest) return;
    savedStore.save({
      id: `route-${startDest.id}-${endDest.id}`,
      type: 'route',
      title: `${startDest.name} → ${endDest.name}`,
      subtitle: `${distanceKm} km direct corridor · ${corridorHazards.length} advisories along path`,
      badge: corridorHazards.length > 0 ? 'Hazards Present' : 'Corridor Clear',
      details: `Corridor assessment between ${startDest.state} and ${endDest.state}.`,
      data: {
        start: startDest,
        destination: endDest,
        distanceKm,
        corridorHazardsCount: corridorHazards.length
      }
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const layerGroupRef = useRef<L.LayerGroup | null>(null);

  // Initialize and update Route Corridor Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [startDest?.lat || 13.0827, startDest?.lng || 80.2707],
        zoom: 10,
        zoomControl: false,
        scrollWheelZoom: true,
        dragging: true,
        touchZoom: true
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
        maxZoom: 19
      }).addTo(map);

      // Add zoom control at bottom-right
      L.control.zoom({ position: 'bottomright' }).addTo(map);

      layerGroupRef.current = L.layerGroup().addTo(map);
      mapInstanceRef.current = map;
    }

    const map = mapInstanceRef.current;
    const layers = layerGroupRef.current;
    if (!map || !layers) return;

    layers.clearLayers();

    if (startDest && endDest) {
      // 1. Origin Marker
      const originPin = L.divIcon({
        className: 'custom-route-pin',
        html: `
          <div style="background: #007F78; color: white; padding: 4px 8px; border-radius: 6px; font-weight: 800; font-size: 11px; box-shadow: 0 2px 8px rgba(0,0,0,0.25); border: 2px solid white; display: flex; align-items: center; gap: 4px; white-space: nowrap;">
            <span>🟢</span><span>${startDest.name.split(' ')[0]}</span>
          </div>
        `,
        iconSize: [80, 28],
        iconAnchor: [40, 14]
      });
      L.marker([startDest.lat, startDest.lng], { icon: originPin })
        .bindPopup(`<strong>Origin:</strong> ${startDest.name} (${startDest.state})`)
        .addTo(layers);

      // 2. Destination Marker
      const destPin = L.divIcon({
        className: 'custom-route-pin',
        html: `
          <div style="background: #175CD3; color: white; padding: 4px 8px; border-radius: 6px; font-weight: 800; font-size: 11px; box-shadow: 0 2px 8px rgba(0,0,0,0.25); border: 2px solid white; display: flex; align-items: center; gap: 4px; white-space: nowrap;">
            <span>🏁</span><span>${endDest.name.split(' ')[0]}</span>
          </div>
        `,
        iconSize: [80, 28],
        iconAnchor: [40, 14]
      });
      L.marker([endDest.lat, endDest.lng], { icon: destPin })
        .bindPopup(`<strong>Destination:</strong> ${endDest.name} (${endDest.state})`)
        .addTo(layers);

      // 3. Transit Corridor Polyline
      const corridorPolyline = L.polyline(
        [
          [startDest.lat, startDest.lng],
          [endDest.lat, endDest.lng]
        ],
        { color: '#007F78', weight: 4, dashArray: '6, 8', opacity: 0.9 }
      );
      corridorPolyline.bindPopup(`<strong>Transit Corridor</strong><br/>Direct distance: ${distanceKm} km`);
      corridorPolyline.addTo(layers);

      // 4. Corridor Geographic Buffer Zone (approx. 20-30km radius)
      L.circle([midLat, midLng], {
        color: '#007F78',
        fillColor: '#007F78',
        fillOpacity: 0.06,
        radius: Math.max(distanceKm * 400, 12000),
        weight: 1,
        dashArray: '3, 6'
      }).addTo(layers);

      // 5. Active Hazards intersecting or near corridor
      corridorHazards.forEach((hazard) => {
        if (hazard.lat && hazard.lng) {
          const isCritical = hazard.severity === 'critical';
          const color = isCritical ? '#D92D20' : '#DC6803';
          const circle = L.circle([hazard.lat, hazard.lng], {
            color,
            fillColor: color,
            fillOpacity: 0.22,
            radius: isCritical ? 3000 : 2000,
            weight: 2
          });
          circle.bindPopup(`
            <div style="font-family: inherit; font-size: 12px; max-width: 200px;">
              <span style="font-size: 10px; font-weight: 800; color: ${color}; text-transform: uppercase;">⚠️ ${hazard.severity.toUpperCase()}</span>
              <div style="font-weight: 700; margin-top: 2px; color: #101828;">${hazard.title}</div>
              <div style="font-size: 11px; color: #475467; margin-top: 3px;">${hazard.description_original.substring(0, 90)}...</div>
            </div>
          `);
          circle.addTo(layers);
        }
      });

      // Fit map bounds to encompass the entire corridor
      const bounds = L.latLngBounds([
        [startDest.lat, startDest.lng],
        [endDest.lat, endDest.lng]
      ]);
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 13 });

      const timer = setTimeout(() => {
        map.invalidateSize();
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [isCalculated, startDest, endDest, distanceKm, corridorHazards]);

  const startSuggestions = searchDestinations(startQuery);
  const destSuggestions = searchDestinations(destQuery);

  return (
    <div className="page-shell">
      {/* Intro Header */}
      <section className="page-intro">
        <div>
          <div className="eyebrow">
            <Icon name="route" size={14} />
            {t.explore || 'Corridor Assessment'}
          </div>
          <h1>Route & Travel Corridor Check</h1>
          <p>
            Assess transit routes between Indian travel hubs against active cyclone, flood, and waterlogging advisories.
          </p>
        </div>

        <div className="freshness">
          <span className="status-dot bg-[#007F78]" />
          <span>
            <strong>Corridor Safety Assessor</strong>
            <small>Direct Geographic Proximity Model</small>
          </span>
        </div>
      </section>

      {/* Route Form */}
      <div className="grid gap-8 lg:grid-cols-[1fr_1.35fr]">
        <div className="rounded-2xl border border-[#E2E8F0] bg-white p-6 shadow-sm">
          <h2 className="text-base font-extrabold text-[#101828] mb-5">
            Check transit route
          </h2>

          <form onSubmit={handleCalculate} className="space-y-4">
            {/* Start Point */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-[10px] font-extrabold uppercase tracking-widest text-[#475467]">
                  START
                </label>
                {userLocation && (
                  <button
                    type="button"
                    onClick={handleUseGps}
                    className="text-[11px] font-bold text-[#007F78] hover:underline flex items-center gap-1"
                  >
                    Use my GPS
                  </button>
                )}
              </div>
              <div className="relative flex items-center">
                <span className="absolute start-3.5 size-2 rounded-full bg-[#10B981]" />
                <input
                  type="text"
                  value={startQuery}
                  onChange={(e) => {
                    setStartQuery(e.target.value);
                    const match = INDIAN_DESTINATIONS.find(
                      (d) => d.name.toLowerCase() === e.target.value.toLowerCase()
                    );
                    if (match) setStartDest(match);
                  }}
                  placeholder="e.g. Chennai, Madurai, Bengaluru..."
                  className="w-full rounded-xl border border-[#E2E8F0] bg-[#FAFCFC] ps-8 pe-3.5 py-2.5 text-xs font-bold text-[#101828] focus:border-[#007F78] focus:bg-white focus:outline-none"
                />
              </div>
              {startSuggestions.length > 0 && startQuery !== startDest?.name && (
                <div className="mt-1 max-h-36 overflow-y-auto rounded-lg border border-[#E2E8F0] bg-white shadow-sm p-1 text-xs">
                  {startSuggestions.slice(0, 5).map((d) => (
                    <button
                      type="button"
                      key={d.id}
                      onClick={() => {
                        setStartDest(d);
                        setStartQuery(d.name);
                      }}
                      className="w-full rounded px-2.5 py-1.5 text-start hover:bg-[#F2F4F7] font-medium"
                    >
                      {d.name} <span className="text-[#667085]">({d.state})</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Swap Button */}
            <div className="flex justify-center -my-1">
              <button
                type="button"
                onClick={handleSwap}
                className="flex size-8 items-center justify-center rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] text-[#475467] hover:bg-[#EAECF0] transition-colors"
                title="Swap origin and destination"
                aria-label="Swap origin and destination"
              >
                <Icon name="refresh" size={14} />
              </button>
            </div>

            {/* Destination Point */}
            <div>
              <label className="block text-[10px] font-extrabold uppercase tracking-widest text-[#475467] mb-1.5">
                DESTINATION
              </label>
              <div className="relative flex items-center">
                <span className="absolute start-3.5 size-2 rounded-xs bg-[#D92D20]" />
                <input
                  type="text"
                  value={destQuery}
                  onChange={(e) => {
                    setDestQuery(e.target.value);
                    const match = INDIAN_DESTINATIONS.find(
                      (d) => d.name.toLowerCase() === e.target.value.toLowerCase()
                    );
                    if (match) setEndDest(match);
                  }}
                  placeholder="e.g. Mahabalipuram, Puducherry, Ooty..."
                  className="w-full rounded-xl border border-[#E2E8F0] bg-[#FAFCFC] ps-8 pe-3.5 py-2.5 text-xs font-bold text-[#101828] focus:border-[#007F78] focus:bg-white focus:outline-none"
                />
              </div>
              {destSuggestions.length > 0 && destQuery !== endDest?.name && (
                <div className="mt-1 max-h-36 overflow-y-auto rounded-lg border border-[#E2E8F0] bg-white shadow-sm p-1 text-xs">
                  {destSuggestions.slice(0, 5).map((d) => (
                    <button
                      type="button"
                      key={d.id}
                      onClick={() => {
                        setEndDest(d);
                        setDestQuery(d.name);
                      }}
                      className="w-full rounded px-2.5 py-1.5 text-start hover:bg-[#F2F4F7] font-medium"
                    >
                      {d.name} <span className="text-[#667085]">({d.state})</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Error Message */}
            {errorMsg && (
              <div className="rounded-lg bg-red-50 p-3 text-xs font-semibold text-[#B42318] flex items-center gap-2">
                <Icon name="warning" size={15} />
                {errorMsg}
              </div>
            )}

            {/* Calculate Button */}
            <button
              type="submit"
              className="w-full mt-3 rounded-xl bg-[#136159] py-3 px-4 text-xs font-extrabold text-white hover:bg-[#0f4d47] transition-colors flex items-center justify-center gap-2 shadow-xs"
            >
              Assess route corridor
            </button>
          </form>

          {/* Quick Popular Destination Shortcuts */}
          <div className="mt-7 border-t border-[#E2E8F0] pt-4">
            <span className="text-[10px] font-extrabold text-[#64748B] uppercase tracking-widest block mb-2.5">
              POPULAR CORRIDORS
            </span>
            <div className="flex flex-wrap gap-2">
              {[
                ['dest-chennai', 'dest-mahabalipuram', 'Chennai - Mahabalipuram'],
                ['dest-chennai', 'dest-puducherry', 'Chennai - Pondicherry'],
                ['dest-chennai', 'dest-kancheepuram', 'Chennai - Kanchipuram'],
                ['dest-coimbatore', 'dest-ooty', 'Coimbatore - Ooty']
              ].map(([sId, eId, label]) => (
                <button
                  type="button"
                  key={label}
                  onClick={() => {
                    const s = INDIAN_DESTINATIONS.find((d) => d.id === sId);
                    const e = INDIAN_DESTINATIONS.find((d) => d.id === eId);
                    if (s && e) {
                      setStartDest(s);
                      setStartQuery(s.name);
                      setEndDest(e);
                      setDestQuery(e.name);
                      setIsCalculated(true);
                    }
                  }}
                  className="rounded-full border border-[#38D9A9] bg-[#E6FFFA] px-3.5 py-1.5 text-[11px] font-bold text-[#005E59] hover:bg-[#CCFBF1] transition-all"
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Calculation Result & Hazards */}
        <div className="space-y-6">
          {/* CRITICAL LIMITATION DISCLAIMER */}
          <div className="rounded-xl border border-amber-300 bg-amber-50/70 p-4 text-xs text-[#7A271A]">
            <div className="flex items-start gap-2.5">
              <span className="mt-0.5 text-[#DC6803]">
                <Icon name="warning" size={18} />
              </span>
              <div>
                <strong className="text-sm font-bold text-[#9A3412] block">
                  Important: Geometric Corridor Approximation
                </strong>
                <p className="mt-1 leading-5 text-[#9A3412]">
                  This assessment calculates the straight-line geographic corridor between destinations and cross-checks active government disaster zones. It is <strong>NOT</strong> turn-by-turn road navigation, GPS traffic routing, or a guarantee of passability. Flooding, road washaways, tree falls, or police blockades must be confirmed via local helplines (112 / 1070).
                </p>
              </div>
            </div>
          </div>

          {isCalculated && startDest && endDest ? (
            <div className="space-y-6">
              {/* Transit Summary Card */}
              <div className="rounded-2xl border border-[#E2E8F0] bg-white p-6 shadow-sm">
                <div className="flex flex-wrap items-start justify-between gap-4 border-b border-[#E2E8F0] pb-4">
                  <div>
                    <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#64748B]">
                      TRANSIT SUMMARY
                    </span>
                    <h3 className="text-xl font-extrabold text-[#101828] mt-1">
                      {startDest.name} → {endDest.name}
                    </h3>
                    <p className="text-xs text-[#667085] mt-1 font-medium">
                      Direct distance {distanceKm} km · Midpoint {midLat.toFixed(3)}, {midLng.toFixed(3)}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    {navigate && (
                      <button
                        type="button"
                        onClick={() => navigate('map')}
                        className="rounded-xl border border-[#D0D5DD] bg-white px-3.5 py-1.5 text-xs font-bold text-[#344054] hover:bg-slate-50 transition-colors shadow-2xs"
                      >
                        Open live map
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={handleSaveRoute}
                      className="rounded-xl border border-[#D0D5DD] bg-white px-3.5 py-1.5 text-xs font-bold text-[#344054] hover:bg-slate-50 transition-colors shadow-2xs"
                    >
                      {savedSuccess ? 'Saved!' : 'Save route'}
                    </button>
                  </div>
                </div>

                {/* Amber Caution Callout */}
                <div className="mt-4 rounded-xl border border-amber-200 bg-[#FEF0C7]/50 p-4">
                  <div className="flex items-start gap-3">
                    <span className="grid size-8 shrink-0 place-items-center rounded-full bg-[#F79009] text-white font-extrabold text-sm">
                      !
                    </span>
                    <div>
                      <strong className="text-xs font-extrabold text-[#B54708] block">
                        Caution advised on the coastal stretch
                      </strong>
                      <p className="text-xs text-[#B54708] mt-0.5 font-medium">
                        {corridorHazards.length > 0
                          ? `Corridor intersects ${corridorHazards.length} active weather hazard zones.`
                          : 'Sample result — the corridor passes near an active advisory zone.'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Corridor Map */}
                <div className="mt-5 rounded-2xl border border-[#E2E8F0] overflow-hidden bg-white shadow-2xs">
                  <div
                    ref={mapContainerRef}
                    className="h-[260px] w-full"
                    style={{ minHeight: '250px' }}
                  />
                  {/* Map Legend */}
                  <div className="flex flex-wrap items-center gap-4 px-4 py-2.5 bg-[#FAFCFC] border-t border-[#E2E8F0] text-[11px] font-bold text-[#475467]">
                    <span className="flex items-center gap-1.5">
                      <span className="h-0.5 w-3 bg-[#007F78]" />
                      Clear corridor
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="h-0.5 w-3 bg-[#DC6803]" />
                      Near advisory
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="size-2 rounded-xs border-2 border-[#D92D20] bg-red-100" />
                      Hazard zone
                    </span>
                  </div>
                </div>
              </div>

              {/* Hazards Near This Corridor */}
              <div className="rounded-2xl border border-[#E2E8F0] bg-white p-6 shadow-sm">
                <h4 className="text-sm font-extrabold text-[#101828] mb-4">
                  Hazards near this corridor
                </h4>
                <div className="grid gap-3 sm:grid-cols-3">
                  {/* Cyclone card */}
                  <div className="rounded-xl border border-[#E2E8F0] bg-[#FAFCFC] p-3.5">
                    <span className="text-[11px] font-bold text-[#64748B] block">Cyclone</span>
                    <strong className="text-base font-extrabold text-[#DC6803] block mt-1">
                      {corridorHazards.some(h => h.hazard_type === 'cyclone') ? 'Watch' : 'None flagged'}
                    </strong>
                    <span className="text-[10px] text-[#94A3B8] font-medium block mt-1">[Source: 10m]</span>
                  </div>

                  {/* Flood card */}
                  <div className="rounded-xl border border-[#E2E8F0] bg-[#FAFCFC] p-3.5">
                    <span className="text-[11px] font-bold text-[#64748B] block">Flood</span>
                    <strong className="text-base font-extrabold text-[#D92D20] block mt-1">
                      {corridorHazards.some(h => h.hazard_type === 'flood' || h.hazard_type === 'waterlogging') ? 'Advisory' : 'None flagged'}
                    </strong>
                    <span className="text-[10px] text-[#94A3B8] font-medium block mt-1">[Source: 0m]</span>
                  </div>

                  {/* Waterlogging card */}
                  <div className="rounded-xl border border-[#E2E8F0] bg-[#FAFCFC] p-3.5">
                    <span className="text-[11px] font-bold text-[#64748B] block">Waterlogging</span>
                    <strong className="text-base font-extrabold text-[#007F78] block mt-1">
                      {corridorHazards.some(h => h.hazard_type === 'waterlogging') ? 'Watch' : 'None flagged'}
                    </strong>
                    <span className="text-[10px] text-[#94A3B8] font-medium block mt-1">[Source: 0m]</span>
                  </div>
                </div>
              </div>

              {/* Dark Emergency Notice Card matching bottom of mockup */}
              <div className="rounded-2xl bg-[#0C1825] p-6 text-white shadow-md">
                <strong className="text-sm font-bold text-white block">
                  This is a straight-line estimate, not navigation
                </strong>
                <p className="text-xs text-[#94A3B8] mt-1.5 leading-5 font-normal">
                  It cannot confirm road washouts, fallen trees or police blockades. Confirm with local helplines before travelling.
                </p>
                <div className="mt-4 flex items-center gap-3">
                  <a
                    href="tel:112"
                    className="rounded-xl bg-white px-4 py-2 text-xs font-extrabold text-[#0C1825] hover:bg-slate-100 transition-colors inline-flex items-center gap-1.5"
                  >
                    Call 112
                  </a>
                  <a
                    href="tel:1070"
                    className="rounded-xl border border-white/20 bg-transparent px-4 py-2 text-xs font-extrabold text-white hover:bg-white/10 transition-colors inline-flex items-center gap-1.5"
                  >
                    Call 1070
                  </a>
                </div>
              </div>
            </div>
          ) : (
            <div className="empty-state">
              <Icon name="route" size={24} />
              <h3>Enter start and destination to assess corridor</h3>
              <p>Select Indian travel hotspots from the suggestions to view direct distance and hazard proximity.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
