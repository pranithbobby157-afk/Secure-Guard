import React, { FormEvent, useEffect, useState } from 'react';
import { api } from '../services/api';
import { Alert, Area, AuditLog, Source, SystemStatus } from '../types';
import { Copy } from '../i18n/messages';
import { Icon } from './Icon';
import { Page } from './Header';
import { CreateAlertModal } from './CreateAlertModal';

interface EditorPageProps {
  t: Copy;
  navigate: (p: Page) => void;
  areas: Area[];
  alerts: Alert[];
  status: SystemStatus | null;
  onRefreshData: () => void;
}

export const EditorPage: React.FC<EditorPageProps> = ({
  t,
  navigate,
  areas,
  alerts,
  status,
  onRefreshData
}) => {
  const [authToken, setAuthToken] = useState<string | null>(() => {
    return localStorage.getItem('saferoute_auth_token') || null;
  });
  const [currentUser, setCurrentUser] = useState<string | null>(() => {
    return localStorage.getItem('saferoute_auth_user') || null;
  });

  const [preview, setPreview] = useState(false);
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('admin123');
  const [authError, setAuthError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Operations tab
  const [activeTab, setActiveTab] = useState<'alerts' | 'sources' | 'audit'>('alerts');
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [searchFilter, setSearchFilter] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Fetch audit logs when user is authenticated
  useEffect(() => {
    if (authToken && activeTab === 'audit') {
      api.adminGetAuditLogs(authToken)
        .then(setAuditLogs)
        .catch((err) => console.warn('Could not fetch audit logs', err));
    }
  }, [authToken, activeTab]);

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setAuthError(null);

    try {
      const res = await api.login(username, password);
      setAuthToken(res.access_token);
      setCurrentUser(res.username);
      localStorage.setItem('saferoute_auth_token', res.access_token);
      localStorage.setItem('saferoute_auth_user', res.username);
      setPreview(false);
    } catch (err: any) {
      setAuthError(err.message || 'Invalid credentials. Use demo account admin / admin123.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogout = () => {
    setAuthToken(null);
    setCurrentUser(null);
    setPreview(false);
    localStorage.removeItem('saferoute_auth_token');
    localStorage.removeItem('saferoute_auth_user');
  };

  const handleToggleSource = async (sourceId: string, currentHealth: string) => {
    if (!authToken) return;
    try {
      const nextStatus = currentHealth === 'healthy' ? 'unavailable' : 'healthy';
      await api.adminToggleSource(authToken, sourceId, nextStatus);
      onRefreshData();
    } catch (err: any) {
      alert(`Could not toggle source status: ${err.message}`);
    }
  };

  const handleDeleteAlert = async (alertId: string) => {
    if (!authToken) return;
    if (!window.confirm('Are you sure you want to delete this alert?')) return;
    try {
      await api.adminDeleteAlert(authToken, alertId);
      onRefreshData();
    } catch (err: any) {
      alert(`Could not delete alert: ${err.message}`);
    }
  };

  const filteredAlerts = alerts.filter((a) =>
    a.title.toLowerCase().includes(searchFilter.toLowerCase()) ||
    a.id.toLowerCase().includes(searchFilter.toLowerCase())
  );

  const isAuthenticatedOrPreview = !!authToken || preview;

  // View 1: Sign-in view
  if (!isAuthenticatedOrPreview) {
    return (
      <div className="editor-shell">
        <button
          type="button"
          className="back-link"
          onClick={() => navigate('dashboard')}
        >
          <Icon name="arrow" size={16} />
          {t.returnPublic}
        </button>

        <div className="sign-in-layout">
          <section className="sign-in-brand">
            <span className="brand-mark large">
              <Icon name="shield" size={29} />
            </span>
            <span className="kicker">SAFEROUTE OPERATIONS</span>
            <h1>{t.signIn}</h1>
            <p>{t.signInIntro}</p>

            <div className="security-points">
              <span>
                <Icon name="lock" size={18} />
                {t.authNote}
              </span>
              <span>
                <Icon name="document" size={18} />
                {t.audit} (Tamper-evident logs)
              </span>
            </div>

            <div className="mt-8 rounded-xl border border-teal-200 bg-teal-50/50 p-4 text-xs text-[#005E59]">
              <strong>💡 Hackathon Presenter Credentials:</strong>
              <div className="mt-1 font-mono">
                Username: <b>admin</b> &nbsp;|&nbsp; Password: <b>admin123</b>
              </div>
            </div>
          </section>

          <form className="sign-in-card" onSubmit={handleLogin}>
            <div className="form-icon">
              <Icon name="lock" size={22} />
            </div>
            <h2>{t.signIn}</h2>
            <p>{t.signInIntro}</p>

            <label>
              <span>{t.email} / Username</span>
              <div>
                <Icon name="mail" size={17} />
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  autoComplete="username"
                  placeholder="admin"
                />
              </div>
            </label>

            <label>
              <span>{t.password}</span>
              <div>
                <Icon name="lock" size={17} />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  placeholder="••••••••"
                />
              </div>
            </label>

            {authError && (
              <p className="form-error" role="alert">
                {authError}
              </p>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="primary-button full"
            >
              {isSubmitting ? 'Authenticating…' : t.continue}
              <Icon name="arrow" size={17} />
            </button>

            <button
              type="button"
              className="preview-button"
              onClick={() => setPreview(true)}
            >
              <Icon name="eye" size={17} />
              {t.preview} (Read-Only)
            </button>
          </form>
        </div>
      </div>
    );
  }

  // View 2: Operations Workspace
  return (
    <div className="ops-shell">
      {/* Sidebar */}
      <aside className="ops-sidebar">
        <button
          type="button"
          className="brand light"
          onClick={() => navigate('dashboard')}
        >
          <span className="brand-mark">
            <Icon name="shield" size={20} />
          </span>
          <span>
            <strong>SafeRoute</strong>
            <small>OPERATIONS</small>
          </span>
        </button>

        <nav>
          <button
            type="button"
            className={activeTab === 'alerts' ? 'active' : ''}
            onClick={() => setActiveTab('alerts')}
          >
            <Icon name="alert" size={18} />
            {t.alertManagement}
          </button>
          <button
            type="button"
            className={activeTab === 'sources' ? 'active' : ''}
            onClick={() => setActiveTab('sources')}
          >
            <Icon name="layers" size={18} />
            {t.sources}
          </button>
          <button
            type="button"
            className={activeTab === 'audit' ? 'active' : ''}
            onClick={() => setActiveTab('audit')}
          >
            <Icon name="document" size={18} />
            {t.audit}
          </button>
        </nav>

        <div className="mt-8 pt-4 border-t border-white/10 lg:absolute lg:bottom-6 lg:left-5 lg:right-5">
          <div className="text-xs text-slate-400 mb-2">
            Active: <b>{currentUser || 'Demo Editor (Preview)'}</b>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className="exit-preview text-xs font-bold text-red-300 hover:text-red-200"
          >
            {authToken ? 'Log Out' : `${t.close} · ${t.preview}`}
          </button>
        </div>
      </aside>

      {/* Main Operations Area */}
      <main className="ops-main">
        <div className="ops-header">
          <div>
            <span className="demo-badge">
              {authToken ? 'AUTHENTICATED EDITOR' : t.simulation}
            </span>
            <h1>{t.operations}</h1>
          </div>
          {authToken ? (
            <button
              type="button"
              className="primary-button"
              onClick={() => setIsCreateModalOpen(true)}
            >
              <Icon name="plus" size={17} />
              {t.createAlert}
            </button>
          ) : (
            <span className="text-xs text-[#667085] italic">
              (Log in with credentials to publish alerts)
            </span>
          )}
        </div>

        {/* Stats Row */}
        <div className="ops-stats">
          <div>
            <span>Active Alerts</span>
            <strong>{status?.active_alerts_count ?? alerts.length}</strong>
          </div>
          <div>
            <span>{t.sources}</span>
            <strong>
              {status?.sources_healthy_count ?? 3} / {status?.sources_total_count ?? 3}
            </strong>
          </div>
          <div>
            <span>System Health</span>
            <strong className="capitalize text-[#007F78]">
              {status?.status || 'Healthy'}
            </strong>
          </div>
        </div>

        {/* TAB 1: Alert Management */}
        {activeTab === 'alerts' && (
          <section className="ops-card">
            <div className="ops-card-head">
              <h2>{t.alertManagement}</h2>
              <div className="search">
                <Icon name="search" size={17} />
                <input
                  aria-label={t.filters}
                  placeholder="Filter alerts…"
                  value={searchFilter}
                  onChange={(e) => setSearchFilter(e.target.value)}
                />
              </div>
            </div>

            <div className="divide-y divide-[#E2E8F0]">
              {filteredAlerts.length > 0 ? (
                filteredAlerts.map((a) => (
                  <div key={a.id} className="ops-alert-row py-3">
                    <span
                      className={`severity ${
                        a.severity === 'critical'
                          ? 'critical'
                          : 'bg-amber-100 text-[#B54708]'
                      }`}
                    >
                      {a.severity}
                    </span>
                    <div>
                      <strong>{a.title}</strong>
                      <p>
                        {a.area?.name || 'Jurisdiction'} · ID: {a.id}
                      </p>
                    </div>
                    <span className="demo-badge">
                      {a.is_simulated ? 'SIMULATED' : 'OFFICIAL'}
                    </span>
                    <span>
                      {a.source?.name || 'IMD Official'}
                      <small>
                        Issued:{' '}
                        {new Date(a.issued_at).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </small>
                    </span>
                    {authToken && a.is_simulated && (
                      <button
                        type="button"
                        onClick={() => handleDeleteAlert(a.id)}
                        className="text-xs font-bold text-red-600 hover:underline"
                        title="Delete alert"
                      >
                        Delete
                      </button>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-xs text-[#667085] py-4">No matching alerts found.</p>
              )}
            </div>
          </section>
        )}

        {/* TAB 2: Sources & Feed Health */}
        {activeTab === 'sources' && (
          <div className="ops-grid">
            <section className="ops-card">
              <h2>Official Data Feeds & Status</h2>
              <p className="mt-1 text-xs text-[#667085]">
                Toggle feed status to test how SafeRoute handles upstream service outages and stale feeds.
              </p>
              <div className="mt-4 space-y-4">
                {status?.sources.map((s) => (
                  <div
                    key={s.id}
                    className="flex items-center justify-between rounded-lg border border-[#E2E8F0] p-3 text-xs"
                  >
                    <div className="flex items-start gap-3">
                      <span
                        className={`status-dot mt-1 ${
                          s.health_status === 'healthy'
                            ? 'bg-[#079455]'
                            : s.health_status === 'degraded'
                            ? 'bg-[#DC6803]'
                            : 'bg-[#D92D20]'
                        }`}
                      />
                      <div>
                        <strong className="text-sm">{s.name}</strong>
                        <p className="text-[#667085]">{s.attribution_text}</p>
                        <span className="mt-1 inline-block text-[10px] uppercase font-bold text-[#475467]">
                          Status: {s.health_status}
                        </span>
                      </div>
                    </div>
                    {authToken && (
                      <button
                        type="button"
                        onClick={() => handleToggleSource(s.id, s.health_status)}
                        className="rounded-lg border border-[#E2E8F0] px-3 py-1.5 text-xs font-bold text-[#344054] hover:bg-slate-50"
                      >
                        {s.health_status === 'healthy' ? 'Simulate Outage' : 'Recover Feed'}
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </section>

            <section className="ops-card">
              <h2>Data Freshness Policy</h2>
              <div className="text-xs leading-6 text-[#475467] space-y-2 mt-2">
                <p>
                  • <b>IMD Bulletins:</b> Ingested hourly; marked stale if older than 90 minutes.
                </p>
                <p>
                  • <b>TNSDMA Directives:</b> Ingested per advisory issuance with cryptographic checksum.
                </p>
                <p>
                  • <b>Degraded State Policy:</b> If a feed becomes unresponsive, SafeRoute preserves the last cached record with an amber warning badge. It never fabricates an "all-clear" status.
                </p>
              </div>
            </section>
          </div>
        )}

        {/* TAB 3: Audit Trail */}
        {activeTab === 'audit' && (
          <section className="ops-card">
            <h2>Immutable Server Audit Trail</h2>
            <p className="mt-1 text-xs text-[#667085]">
              Every administrative action, scenario switch, and advisory publication is logged server-side.
            </p>
            <div className="mt-4 divide-y divide-[#E2E8F0]">
              {auditLogs.length > 0 ? (
                auditLogs.map((log) => (
                  <div key={log.id} className="audit-entry py-3">
                    <Icon name="clock" size={17} />
                    <div>
                      <strong>
                        {log.action.toUpperCase()} — {log.entity_type}
                      </strong>
                      <p className="text-xs text-[#475467]">{log.details_json}</p>
                      <small className="text-[#667085]">
                        Actor: {log.user_id || 'system'} ·{' '}
                        {new Date(log.timestamp).toLocaleString()}
                      </small>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-xs text-[#667085] py-4">
                  {authToken ? 'No audit entries recorded yet.' : 'Sign in as admin to view full server audit trail.'}
                </p>
              )}
            </div>
          </section>
        )}
      </main>

      {/* Create Alert Modal */}
      {isCreateModalOpen && authToken && (
        <CreateAlertModal
          token={authToken}
          areas={areas}
          onClose={() => setIsCreateModalOpen(false)}
          onAlertCreated={onRefreshData}
        />
      )}
    </div>
  );
};
