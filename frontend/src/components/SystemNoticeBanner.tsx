import React from 'react';
import { AlertTriangle, Clock, RefreshCw } from 'lucide-react';
import { SystemStatus } from '../types';

interface SystemNoticeBannerProps {
  status: SystemStatus | null;
  hasStaleAlerts: boolean;
  onRefreshFeed: () => void;
  isRefreshing: boolean;
}

export const SystemNoticeBanner: React.FC<SystemNoticeBannerProps> = ({
  status,
  hasStaleAlerts,
  onRefreshFeed,
  isRefreshing
}) => {
  const isDegraded = status?.status === 'degraded' || status?.status === 'unavailable';

  if (!isDegraded && !hasStaleAlerts) {
    return null;
  }

  return (
    <aside aria-label="System Advisory" className="system-warning-banner">
      <AlertTriangle size={18} strokeWidth={2.5} />
      <span>
        <strong>Notice:</strong> External Meteorological Feed is currently{' '}
        <span style={{ textDecoration: 'underline' }}>{status?.status || 'degraded'}</span>.
        Showing cached alerts retrieved from official archives. This does not indicate absence of new risks.
      </span>
      <button
        onClick={onRefreshFeed}
        disabled={isRefreshing}
        style={{
          marginLeft: '0.75rem',
          background: 'rgba(0,0,0,0.2)',
          border: '1px solid rgba(251, 191, 36, 0.4)',
          color: '#fbbf24',
          borderRadius: '4px',
          padding: '0.25rem 0.65rem',
          fontSize: '0.75rem',
          cursor: 'pointer',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.35rem'
        }}
      >
        <RefreshCw size={12} className={isRefreshing ? 'pulse-dot' : ''} />
        {isRefreshing ? 'Retrying...' : 'Retry Ingestion'}
      </button>
    </aside>
  );
};
