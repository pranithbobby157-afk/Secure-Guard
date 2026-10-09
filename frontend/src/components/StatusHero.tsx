import React from 'react';
import { Copy } from '../i18n/messages';
import { Icon, IconName } from './Icon';
import { Alert, Area, SystemStatus } from '../types';

export type Scenario = 'default' | 'cyclone' | 'clear' | 'outage';

interface StatusHeroProps {
  t: Copy;
  scenario: Scenario;
  status: SystemStatus | null;
  topAlert?: Alert;
  currentArea?: Area;
  lastSyncTime?: string;
}

export const StatusHero: React.FC<StatusHeroProps> = ({
  t,
  scenario,
  status,
  topAlert,
  currentArea,
  lastSyncTime = 'just now'
}) => {
  // If top alert is critical and not in outage/clear scenario
  const hasCriticalAlert = topAlert && topAlert.severity === 'critical';

  let tone: 'neutral' | 'critical' | 'warning' | 'clear' = 'neutral';
  let label: string = t.checked;
  let title: string = t.defaultTitle;
  let body: string = t.defaultBody;
  let icon: IconName = 'info';
  let isSimulated = true;

  if (scenario === 'outage' || status?.status === 'degraded' || status?.status === 'unavailable') {
    tone = 'warning';
    label = `${t.outage} · ${t.simulation}`;
    title = t.outageTitle;
    body = t.outageBody;
    icon = 'cloud';
    isSimulated = true;
  } else if (scenario === 'clear' || (!topAlert && scenario !== 'cyclone')) {
    tone = 'clear';
    label = `${t.simulation} · ${t.clearDemo}`;
    title = t.clearTitle;
    body = t.clearBody;
    icon = 'check';
    isSimulated = true;
  } else if (scenario === 'cyclone') {
    tone = 'critical';
    label = `${t.critical} · ${topAlert?.is_simulated ? t.simulation : 'OFFICIAL ALERT'}`;
    title = topAlert ? topAlert.title : t.alertTitle;
    body = topAlert?.instruction_original || t.alertAction;
    icon = 'warning';
    isSimulated = topAlert?.is_simulated ?? true;
  } else {
    // Default scenario: baseline state with active alerts
    tone = hasCriticalAlert ? 'critical' : 'neutral';
    label = hasCriticalAlert
      ? `${t.critical} · ${topAlert?.is_simulated ? t.simulation : 'OFFICIAL ALERT'}`
      : t.checked;
    title = topAlert ? topAlert.title : t.defaultTitle;
    body = topAlert?.instruction_original || t.defaultBody;
    icon = hasCriticalAlert ? 'warning' : 'info';
    isSimulated = topAlert?.is_simulated ?? true;
  }

  const areaName = currentArea ? `${currentArea.name}, ${currentArea.state_region}` : t.location;
  const timeDisplay = topAlert
    ? new Date(topAlert.issued_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' IST'
    : `${lastSyncTime} IST`;

  return (
    <section className={`status-hero ${tone}`} aria-live="polite">
      <span className="hero-icon">
        <Icon name={icon} size={26} />
      </span>
      <div className="min-w-0 flex-1">
        <div className="hero-label">{label}</div>
        <h2>{title}</h2>
        <p>{body}</p>

        {(scenario === 'cyclone' || hasCriticalAlert) && (
          <div className="hero-meta">
            <span>
              <Icon name="location" size={15} />
              {areaName}
            </span>
            <span>
              <Icon name="clock" size={15} />
              {timeDisplay}
            </span>
          </div>
        )}
      </div>

      <span className="source-state">
        <Icon name="info" size={15} />
        {isSimulated ? t.unverified : 'Authoritative Source'}
      </span>
    </section>
  );
};
