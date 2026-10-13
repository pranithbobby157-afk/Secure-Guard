import React, { useState } from 'react';
import { Alert, Area, SystemStatus } from '../types';
import { Copy, Language } from '../i18n/messages';
import { Icon } from './Icon';
import { Page } from './Header';
import { Scenario, StatusHero } from './StatusHero';
import { DemoControl } from './DemoControl';
import { AlertCard } from './AlertCard';
import { EmptyAlerts } from './EmptyAlerts';
import { ActionPlan } from './ActionPlan';
import { SourcePanel } from './SourcePanel';

interface DashboardProps {
  t: Copy;
  language: Language;
  scenario: Scenario;
  onSelectScenario: (s: Scenario) => void;
  navigate: (p: Page) => void;
  alerts: Alert[];
  currentArea?: Area;
  status: SystemStatus | null;
  lastSyncTime: string;
  isScenarioLoading?: boolean;
  searchQuery?: string;
}

export const Dashboard: React.FC<DashboardProps> = ({
  t,
  language,
  scenario,
  onSelectScenario,
  navigate,
  alerts,
  currentArea,
  status,
  lastSyncTime,
  isScenarioLoading,
  searchQuery = ''
}) => {
  const [hazardFilter, setHazardFilter] = useState('all');

  // Filter alerts by hazard category and search query
  const filteredAlerts = alerts.filter((alert) => {
    if (searchQuery && searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchText = `${alert.title} ${alert.description_original} ${alert.hazard_type} ${alert.severity}`.toLowerCase();
      if (!matchText.includes(q)) return false;
    }
    if (hazardFilter === 'all') return true;
    if (hazardFilter === 'cyclone') return alert.hazard_type === 'cyclone';
    if (hazardFilter === 'heavy_rain') return alert.hazard_type === 'heavy_rain';
    if (hazardFilter === 'flood')
      return alert.hazard_type === 'flood' || alert.hazard_type === 'waterlogging';
    if (hazardFilter === 'other')
      return (
        alert.hazard_type !== 'cyclone' &&
        alert.hazard_type !== 'heavy_rain' &&
        alert.hazard_type !== 'flood' &&
        alert.hazard_type !== 'waterlogging'
      );
    return true;
  });

  const topAlert = alerts.length > 0 ? alerts[0] : undefined;
  const areaName = currentArea ? `${currentArea.name}, ${currentArea.state_region}` : t.location;

  // Accurate source health & freshness computation (Phase 6)
  const isBackendAvailable = status !== null;
  const healthyCount = status?.sources_healthy_count ?? 0;
  const totalCount = status?.sources_total_count ?? 0;
  const anySourceDegraded = status?.sources.some((s) => s.health_status === 'degraded');
  const anySourceUnavailable = status?.sources.some((s) => s.health_status === 'unavailable');
  const hasStaleAlerts = filteredAlerts.some((a) => a.is_stale);

  // A feed degradation is triggered by real source outage or degradation, not bulletin age
  const isSourceOutage =
    scenario === 'outage' ||
    status?.status === 'degraded' ||
    status?.status === 'unavailable' ||
    anySourceDegraded ||
    anySourceUnavailable ||
    (totalCount > 0 && healthyCount < totalCount);

  let freshnessTitle = '';
  let freshnessSubtitle = '';
  let statusDotClass = 'status-dot';

  if (!isBackendAvailable) {
    // State A: Backend unavailable
    freshnessTitle = 'Backend API Unavailable';
    freshnessSubtitle = `Operating in offline cache mode · ${lastSyncTime} IST`;
    statusDotClass = 'status-dot neutral';
  } else if (isSourceOutage) {
    // State D/E: Actual source outage or degraded service
    const degradedSourceNames = status.sources
      .filter((s) => s.health_status !== 'healthy')
      .map((s) => s.name.split('(')[0].trim())
      .join(', ');
    freshnessTitle = `Degraded Feed (${healthyCount}/${totalCount} Sources Active)`;
    freshnessSubtitle = degradedSourceNames
      ? `${degradedSourceNames} outage · Advisory data may be stale`
      : 'Source feed degraded · Advisory data may be stale';
    statusDotClass = 'status-dot bg-[#DC6803]';
  } else if (
    status.mode === 'live_with_simulations' ||
    topAlert?.is_simulated ||
    status.mode !== 'live'
  ) {
    // State F: Demonstration or simulated data (all configured sources healthy)
    freshnessTitle = `Simulated Demonstration Feeds (${healthyCount}/${totalCount} Configured Sources Healthy)`;
    const timeFormatted = status.last_successful_refresh
      ? new Date(status.last_successful_refresh).toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit'
        })
      : lastSyncTime;
    freshnessSubtitle = hasStaleAlerts
      ? 'Demonstration records (sample bulletins >3h old) · Not live emergency feeds'
      : `Demonstration sync: ${timeFormatted} IST · Not live official emergency bulletins`;
    statusDotClass = 'status-dot bg-[#007F78]';
  } else if (status.mode === 'live' && healthyCount > 0 && healthyCount === totalCount) {
    // State C: Production live mode (only if verified live mode is active)
    freshnessTitle = `Feeds Connected (${healthyCount}/${totalCount} Sources Online)`;
    const timeFormatted = status.last_successful_refresh
      ? new Date(status.last_successful_refresh).toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit'
        })
      : lastSyncTime;
    freshnessSubtitle = `Verified sync: ${timeFormatted} IST`;
    statusDotClass = 'status-dot bg-[#079455]';
  } else {
    // State B: Configured but pending retrieval
    freshnessTitle = 'Feeds Configured · Pending Sync';
    freshnessSubtitle = `Last checked: ${lastSyncTime} IST`;
    statusDotClass = 'status-dot neutral';
  }

  return (
    <div className="page-shell">
      {/* Intro Header */}
      <section className="page-intro">
        <div>
          <div className="eyebrow">
            <Icon name="location" size={14} />
            {areaName}
          </div>
          <h1>{t.heading}</h1>
          <p>{t.intro}</p>
        </div>

        <button
          type="button"
          onClick={() => navigate('sources')}
          className="freshness text-start hover:border-[#007F78] transition-colors cursor-pointer"
          title="Click to view detailed feed health and source provenance"
        >
          <span className={statusDotClass} />
          <span>
            <strong>{freshnessTitle}</strong>
            <small>{freshnessSubtitle}</small>
          </span>
        </button>
      </section>

      {/* Primary Emergency Status Hero */}
      <StatusHero
        t={t}
        scenario={scenario}
        status={status}
        topAlert={topAlert}
        currentArea={currentArea}
        lastSyncTime={lastSyncTime}
      />

      {/* Demonstration Scenario Controls */}
      <DemoControl
        t={t}
        scenario={scenario}
        onSelectScenario={onSelectScenario}
        isLoading={isScenarioLoading}
      />

      {/* 01 / Alerts Section */}
      <section className="section-block" aria-labelledby="alerts-heading">
        <div className="section-heading">
          <div>
            <span className="kicker">01 / ALERTS</span>
            <h2 id="alerts-heading">{t.currentAlerts}</h2>
          </div>
          <span className="record-count">{filteredAlerts.length}</span>
        </div>

        {/* Filter Pills */}
        <div className="filter-row" aria-label={t.filters}>
          {[
            ['all', t.all],
            ['cyclone', t.cyclone],
            ['heavy_rain', t.rain],
            ['flood', t.flooding],
            ['other', t.other]
          ].map(([key, label]) => (
            <button
              type="button"
              key={key}
              className={hazardFilter === key ? 'selected' : ''}
              onClick={() => setHazardFilter(key)}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Alert Cards List */}
        {filteredAlerts.length > 0 ? (
          <div className="space-y-4">
            {filteredAlerts.map((alert) => (
              <AlertCard
                key={alert.id}
                alert={alert}
                t={t}
                language={language}
                areaName={areaName}
              />
            ))}
          </div>
        ) : (
          <EmptyAlerts t={t} scenario={scenario} />
        )}
      </section>

      {/* 02 / Local Conditions Teaser & Action Plan */}
      <section className="section-block grid gap-6 lg:grid-cols-[1.35fr_.65fr]">
        <div className="map-teaser">
          <div className="map-teaser-copy">
            <span className="kicker">02 / LOCAL CONDITIONS</span>
            <h2>{t.explore}</h2>
            <p>{t.exploreBody}</p>
            <button
              type="button"
              className="primary-button"
              onClick={() => navigate('map')}
            >
              {t.openMap}
              <Icon name="arrow" size={17} />
            </button>
          </div>

          <div className="mini-map" aria-hidden="true">
            <span className="map-grid" />
            <span className="map-marker one">
              <Icon name="building" size={16} />
            </span>
            <span className="map-marker two">
              <Icon name="hospital" size={16} />
            </span>
            <span className="map-marker user">
              <span />
            </span>
          </div>

          <p className="map-disclaimer">
            <Icon name="info" size={15} />
            {t.mapNote}
          </p>
        </div>

        <ActionPlan t={t} compact />
      </section>

      {/* 03 / Emergency Travel Toolkit */}
      <section className="section-block" aria-labelledby="toolkit-heading">
        <div className="section-heading">
          <div>
            <span className="kicker">03 / EMERGENCY TOOLKIT</span>
            <h2 id="toolkit-heading">Crisis Travel & Communication Tools</h2>
          </div>
          <span className="text-xs font-semibold text-[#667085]">
            4 Tools Available
          </span>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {/* Card 1: Route Check */}
          <button
            type="button"
            onClick={() => navigate('routes')}
            className="flex flex-col justify-between rounded-2xl border border-[#E2E8F0] bg-white p-5 text-start shadow-sm transition-all hover:border-[#007F78] hover:shadow-md"
          >
            <div>
              <span className="grid size-10 place-items-center rounded-xl bg-teal-50 text-[#007F78] mb-3">
                <Icon name="route" size={20} />
              </span>
              <h3 className="text-base font-extrabold text-[#101828]">Route Check</h3>
              <p className="mt-1 text-xs text-[#667085] leading-5">
                Assess travel corridors between Indian transit hubs against active cyclone and flood hazard polygons.
              </p>
            </div>
            <div className="mt-4 flex items-center gap-1 text-xs font-bold text-[#007F78]">
              <span>Check Corridor</span>
              <Icon name="arrow" size={14} />
            </div>
          </button>

          {/* Card 2: Message Verification */}
          <button
            type="button"
            onClick={() => navigate('verify')}
            className="flex flex-col justify-between rounded-2xl border border-[#E2E8F0] bg-white p-5 text-start shadow-sm transition-all hover:border-[#007F78] hover:shadow-md"
          >
            <div>
              <span className="grid size-10 place-items-center rounded-xl bg-blue-50 text-[#175CD3] mb-3">
                <Icon name="shield" size={20} />
              </span>
              <h3 className="text-base font-extrabold text-[#101828]">Verify News & Rumors</h3>
              <p className="mt-1 text-xs text-[#667085] leading-5">
                Paste viral WhatsApp messages or news snippets to cross-reference against verified bulletins.
              </p>
            </div>
            <div className="mt-4 flex items-center gap-1 text-xs font-bold text-[#175CD3]">
              <span>Verify Message</span>
              <Icon name="arrow" size={14} />
            </div>
          </button>

          {/* Card 3: Phrasebook */}
          <button
            type="button"
            onClick={() => navigate('phrasebook')}
            className="flex flex-col justify-between rounded-2xl border border-[#E2E8F0] bg-white p-5 text-start shadow-sm transition-all hover:border-[#007F78] hover:shadow-md"
          >
            <div>
              <span className="grid size-10 place-items-center rounded-xl bg-amber-50 text-[#DC6803] mb-3">
                <Icon name="volume" size={20} />
              </span>
              <h3 className="text-base font-extrabold text-[#101828]">Crisis Phrasebook</h3>
              <p className="mt-1 text-xs text-[#667085] leading-5">
                Vital emergency phrases in Tamil, Hindi, French, and English with audio speech and phonetic guides.
              </p>
            </div>
            <div className="mt-4 flex items-center gap-1 text-xs font-bold text-[#DC6803]">
              <span>Browse Phrases</span>
              <Icon name="arrow" size={14} />
            </div>
          </button>

          {/* Card 4: Quick Mode */}
          <button
            type="button"
            onClick={() => navigate('quick')}
            className="flex flex-col justify-between rounded-2xl border border-red-200 bg-red-50/40 p-5 text-start shadow-sm transition-all hover:border-red-400 hover:shadow-md"
          >
            <div>
              <span className="grid size-10 place-items-center rounded-xl bg-red-100 text-[#D92D20] mb-3">
                <Icon name="zap" size={20} />
              </span>
              <h3 className="text-base font-extrabold text-[#101828]">Quick Emergency Mode</h3>
              <p className="mt-1 text-xs text-[#667085] leading-5">
                High-contrast, 1-tap dialer for 112, 108, and 1913 plus critical audio phrases for immediate crisis situations.
              </p>
            </div>
            <div className="mt-4 flex items-center gap-1 text-xs font-bold text-[#D92D20]">
              <span>Open Quick Mode</span>
              <Icon name="arrow" size={14} />
            </div>
          </button>
        </div>
      </section>

      {/* Source Provenance Panel */}
      <SourcePanel t={t} sources={status?.sources} />
    </div>
  );
};
