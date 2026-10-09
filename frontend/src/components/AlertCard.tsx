import React, { useState, useEffect } from 'react';
import { Alert, SupportedLanguage, Translation } from '../types';
import { api } from '../services/api';
import {
  AlertTriangle,
  AlertOctagon,
  Clock,
  ExternalLink,
  Globe,
  ChevronDown,
  ChevronUp,
  ShieldCheck,
  Building,
  Info
} from 'lucide-react';

interface AlertCardProps {
  alert: Alert;
  currentLanguage: SupportedLanguage;
}

export const AlertCard: React.FC<AlertCardProps> = ({ alert, currentLanguage }) => {
  const [translation, setTranslation] = useState<Translation | null>(null);
  const [loadingTrans, setLoadingTrans] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    let isMounted = true;
    if (currentLanguage !== alert.original_language) {
      setLoadingTrans(true);
      api
        .getTranslation(alert.id, currentLanguage)
        .then((res) => {
          if (isMounted) setTranslation(res);
        })
        .catch(() => {
          if (isMounted) setTranslation(null);
        })
        .finally(() => {
          if (isMounted) setLoadingTrans(false);
        });
    } else {
      setTranslation(null);
      setLoadingTrans(false);
    }
    return () => {
      isMounted = false;
    };
  }, [alert.id, currentLanguage, alert.original_language]);

  const severityClass =
    alert.severity === 'critical' ? 'critical' : alert.severity === 'warning' ? 'warning' : 'watch';

  return (
    <article className={`alert-card glass-panel ${severityClass}`}>
      {/* Top Row: Tags & Timestamps */}
      <div className="card-top-row">
        <div className="tag-list">
          <span
            className="banner-badge"
            style={{
              background:
                alert.severity === 'critical'
                  ? 'var(--danger)'
                  : alert.severity === 'warning'
                  ? 'var(--warning)'
                  : 'var(--watch)',
              color: alert.severity === 'warning' ? '#1e1b4b' : 'white',
              fontSize: '0.7rem',
              padding: '0.2rem 0.55rem'
            }}
          >
            {alert.severity === 'critical' ? (
              <AlertOctagon size={12} />
            ) : (
              <AlertTriangle size={12} />
            )}
            {alert.severity.toUpperCase()}
          </span>

          <span
            className={alert.is_simulated ? 'tag-simulated' : 'tag-verified'}
            title={
              alert.is_simulated
                ? 'This record is part of a hackathon simulation scenario'
                : 'Issued by verified meteorological authority'
            }
          >
            {alert.is_simulated ? 'SIMULATION — NOT LIVE WARNING' : 'OFFICIAL SOURCE'}
          </span>

          <span style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: 500 }}>
            📍 {alert.area?.name || 'Coastal Zone'}
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.74rem', color: '#94a3b8' }}>
          <Clock size={13} />
          <span>Issued {new Date(alert.issued_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
        </div>
      </div>

      {/* Title */}
      <h3 className="alert-card-title">{alert.title}</h3>

      {/* Side-by-Side Dual Language Display (Crucial Safety Feature) */}
      {currentLanguage !== alert.original_language ? (
        <div className="dual-text-box">
          {/* Left Column: Original Official Text */}
          <div>
            <div className="text-col-header">
              <Globe size={13} color="#94a3b8" />
              <span>Original Notice ({alert.original_language.toUpperCase()})</span>
            </div>
            <div className="text-col-content">{alert.description_original}</div>
          </div>

          {/* Right Column: Translated Text */}
          <div>
            <div className="text-col-header" style={{ color: '#38bdf8' }}>
              <Globe size={13} color="#38bdf8" />
              <span>
                Translated ({currentLanguage.toUpperCase()}){' '}
                {loadingTrans && <span style={{ fontSize: '0.65rem' }}>[Translating...]</span>}
              </span>
            </div>
            <div className="text-col-content" style={{ color: '#e0f2fe' }}>
              {translation ? (
                translation.translated_description
              ) : loadingTrans ? (
                <em style={{ color: '#64748b' }}>Processing linguistic synthesis...</em>
              ) : (
                <em style={{ color: '#94a3b8' }}>
                  Translation unavailable for this language. Showing original above.
                </em>
              )}
            </div>
          </div>
        </div>
      ) : (
        <p style={{ color: '#cbd5e1', fontSize: '0.92rem', marginBottom: '0.75rem', lineHeight: 1.45 }}>
          {alert.description_original}
        </p>
      )}

      {/* Official Instructions */}
      {alert.instruction_original && (
        <div className="instruction-highlight">
          <strong>Mandatory Instruction:</strong> {alert.instruction_original}
        </div>
      )}

      {/* Expandable Technical Details Drawer */}
      {isExpanded && (
        <div style={{ marginTop: '0.85rem', paddingTop: '0.75rem', borderTop: '1px dashed var(--border-subtle)', fontSize: '0.8rem', color: '#94a3b8' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <div>
              <strong>External ID:</strong> {alert.external_id || 'GCC-N/A'}
            </div>
            <div>
              <strong>Effective Start:</strong>{' '}
              {alert.effective_at ? new Date(alert.effective_at).toLocaleString() : 'Immediate'}
            </div>
            <div>
              <strong>Expiry Horizon:</strong>{' '}
              {alert.expires_at ? new Date(alert.expires_at).toLocaleString() : 'Until Further Notice'}
            </div>
            <div>
              <strong>Linguistic Provider:</strong>{' '}
              {translation?.provider || 'Native Text Preservation'}
            </div>
          </div>
        </div>
      )}

      {/* Card Footer: Attribution & Expand Button */}
      <div className="card-footer-info">
        <div className="source-attribution">
          <Building size={14} color="#94a3b8" />
          <span>
            {alert.source?.name} ({alert.source?.authority_level.replace('_', ' ')})
          </span>
          {alert.source_url && (
            <a
              href={alert.source_url}
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: '#38bdf8', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.2rem', marginLeft: '0.4rem' }}
            >
              Verify Source <ExternalLink size={11} />
            </a>
          )}
        </div>

        <button
          onClick={() => setIsExpanded(!isExpanded)}
          style={{
            background: 'transparent',
            border: 'none',
            color: '#94a3b8',
            fontSize: '0.75rem',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.25rem'
          }}
        >
          {isExpanded ? (
            <>
              Hide Details <ChevronUp size={14} />
            </>
          ) : (
            <>
              Metadata <ChevronDown size={14} />
            </>
          )}
        </button>
      </div>
    </article>
  );
};
