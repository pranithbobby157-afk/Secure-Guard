import React from 'react';
import { Radio, ShieldAlert, CheckCircle, WifiOff } from 'lucide-react';

interface DemoScenarioBarProps {
  onSelectScenario: (scenario: string) => void;
  activeScenario: string;
}

export const DemoScenarioBar: React.FC<DemoScenarioBarProps> = ({
  onSelectScenario,
  activeScenario
}) => {
  return (
    <aside aria-label="Hackathon Demo Scenarios" className="demo-control-bar">
      <div className="demo-title">
        <Radio size={16} color="#818cf8" />
        <span>Hackathon Presentation Scenarios:</span>
      </div>

      <div className="demo-btn-group">
        <button
          className={`btn-demo ${activeScenario === 'cyclone_active' ? 'active' : ''}`}
          onClick={() => onSelectScenario('cyclone_active')}
          title="Demo active cyclone alert and inundation warnings"
        >
          <ShieldAlert size={13} style={{ display: 'inline', marginRight: 4 }} />
          1. Cyclone Red Alert
        </button>

        <button
          className={`btn-demo ${activeScenario === 'all_clear' ? 'active' : ''}`}
          onClick={() => onSelectScenario('all_clear')}
          title="Demo no-alerts state with critical safety disclaimers"
        >
          <CheckCircle size={13} style={{ display: 'inline', marginRight: 4 }} />
          2. All Clear (Disclaimers)
        </button>

        <button
          className={`btn-demo ${activeScenario === 'source_outage' ? 'active' : ''}`}
          onClick={() => onSelectScenario('source_outage')}
          title="Demo degraded feed resilience (stale-data banner)"
        >
          <WifiOff size={13} style={{ display: 'inline', marginRight: 4 }} />
          3. Source Outage (Stale State)
        </button>
      </div>
    </aside>
  );
};
