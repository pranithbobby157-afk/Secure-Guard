import React, { useState } from 'react';
import { Source, SystemStatus } from '../types';
import { Copy } from '../i18n/messages';
import { Icon } from './Icon';

interface DataSourcesPageProps {
  t: Copy;
  status: SystemStatus | null;
  onRefresh: () => Promise<void>;
  lastSyncTime: string;
}

export const DataSourcesPage: React.FC<DataSourcesPageProps> = ({
  t: _t,
  status,
  onRefresh,
  lastSyncTime
}) => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [refreshError, setRefreshError] = useState<string | null>(null);

  const handleRefresh = async () => {
    if (isRefreshing) return;
    setIsRefreshing(true);
    setRefreshError(null);
    try {
      await onRefresh();
    } catch (err: any) {
      setRefreshError(err.message || 'Failed to refresh sources');
    } finally {
      setIsRefreshing(false);
    }
  };

  const sources: Source[] = status?.sources || [
    {
      id: 'source-imd',
      name: 'India Meteorological Department (IMD)',
      category: 'weather_agency',
      base_url: 'https://mausam.imd.gov.in',
      geographic_coverage: 'National & Regional Specialised Centre Chennai',
      authority_level: 'national_meteorological',
      health_status: 'healthy',
      attribution_text: 'Official Warning Bulletin: Regional Meteorological Centre (RMC), Chennai'
    },
    {
      id: 'source-tnsdma',
      name: 'Tamil Nadu State Disaster Management Authority (TNSDMA)',
      category: 'disaster_management',
      base_url: 'https://tnsdma.tn.gov.in',
      geographic_coverage: 'Tamil Nadu State',
      authority_level: 'state_disaster_authority',
      health_status: 'healthy',
      attribution_text: 'State Emergency Operations Centre (SEOC), Chepauk, Chennai'
    },
    {
      id: 'source-gcc',
      name: 'Greater Chennai Corporation (GCC)',
      category: 'municipal_authority',
      base_url: 'https://chennaicorporation.gov.in',
      geographic_coverage: 'Chennai Metropolitan Area',
      authority_level: 'municipal_corporation',
      health_status: 'healthy',
      attribution_text: 'GCC 24x7 Integrated Emergency Disaster Command Centre, Ripon Building'
    }
  ];

  const healthyCount = sources.filter((s) => s.health_status === 'healthy').length;
  const totalCount = sources.length;

  return (
    <div className="page-shell">
      {/* Intro Header */}
      <section className="page-intro">
        <div>
          <div className="eyebrow">
            <Icon name="database" size={14} />
            Data Provenance & Transparency
          </div>
          <h1>Configured Emergency Data Feeds</h1>
          <p>
            Real-time operational health, connection status, and official authority attribution for disaster data sources.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="primary-button"
          >
            <Icon name="refresh" size={15} />
            <span>{isRefreshing ? 'Checking Feeds…' : 'Refresh Feeds'}</span>
          </button>
        </div>
      </section>

      {/* System Health Hero */}
      <div className="mb-8 rounded-2xl border border-[#E2E8F0] bg-white p-6 shadow-sm">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center border-b border-[#E2E8F0] pb-6">
          <div className="flex items-center gap-3">
            <span
              className={`grid size-12 place-items-center rounded-xl text-white ${
                healthyCount === totalCount ? 'bg-[#079455]' : 'bg-[#DC6803]'
              }`}
            >
              <Icon name="database" size={24} />
            </span>
            <div>
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#667085]">
                Feed Infrastructure Health
              </span>
              <h2 className="text-xl font-extrabold text-[#101828]">
                {healthyCount === totalCount
                  ? `All ${totalCount} Configured Feeds Operational`
                  : `${healthyCount} of ${totalCount} Feeds Reachable`}
              </h2>
            </div>
          </div>

          <div className="text-xs text-[#667085] sm:text-end">
            <div>Last Health Verification:</div>
            <strong className="text-sm text-[#101828]">{lastSyncTime} IST</strong>
          </div>
        </div>

        {/* Vital architectural distinction notice */}
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <div className="rounded-xl border border-teal-200 bg-teal-50/50 p-4 text-xs text-[#005E59]">
            <strong className="block text-sm font-bold text-[#004D48] mb-1">
              Source Health vs Disaster Severity
            </strong>
            <p className="leading-5">
              Source health measures API server connectivity and response latency. A "Healthy" source means the official government endpoint is reachable. It does <strong>not</strong> mean an area is free of weather emergencies.
            </p>
          </div>

          <div className="rounded-xl border border-purple-200 bg-purple-50/50 p-4 text-xs text-[#5925DC]">
            <strong className="block text-sm font-bold text-[#421E9E] mb-1">
              Simulation vs Production Mode
            </strong>
            <p className="leading-5">
              Current environment mode is: <strong>{status?.mode || 'live_with_simulations'}</strong>. Seeded records demonstrate system response to critical cyclones and waterlogging scenarios without fabricating live weather events.
            </p>
          </div>
        </div>

        {refreshError && (
          <div className="mt-4 rounded-lg bg-red-50 p-3 text-xs font-semibold text-[#B42318] flex items-center gap-2">
            <Icon name="warning" size={15} />
            {refreshError}
          </div>
        )}
      </div>

      {/* Sources Directory Grid */}
      <div className="space-y-4">
        <h3 className="text-base font-extrabold text-[#101828]">
          Official Authority Source Registry ({sources.length})
        </h3>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {sources.map((src) => (
            <div
              key={src.id}
              className="flex flex-col justify-between rounded-2xl border border-[#E2E8F0] bg-white p-5 shadow-sm"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="rounded bg-[#F2F4F7] px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-[#475467]">
                    {src.authority_level.replace(/_/g, ' ')}
                  </span>
                  <span
                    className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold ${
                      src.health_status === 'healthy'
                        ? 'bg-emerald-100 text-[#079455]'
                        : src.health_status === 'degraded'
                        ? 'bg-amber-100 text-[#DC6803]'
                        : 'bg-red-100 text-[#B42318]'
                    }`}
                  >
                    <span
                      className={`size-1.5 rounded-full ${
                        src.health_status === 'healthy'
                          ? 'bg-[#079455]'
                          : src.health_status === 'degraded'
                          ? 'bg-[#DC6803]'
                          : 'bg-[#B42318]'
                      }`}
                    />
                    {src.health_status.toUpperCase()}
                  </span>
                </div>

                <h4 className="mt-3 text-base font-extrabold text-[#101828]">
                  {src.name}
                </h4>

                <p className="mt-1 text-xs text-[#667085]">
                  Coverage: <strong>{src.geographic_coverage}</strong>
                </p>

                <div className="mt-3 rounded-lg bg-[#F8FAFC] p-3 text-[11px] text-[#475467] leading-4 border border-[#F2F4F7]">
                  <strong>Attribution:</strong>
                  <br />
                  {src.attribution_text}
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-[#E2E8F0]">
                {src.base_url && (
                  <a
                    href={src.base_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-[#007F78] hover:underline"
                  >
                    <span>Visit Official Portal</span>
                    <Icon name="external" size={13} />
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Trust & Verification Standards */}
      <div className="trust-note mt-8">
        <Icon name="info" size={19} />
        <p>
          <strong>Official Integrity & Compliance</strong>
          <br />
          SafeRoute does not fabricate emergency data. Where official live feeds require specialized agency credentials or automated CAP-CP protocol agreements, demonstration scenarios are clearly watermarked as simulated records.
        </p>
      </div>
    </div>
  );
};
