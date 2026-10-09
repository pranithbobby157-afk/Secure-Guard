import React from 'react';
import { Alert, Area } from '../types';
import { AlertOctagon, AlertTriangle, CheckCircle2, ExternalLink, Clock } from 'lucide-react';

interface EmergencyBannerProps {
  criticalAlert: Alert | null;
  area: Area | undefined;
  lastSyncTime: string;
}

export const EmergencyBanner: React.FC<EmergencyBannerProps> = ({
  criticalAlert,
  area,
  lastSyncTime
}) => {
  if (criticalAlert) {
    const isCritical = criticalAlert.severity === 'critical';
    const bannerClass = isCritical ? 'emergency-banner critical' : 'emergency-banner warning';
    const badgeClass = isCritical ? 'banner-badge badge-critical' : 'banner-badge badge-warning';

    return (
      <section aria-label="Active Emergency Notice" className={bannerClass}>
        <div className="banner-header">
          <div className="banner-title-group">
            <span className={badgeClass}>
              {isCritical ? <AlertOctagon size={16} /> : <AlertTriangle size={16} />}
              {criticalAlert.severity.toUpperCase()} THREAT
            </span>
            <span style={{ fontSize: '0.82rem', color: '#94a3b8' }}>
              Affected: <strong>{criticalAlert.area?.name || area?.name}</strong>
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.78rem', color: '#94a3b8' }}>
            <Clock size={14} />
            <span>Issued: {new Date(criticalAlert.issued_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
          </div>
        </div>

        <h2 style={{ fontSize: '1.35rem', marginBottom: '0.45rem', color: '#ffffff' }}>
          {criticalAlert.title}
        </h2>
        <p style={{ color: '#cbd5e1', fontSize: '0.95rem', marginBottom: '0.85rem', lineHeight: 1.45 }}>
          {criticalAlert.description_original}
        </p>

        {criticalAlert.instruction_original && (
          <div className="instruction-highlight">
            <strong>Urgent Authority Instruction:</strong> {criticalAlert.instruction_original}
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.85rem', flexWrap: 'wrap', gap: '0.5rem', fontSize: '0.78rem' }}>
          <span style={{ color: '#94a3b8' }}>
            Source: <strong>{criticalAlert.source?.name}</strong> • Verification:{' '}
            <span style={{ textTransform: 'uppercase', color: criticalAlert.is_simulated ? '#f87171' : '#34d399' }}>
              {criticalAlert.verification_status}
            </span>
          </span>
          {criticalAlert.source_url && (
            <a
              href={criticalAlert.source_url}
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: '#38bdf8', display: 'inline-flex', alignItems: 'center', gap: '0.3rem', textDecoration: 'none' }}
            >
              Official Bulletin <ExternalLink size={13} />
            </a>
          )}
        </div>
      </section>
    );
  }

  // Clear / No active warnings state
  return (
    <section aria-label="No Active Alert Status" className="emergency-banner clear">
      <div className="banner-header">
        <div className="banner-title-group">
          <span className="banner-badge badge-clear">
            <CheckCircle2 size={16} />
            NO ACTIVE ALERTS
          </span>
          <span style={{ fontSize: '0.82rem', color: '#94a3b8' }}>
            Region: <strong>{area?.name || 'Selected Jurisdiction'}</strong>
          </span>
        </div>
        <span style={{ fontSize: '0.78rem', color: '#64748b' }}>Last checked {lastSyncTime}</span>
      </div>

      <h2 style={{ fontSize: '1.2rem', marginBottom: '0.35rem', color: '#ffffff' }}>
        No Official Extreme Weather Bulletins Active
      </h2>
      <p style={{ color: '#94a3b8', fontSize: '0.88rem', lineHeight: 1.45 }}>
        No severe cyclone or flash flood warnings were returned by the connected official meteorological sources for this sector as of now.
      </p>

      <div style={{ marginTop: '0.65rem', padding: '0.6rem 0.85rem', background: 'rgba(16, 185, 129, 0.08)', borderRadius: '6px', fontSize: '0.78rem', color: '#a7f3d0' }}>
        ⚠️ <em>Safety Principle:</em> Absence of active warnings does not guarantee absolute safety. Sudden local water stagnation, high tides, or fallen powerlines may be unreported. Always follow instructions from local police and disaster responders.
      </div>
    </section>
  );
};
