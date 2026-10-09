import React from 'react';
import { SafeZone } from '../types';
import { Shield, MapPin, Phone, CheckCircle2, AlertCircle } from 'lucide-react';

interface SafeZoneSectionProps {
  safeZones: SafeZone[];
  userLocation: { lat: number; lng: number } | null;
}

export const SafeZoneSection: React.FC<SafeZoneSectionProps> = ({
  safeZones,
  userLocation: _userLocation
}) => {
  return (
    <section aria-label="Designated Relief Shelters" style={{ marginTop: '1.5rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.85rem' }}>
        <h3 style={{ fontSize: '1.15rem', color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Shield size={20} color="#34d399" />
          Designated Shelters & Assistance Centers
        </h3>
        <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>
          {safeZones.length} verified facilities
        </span>
      </div>

      <div style={{ marginBottom: '1rem', padding: '0.65rem 0.95rem', background: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.25)', borderRadius: '8px', fontSize: '0.78rem', color: '#a7f3d0' }}>
        <AlertCircle size={14} style={{ display: 'inline', marginRight: 4, verticalAlign: 'middle' }} />
        <strong>Traveller Notice:</strong> Distances shown are straight-line approximations. Listing here does not guarantee that roads to the shelter are free of floodwaters or that capacity is available. Do not cross flooded streets.
      </div>

      {safeZones.length === 0 ? (
        <div className="glass-panel" style={{ padding: '1.5rem', textAlign: 'center', color: '#94a3b8' }}>
          No designated shelter records are currently loaded for this selected district.
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '0.85rem' }}>
          {safeZones.map((sz) => (
            <div key={sz.id} className="safe-zone-card glass-panel">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem', marginBottom: '0.35rem' }}>
                <span
                  style={{
                    fontSize: '0.68rem',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    color: '#34d399',
                    letterSpacing: '0.05em'
                  }}
                >
                  {sz.facility_type.replace('_', ' ')}
                </span>

                {sz.distance_km != null ? (
                  <span className="sz-distance-badge">
                    <MapPin size={11} /> ~{sz.distance_km} km away
                  </span>
                ) : (
                  <span style={{ fontSize: '0.72rem', color: '#64748b' }}>
                    Enable GPS for distance
                  </span>
                )}
              </div>

              <h4 className="sz-name">{sz.name}</h4>
              <div className="sz-address">
                <MapPin size={14} style={{ flexShrink: 0, marginTop: 2, color: '#94a3b8' }} />
                <span>{sz.address}</span>
              </div>

              {sz.capacity_notes && (
                <div style={{ fontSize: '0.76rem', color: '#cbd5e1', background: 'rgba(255,255,255,0.04)', padding: '0.35rem 0.55rem', borderRadius: '4px', marginBottom: '0.5rem' }}>
                  {sz.capacity_notes}
                </div>
              )}

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '0.5rem', fontSize: '0.74rem', color: '#94a3b8', borderTop: '1px solid var(--border-subtle)', paddingTop: '0.5rem' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <CheckCircle2 size={12} color="#34d399" />
                  {sz.source_name.substring(0, 24)}...
                </span>

                {sz.contact_phone && (
                  <a
                    href={`tel:${sz.contact_phone}`}
                    style={{
                      color: '#38bdf8',
                      textDecoration: 'none',
                      fontWeight: 600,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.25rem'
                    }}
                  >
                    <Phone size={12} /> {sz.contact_phone}
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
};
