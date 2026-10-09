import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { Alert, Area, SafeZone } from '../types';
import { MapPin, Shield, Layers, Navigation, Info, List, Map as MapIcon } from 'lucide-react';

interface InteractiveMapProps {
  area: Area | undefined;
  alerts: Alert[];
  safeZones: SafeZone[];
  userLocation: { lat: number; lng: number } | null;
  onSelectSafeZone?: (sz: SafeZone) => void;
}

export const InteractiveMap: React.FC<InteractiveMapProps> = ({
  area,
  alerts,
  safeZones,
  userLocation,
  onSelectSafeZone
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const layerGroupRef = useRef<L.LayerGroup | null>(null);
  const [viewMode, setViewMode] = useState<'map' | 'list'>('map');

  // Initialize map once
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const initialLat = area?.center_lat || 13.0827;
      const initialLng = area?.center_lng || 80.2707;
      const initialZoom = area?.default_zoom || 12;

      const map = L.map(mapContainerRef.current, {
        center: [initialLat, initialLng],
        zoom: initialZoom,
        zoomControl: true
      });

      // Dark style tile layer from CartoDB or standard OSM
      L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
        maxZoom: 19
      }).addTo(map);

      layerGroupRef.current = L.layerGroup().addTo(map);
      mapInstanceRef.current = map;
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Pan to area when area changes
  useEffect(() => {
    if (mapInstanceRef.current && area) {
      mapInstanceRef.current.setView([area.center_lat, area.center_lng], area.default_zoom);
    }
  }, [area]);

  // Update map markers whenever alerts, safeZones or userLocation change
  useEffect(() => {
    if (!mapInstanceRef.current || !layerGroupRef.current) return;

    const layers = layerGroupRef.current;
    layers.clearLayers();

    // 1. Plot Alert Hazard Points / Circles
    alerts.forEach((alert) => {
      if (alert.lat && alert.lng) {
        const isCritical = alert.severity === 'critical';
        const color = isCritical ? '#ef4444' : '#f59e0b';
        const radius = isCritical ? 2400 : 1600;

        // Danger zone radius
        const circle = L.circle([alert.lat, alert.lng], {
          color: color,
          fillColor: color,
          fillOpacity: 0.18,
          radius: radius,
          weight: 2,
          dashArray: '4, 4'
        });

        circle.bindPopup(`
          <div style="font-family: sans-serif; color: #0f172a; min-width: 180px;">
            <div style="font-size: 11px; font-weight: bold; text-transform: uppercase; color: ${color};">
              ⚠️ ${alert.severity.toUpperCase()} HAZARD ZONE
            </div>
            <div style="font-size: 13px; font-weight: bold; margin: 4px 0;">${alert.title}</div>
            <div style="font-size: 11px; color: #475569;">${alert.description_original.substring(0, 100)}...</div>
          </div>
        `);
        circle.addTo(layers);
      }
    });

    // 2. Plot Safe Zones (Designated Relief Centres & Shelters)
    safeZones.forEach((sz) => {
      // Custom green shelter icon using DivIcon
      const shelterIcon = L.divIcon({
        className: 'custom-shelter-marker',
        html: `
          <div style="
            background: #10b981;
            color: white;
            width: 32px;
            height: 32px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 0 14px rgba(16, 185, 129, 0.6);
            border: 2px solid white;
          ">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            </svg>
          </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 16]
      });

      const marker = L.marker([sz.latitude, sz.longitude], { icon: shelterIcon });

      const distText = sz.distance_km != null ? `Approx. ${sz.distance_km} km away` : 'Distance unavailable';
      const contactText = sz.contact_phone ? `Phone: <a href="tel:${sz.contact_phone}">${sz.contact_phone}</a>` : '';

      marker.bindPopup(`
        <div style="font-family: sans-serif; color: #0f172a; min-width: 220px;">
          <div style="font-size: 10px; font-weight: bold; text-transform: uppercase; color: #059669;">
            🛡️ OFFICIAL DESIGNATED SHELTER
          </div>
          <div style="font-size: 13px; font-weight: bold; margin: 4px 0;">${sz.name}</div>
          <div style="font-size: 11px; color: #334155; margin-bottom: 4px;">${sz.address}</div>
          <div style="font-size: 11px; font-weight: 600; color: #0284c7; margin-bottom: 4px;">📍 ${distText}</div>
          ${sz.capacity_notes ? `<div style="font-size: 10px; color: #64748b; background: #f1f5f9; padding: 4px; border-radius: 4px; margin-bottom: 4px;">${sz.capacity_notes}</div>` : ''}
          ${contactText ? `<div style="font-size: 11px; color: #334155; margin-bottom: 4px;">${contactText}</div>` : ''}
          <div style="font-size: 9px; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 4px; margin-top: 4px;">
            Verified by: ${sz.source_name}
          </div>
        </div>
      `);

      marker.on('click', () => {
        if (onSelectSafeZone) onSelectSafeZone(sz);
      });

      marker.addTo(layers);
    });

    // 3. Plot User Location if Consented
    if (userLocation) {
      const userIcon = L.divIcon({
        className: 'custom-user-marker',
        html: `
          <div style="
            background: #0284c7;
            color: white;
            width: 20px;
            height: 20px;
            border-radius: 50%;
            box-shadow: 0 0 18px #38bdf8;
            border: 3px solid white;
            animation: pulse-ring 2s infinite;
          "></div>
        `,
        iconSize: [20, 20],
        iconAnchor: [10, 10]
      });

      const userMarker = L.marker([userLocation.lat, userLocation.lng], { icon: userIcon });
      userMarker.bindPopup(`
        <div style="font-family: sans-serif; color: #0f172a;">
          <strong>Your Consented Position</strong><br/>
          <span style="font-size: 11px; color: #64748b;">Stored locally in browser only.</span>
        </div>
      `);
      userMarker.addTo(layers);
    }
  }, [alerts, safeZones, userLocation, onSelectSafeZone]);

  return (
    <div style={{ marginTop: '0.5rem' }}>
      {/* View Mode Toggle (Map vs Accessible List) */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.65rem' }}>
        <h3 style={{ fontSize: '1.1rem', color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Layers size={18} color="#38bdf8" />
          Location & Shelter Map
        </h3>

        <div style={{ display: 'flex', gap: '0.35rem' }}>
          <button
            className={`filter-chip ${viewMode === 'map' ? 'active' : ''}`}
            onClick={() => setViewMode('map')}
          >
            <MapIcon size={13} style={{ display: 'inline', marginRight: 4 }} /> Map View
          </button>
          <button
            className={`filter-chip ${viewMode === 'list' ? 'active' : ''}`}
            onClick={() => setViewMode('list')}
          >
            <List size={13} style={{ display: 'inline', marginRight: 4 }} /> Accessible List
          </button>
        </div>
      </div>

      {viewMode === 'map' ? (
        <>
          <div ref={mapContainerRef} className="map-container" />

          {/* Accessible Legend */}
          <div className="map-legend glass-panel">
            <div className="legend-item">
              <span className="legend-marker" style={{ background: '#ef4444', boxShadow: '0 0 8px #ef4444' }} />
              <span>Extreme Hazard Zone</span>
            </div>
            <div className="legend-item">
              <span className="legend-marker" style={{ background: '#f59e0b', boxShadow: '0 0 8px #f59e0b' }} />
              <span>Waterlogging Inundation</span>
            </div>
            <div className="legend-item">
              <span className="legend-marker" style={{ background: '#10b981', boxShadow: '0 0 8px #10b981' }} />
              <span>Designated Relief Shelter</span>
            </div>
            {userLocation && (
              <div className="legend-item">
                <span className="legend-marker" style={{ background: '#0284c7', boxShadow: '0 0 8px #0284c7' }} />
                <span>Your Current Location</span>
              </div>
            )}
          </div>
        </>
      ) : (
        /* Accessible List Alternative for screen readers and low-bandwidth */
        <div className="glass-panel" style={{ padding: '1.25rem' }}>
          <h4 style={{ fontSize: '0.95rem', marginBottom: '0.75rem', color: '#f8fafc' }}>
            Text Alternative for Map Features
          </h4>
          <p style={{ fontSize: '0.82rem', color: '#94a3b8', marginBottom: '1rem' }}>
            Listing all designated relief centres in {area?.name || 'this area'}:
          </p>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {safeZones.map((sz) => (
              <li
                key={sz.id}
                style={{
                  borderBottom: '1px solid var(--border-subtle)',
                  padding: '0.75rem 0',
                  fontSize: '0.86rem'
                }}
              >
                <strong style={{ color: '#34d399' }}>{sz.name}</strong> ({sz.facility_type})<br />
                <span style={{ color: '#cbd5e1' }}>{sz.address}</span><br />
                <span style={{ color: '#94a3b8', fontSize: '0.78rem' }}>
                  Distance: {sz.distance_km != null ? `~${sz.distance_km} km` : 'Coordinates required'} • Contact: {sz.contact_phone || 'GCC Helpdesk'}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};
