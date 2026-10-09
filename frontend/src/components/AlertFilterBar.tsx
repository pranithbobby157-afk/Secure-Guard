import React from 'react';
import { Filter, Search } from 'lucide-react';

interface AlertFilterBarProps {
  selectedHazard: string;
  onSelectHazard: (hazard: string) => void;
  selectedSeverity: string;
  onSelectSeverity: (severity: string) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  totalCount: number;
}

export const AlertFilterBar: React.FC<AlertFilterBarProps> = ({
  selectedHazard,
  onSelectHazard,
  selectedSeverity,
  onSelectSeverity,
  searchQuery,
  onSearchChange,
  totalCount
}) => {
  return (
    <div className="filter-bar glass-panel">
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#94a3b8', fontSize: '0.82rem', fontWeight: 600 }}>
          <Filter size={15} />
          <span>Hazards:</span>
        </div>
        <div className="chip-group">
          {['all', 'cyclone', 'waterlogging', 'heavy_rain'].map((hz) => (
            <button
              key={hz}
              className={`filter-chip ${selectedHazard === hz ? 'active' : ''}`}
              onClick={() => onSelectHazard(hz)}
            >
              {hz === 'all' ? 'All Types' : hz.replace('_', ' ').toUpperCase()}
            </button>
          ))}
        </div>

        <div style={{ height: '18px', width: '1px', background: 'rgba(255,255,255,0.1)', margin: '0 0.25rem' }} />

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#94a3b8', fontSize: '0.82rem', fontWeight: 600 }}>
          <span>Severity:</span>
        </div>
        <div className="chip-group">
          {['all', 'critical', 'warning', 'watch'].map((sev) => (
            <button
              key={sev}
              className={`filter-chip ${selectedSeverity === sev ? 'active' : ''}`}
              onClick={() => onSelectSeverity(sev)}
            >
              {sev === 'all' ? 'All Levels' : sev.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative' }}>
          <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
          <input
            type="text"
            placeholder="Search affected areas..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            style={{
              padding: '0.4rem 0.75rem 0.4rem 2rem',
              borderRadius: '9999px',
              border: '1px solid var(--border-subtle)',
              background: 'rgba(15, 23, 42, 0.7)',
              color: 'white',
              fontSize: '0.82rem',
              outline: 'none',
              width: '180px'
            }}
          />
        </div>
        <span style={{ fontSize: '0.76rem', color: '#94a3b8', fontWeight: 600 }}>
          Showing <strong>{totalCount}</strong> notices
        </span>
      </div>
    </div>
  );
};
