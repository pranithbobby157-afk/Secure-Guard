import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { Alert, Area, SafeZone, Source } from '../types';
import { Copy } from '../i18n/messages';
import { Icon } from './Icon';
import { ActionPlan } from './ActionPlan';
import { ShelterList } from './ShelterList';
import { SourcePanel } from './SourcePanel';

interface ConditionsPageProps {
  t: Copy;
  area?: Area;
  alerts: Alert[];
  safeZones: SafeZone[];
  sources?: Source[];
  userLocation: { lat: number; lng: number } | null;
}

export const ConditionsPage: React.FC<ConditionsPageProps> = ({
  t,
  area,
  alerts,
  safeZones,
  sources,
  userLocation
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const layerGroupRef = useRef<L.LayerGroup | null>(null);
  const [zoomLevel, setZoomLevel] = useState<number>(area?.default_zoom || 12);
  const [tileError, setTileError] = useState<boolean>(false);

  // 1. Initialize Leaflet Map with OpenStreetMap Standard Provider
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const initialLat = area?.center_lat || 13.0827;
      const initialLng = area?.center_lng || 80.2707;
      const initialZoom = area?.default_zoom || 12;

      const map = L.map(mapContainerRef.current, {
        center: [initialLat, initialLng],
        zoom: initialZoom,
        zoomControl: false, // Driven by custom accessible zoom toolbar
        scrollWheelZoom: true,
        dragging: true,
        touchZoom: true
      });

      // Hackathon Standard OpenStreetMap Tile Endpoint (No API key required)
      const tileLayer = L.tileLayer(
        'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
        {
          attribution:
            '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> contributors',
          maxZoom: 19,
          subdomains: ['a', 'b', 'c']
        }
      );

      // Phase 4: Fallback behavior if tiles fail to load
      let failedTileCount = 0;
      tileLayer.on('tileerror', () => {
        failedTileCount++;
        if (failedTileCount >= 4) {
          setTileError(true);
        }
      });

      tileLayer.addTo(map);

      map.on('zoomend', () => {
        setZoomLevel(map.getZoom());
      });

      layerGroupRef.current = L.layerGroup().addTo(map);
      mapInstanceRef.current = map;

      // Invalidate size to ensure container dimensions are computed correctly
      const resizeTimer = setTimeout(() => {
        map.invalidateSize();
      }, 150);

      const handleWindowResize = () => {
        map.invalidateSize();
      };
      window.addEventListener('resize', handleWindowResize);

      return () => {
        clearTimeout(resizeTimer);
        window.removeEventListener('resize', handleWindowResize);
        map.remove();
        mapInstanceRef.current = null;
      };
    }
  }, []);

  // 2. Pan and re-center when geographic area changes
  useEffect(() => {
    if (mapInstanceRef.current && area) {
      mapInstanceRef.current.setView([area.center_lat, area.center_lng], area.default_zoom);
      setZoomLevel(area.default_zoom);
      mapInstanceRef.current.invalidateSize();
    }
  }, [area]);

  // 3. Update Map Markers and Layers (Shelters, Hazards, User Location)
  useEffect(() => {
    if (!mapInstanceRef.current || !layerGroupRef.current) return;

    const layers = layerGroupRef.current;
    layers.clearLayers();

    // A. Plot Hazard Danger Zones from backend alerts
    alerts.forEach((alert) => {
      if (alert.lat && alert.lng) {
        const isCritical = alert.severity === 'critical';
        const color = isCritical ? '#D92D20' : '#DC6803';
        const radius = isCritical ? 2400 : 1600;

        const circle = L.circle([alert.lat, alert.lng], {
          color: color,
          fillColor: color,
          fillOpacity: 0.18,
          radius: radius,
          weight: 2,
          dashArray: '4, 4'
        });

        const simPrefix = alert.is_simulated ? 'SIMULATED ' : '';

        circle.bindPopup(`
          <div style="font-family: inherit; font-size: 12px; color: #101828; max-width: 240px; line-height: 1.4;">
            <div style="font-weight: 800; color: ${color}; text-transform: uppercase; font-size: 10px; letter-spacing: 0.05em;">
              ⚠️ ${simPrefix}${alert.severity.toUpperCase()} HAZARD ZONE
            </div>
            <div style="font-weight: 700; margin: 4px 0 2px;">${alert.title}</div>
            <div style="color: #667085; font-size: 11px;">${alert.description_original.substring(0, 100)}...</div>
            <div style="margin-top: 5px; font-size: 9px; color: #98A2B3; border-top: 1px solid #E2E8F0; padding-top: 3px;">
              Advisory boundary from source. Absence of markers does not confirm area is safe.
            </div>
          </div>
        `);
        circle.addTo(layers);
      }
    });

    // B. Plot Designated Shelters & Relief Hubs from backend safe zones
    safeZones.forEach((sz) => {
      const isHospital = sz.facility_type === 'hospital';
      const bgColor = isHospital ? '#D92D20' : '#007F78';

      const shelterIcon = L.divIcon({
        className: 'custom-map-pin',
        html: `
          <div style="
            background: ${bgColor};
            color: white;
            width: 32px;
            height: 32px;
            border-radius: 8px;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 4px 12px rgba(0,0,0,0.2);
            border: 2px solid white;
            font-size: 14px;
            cursor: pointer;
          " aria-label="${sz.name}">
            ${isHospital ? '🏥' : '🛡️'}
          </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
        popupAnchor: [0, -16]
      });

      const marker = L.marker([sz.latitude, sz.longitude], { icon: shelterIcon });

      const verifiedBadge = sz.is_simulated
        ? `<span style="font-size: 9px; font-weight: 800; color: #7E22CE; background: #F3E8FF; padding: 2px 6px; border-radius: 4px;">SIMULATED RELIEF HUB</span>`
        : `<span style="font-size: 9px; font-weight: 800; color: #007F78; background: #DDF8EF; padding: 2px 6px; border-radius: 4px;">OFFICIAL SHELTER</span>`;

      const opStatus = sz.operational_status === 'open'
        ? `<span style="font-size: 9px; font-weight: 700; color: #079455; background: #ECFDF3; padding: 2px 5px; border-radius: 4px;">Operational</span>`
        : `<span style="font-size: 9px; font-weight: 700; color: #DC6803; background: #FEF0C7; padding: 2px 5px; border-radius: 4px;">${sz.operational_status}</span>`;

      const distText = sz.distance_km != null
        ? `<div style="margin-top: 6px; font-weight: 700; color: #005E59; font-size: 11px;">📍 Approx. ${sz.distance_km.toFixed(1)} km away</div>`
        : `<div style="margin-top: 6px; font-size: 10px; color: #667085;">📍 Distance unavailable (location unshared)</div>`;

      const capacityHtml = sz.capacity_notes
        ? `<div style="margin-top: 4px; font-size: 10px; color: #475467; background: #F8FAFC; padding: 4px 6px; border-radius: 4px; border: 1px solid #E2E8F0;">${sz.capacity_notes}</div>`
        : '';

      const phoneHtml = sz.contact_phone
        ? `<div style="margin-top: 4px; font-size: 11px; color: #344054;">📞 <a href="tel:${sz.contact_phone}" style="color: #007F78; text-decoration: underline; font-weight: 600;">${sz.contact_phone}</a></div>`
        : '';

      marker.bindPopup(`
        <div style="font-family: inherit; font-size: 12px; color: #101828; min-width: 210px; max-width: 270px; line-height: 1.4;">
          <div style="display: flex; align-items: center; justify-content: space-between; gap: 4px; margin-bottom: 5px;">
            ${verifiedBadge}
            ${opStatus}
          </div>
          <div style="font-weight: 800; font-size: 13px; margin: 3px 0 2px; color: #101828;">${sz.name}</div>
          <div style="font-size: 11px; color: #667085; text-transform: capitalize; margin-bottom: 3px;">Facility: ${sz.facility_type.replace('_', ' ')}</div>
          <div style="color: #475467; font-size: 11px;">${sz.address}</div>
          ${distText}
          ${capacityHtml}
          ${phoneHtml}
          <div style="margin-top: 6px; padding-top: 4px; border-top: 1px solid #E2E8F0; font-size: 9px; color: #98A2B3;">
            Registry: ${sz.source_name || 'Official Authority'}
          </div>
        </div>
      `);
      marker.addTo(layers);
    });

    // C. Plot User Location if consented
    if (userLocation) {
      const userPin = L.divIcon({
        className: 'user-pin',
        html: `
          <div style="
            width: 20px;
            height: 20px;
            background: rgba(23, 92, 211, 0.25);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            border: 2px solid white;
            box-shadow: 0 0 10px rgba(23, 92, 211, 0.5);
          ">
            <div style="width: 10px; height: 10px; background: #175CD3; border-radius: 50%;"></div>
          </div>
        `,
        iconSize: [20, 20],
        iconAnchor: [10, 10],
        popupAnchor: [0, -10]
      });

      const marker = L.marker([userLocation.lat, userLocation.lng], { icon: userPin });
      marker.bindPopup(`
        <div style="font-family: inherit; font-size: 12px; color: #101828; line-height: 1.4;">
          <strong style="color: #175CD3;">Your Consented Position</strong><br/>
          <span style="font-size: 11px; color: #667085;">Retained only in browser memory. Used solely to estimate straight-line distances to shelters.</span>
        </div>
      `);
      marker.addTo(layers);
    }
  }, [alerts, safeZones, userLocation]);

  // Zoom Interactions
  const handleZoomIn = () => {
    if (mapInstanceRef.current && !tileError) {
      mapInstanceRef.current.zoomIn();
    }
  };

  const handleZoomOut = () => {
    if (mapInstanceRef.current && !tileError) {
      mapInstanceRef.current.zoomOut();
    }
  };

  const areaName = area ? `${area.name}, ${area.state_region}` : t.location;

  return (
    <div className="page-shell">
      <section className="page-intro">
        <div>
          <div className="eyebrow">
            <Icon name="location" size={14} />
            {areaName}
          </div>
          <h1>{t.explore}</h1>
          <p>{t.exploreBody}</p>
        </div>
      </section>

      <div className="conditions-layout">
        <section className="map-card" aria-labelledby="map-heading">
          <div className="map-card-head">
            <div>
              <span className="kicker">OPENSTREETMAP</span>
              <h2 id="map-heading">{t.explore}</h2>
            </div>
            <div className="map-tools">
              <button
                type="button"
                onClick={handleZoomIn}
                aria-label={t.zoomIn}
                disabled={tileError}
                title={t.zoomIn}
              >
                <Icon name="plus" />
              </button>
              <span>{tileError ? '—' : zoomLevel}</span>
              <button
                type="button"
                onClick={handleZoomOut}
                aria-label={t.zoomOut}
                disabled={tileError}
                title={t.zoomOut}
              >
                <Icon name="minus" />
              </button>
            </div>
          </div>

          <div className="map-frame relative">
            {tileError ? (
              <div className="flex flex-col items-center justify-center h-full p-8 text-center bg-[#F8FAFC]">
                <div className="size-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-3">
                  <Icon name="alert" size={24} />
                </div>
                <h3 className="text-base font-bold text-[#101828] mb-1">{t.mapUnavailable}</h3>
                <p className="text-xs text-[#667085] max-w-md mb-4">{t.mapUnavailableBody}</p>
                <a href="#shelters-heading" className="primary-button text-xs">
                  View Designated Shelter Directory Below
                </a>
              </div>
            ) : (
              <div
                ref={mapContainerRef}
                className="h-full w-full"
                style={{ minHeight: '420px' }}
              />
            )}

            {!tileError && (
              <div className="map-legend">
                <strong>{t.legend}</strong>
                <span>
                  <i className="dot teal" />
                  {t.shelter}
                </span>
                <span>
                  <i className="dot red" />
                  {t.hospital} / Hazard
                </span>
                {userLocation && (
                  <span>
                    <i className="dot blue" />
                    {t.useLocation || 'Your Location'}
                  </span>
                )}
              </div>
            )}
          </div>

          <p className="map-disclaimer">
            <Icon name="info" size={15} />
            {t.mapNote}
          </p>
        </section>

        <ActionPlan t={t} />
      </div>

      <ShelterList safeZones={safeZones} t={t} />
      <SourcePanel t={t} sources={sources} />
    </div>
  );
};

export default ConditionsPage;
