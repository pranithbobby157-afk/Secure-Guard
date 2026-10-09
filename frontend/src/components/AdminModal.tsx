import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Area, AuditLog, Source } from '../types';
import { Lock, X, PlusCircle, RefreshCw, Activity, ShieldCheck, History, LogOut } from 'lucide-react';

interface AdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  areas: Area[];
  onAlertCreated: () => void;
}

export const AdminModal: React.FC<AdminModalProps> = ({
  isOpen,
  onClose,
  areas,
  onAlertCreated
}) => {
  const [token, setToken] = useState<string | null>(localStorage.getItem('saferoute_token'));
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('admin123');
  const [loginError, setLoginError] = useState('');
  const [activeTab, setActiveTab] = useState<'create' | 'sources' | 'audit'>('create');

  // Form states for creating simulated alert
  const [formAreaId, setFormAreaId] = useState(areas[0]?.id || 'area-chennai-coastal');
  const [formTitle, setFormTitle] = useState('Severe Flash Flooding & Road Blockade at Adyar Riverbank');
  const [formHazard, setFormHazard] = useState('waterlogging');
  const [formSeverity, setFormSeverity] = useState('critical');
  const [formDesc, setFormDesc] = useState('River Adyar overflowing past Kotturpuram causeway. Secondary arterial routes inundated by 3-4 feet.');
  const [formInstruction, setFormInstruction] = useState('Avoid Kotturpuram bridge. Seek high ground or designated GCC community halls.');
  const [formLat, setFormLat] = useState('13.0180');
  const [formLng, setFormLng] = useState('80.2350');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createSuccess, setCreateSuccess] = useState('');

  // Sources and audit logs
  const [sources, setSources] = useState<Source[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [loadingAudit, setLoadingAudit] = useState(false);

  useEffect(() => {
    if (token) {
      api.getStatus().then((st) => setSources(st.sources)).catch(() => {});
      if (activeTab === 'audit') {
        setLoadingAudit(true);
        api.adminGetAuditLogs(token)
          .then(setAuditLogs)
          .catch(() => {})
          .finally(() => setLoadingAudit(false));
      }
    }
  }, [token, activeTab]);

  if (!isOpen) return null;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    try {
      const res = await api.login(username, password);
      setToken(res.access_token);
      localStorage.setItem('saferoute_token', res.access_token);
    } catch (err: any) {
      setLoginError(err.message || 'Authentication failed');
    }
  };

  const handleLogout = () => {
    setToken(null);
    localStorage.removeItem('saferoute_token');
  };

  const handleCreateAlert = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setIsSubmitting(true);
    setCreateSuccess('');
    try {
      await api.adminCreateAlert(token, {
        area_id: formAreaId,
        title: formTitle,
        description_original: formDesc,
        instruction_original: formInstruction,
        hazard_type: formHazard,
        severity: formSeverity,
        status: 'active',
        verification_status: 'simulated',
        is_simulated: true,
        lat: parseFloat(formLat) || null,
        lng: parseFloat(formLng) || null
      });
      setCreateSuccess('Alert created and published to public dashboard with SIMULATION badge!');
      onAlertCreated();
    } catch (err: any) {
      alert(err.message || 'Failed to create alert');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleSource = async (sourceId: string, currentStatus: string) => {
    if (!token) return;
    const newStatus = currentStatus === 'healthy' ? 'degraded' : 'healthy';
    try {
      await api.adminToggleSource(token, sourceId, newStatus);
      const st = await api.getStatus();
      setSources(st.sources);
      onAlertCreated();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleRefreshSource = async (sourceId: string) => {
    if (!token) return;
    try {
      await api.adminRefreshSource(token, sourceId);
      const st = await api.getStatus();
      setSources(st.sources);
      onAlertCreated();
      alert(`Source ${sourceId} synced successfully.`);
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div style={{ background: '#3b82f6', padding: '0.4rem', borderRadius: '8px', color: 'white', display: 'flex' }}>
              <Lock size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.25rem', color: '#f8fafc' }}>
                Editor & Verification Control Center
              </h3>
              <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>
                Restricted data maintenance & scenario simulator
              </span>
            </div>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {!token ? (
          /* Login Form */
          <form onSubmit={handleLogin} style={{ marginTop: '0.5rem' }}>
            <div style={{ background: 'rgba(59, 130, 246, 0.1)', border: '1px solid rgba(59, 130, 246, 0.3)', borderRadius: '8px', padding: '0.75rem 1rem', marginBottom: '1.25rem', fontSize: '0.84rem', color: '#93c5fd' }}>
              <strong>Demo Credentials:</strong> Username: <code>admin</code> | Password: <code>admin123</code>
            </div>

            {loginError && (
              <div style={{ color: '#f87171', fontSize: '0.82rem', marginBottom: '0.85rem' }}>
                {loginError}
              </div>
            )}

            <div className="form-group">
              <label className="form-label">Username</label>
              <input
                type="text"
                className="form-input"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <input
                type="password"
                className="form-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button
              type="submit"
              className="btn-action"
              style={{
                width: '100%',
                background: '#3b82f6',
                color: 'white',
                justifyContent: 'center',
                padding: '0.75rem',
                marginTop: '0.5rem'
              }}
            >
              Sign In to Editor Portal
            </button>
          </form>
        ) : (
          /* Logged In Workspace */
          <div>
            {/* Tabs & Logout */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.5rem', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  className={`filter-chip ${activeTab === 'create' ? 'active' : ''}`}
                  onClick={() => setActiveTab('create')}
                >
                  <PlusCircle size={13} style={{ display: 'inline', marginRight: 4 }} /> Create Simulated Alert
                </button>
                <button
                  className={`filter-chip ${activeTab === 'sources' ? 'active' : ''}`}
                  onClick={() => setActiveTab('sources')}
                >
                  <Activity size={13} style={{ display: 'inline', marginRight: 4 }} /> Source Feeds
                </button>
                <button
                  className={`filter-chip ${activeTab === 'audit' ? 'active' : ''}`}
                  onClick={() => setActiveTab('audit')}
                >
                  <History size={13} style={{ display: 'inline', marginRight: 4 }} /> Audit Trail
                </button>
              </div>

              <button
                onClick={handleLogout}
                style={{ background: 'transparent', border: 'none', color: '#f87171', fontSize: '0.78rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem' }}
              >
                <LogOut size={13} /> Sign Out
              </button>
            </div>

            {/* TAB 1: Create Alert */}
            {activeTab === 'create' && (
              <form onSubmit={handleCreateAlert}>
                {createSuccess && (
                  <div style={{ background: 'rgba(16, 185, 129, 0.15)', border: '1px solid #10b981', color: '#34d399', padding: '0.5rem 0.85rem', borderRadius: '6px', fontSize: '0.82rem', marginBottom: '1rem' }}>
                    {createSuccess}
                  </div>
                )}

                <div className="form-group">
                  <label className="form-label">Target Jurisdiction</label>
                  <select
                    className="form-input"
                    value={formAreaId}
                    onChange={(e) => setFormAreaId(e.target.value)}
                  >
                    {areas.map((a) => (
                      <option key={a.id} value={a.id}>{a.name}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Alert Headline (Auto-prefixed with SIMULATION)</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    required
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <div className="form-group">
                    <label className="form-label">Hazard Category</label>
                    <select
                      className="form-input"
                      value={formHazard}
                      onChange={(e) => setFormHazard(e.target.value)}
                    >
                      <option value="cyclone">Cyclone Warning</option>
                      <option value="waterlogging">Waterlogging / Inundation</option>
                      <option value="heavy_rain">Heavy Rainfall</option>
                      <option value="flood">Flash Flood</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Severity Level</label>
                    <select
                      className="form-input"
                      value={formSeverity}
                      onChange={(e) => setFormSeverity(e.target.value)}
                    >
                      <option value="critical">Critical (Red Alert)</option>
                      <option value="warning">Warning (Orange Alert)</option>
                      <option value="watch">Watch (Yellow Advisory)</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Official Advisory Text</label>
                  <textarea
                    rows={3}
                    className="form-textarea"
                    value={formDesc}
                    onChange={(e) => setFormDesc(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Authority Instruction</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formInstruction}
                    onChange={(e) => setFormInstruction(e.target.value)}
                    required
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <div className="form-group">
                    <label className="form-label">Hazard Latitude</label>
                    <input
                      type="text"
                      className="form-input"
                      value={formLat}
                      onChange={(e) => setFormLat(e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Hazard Longitude</label>
                    <input
                      type="text"
                      className="form-input"
                      value={formLng}
                      onChange={(e) => setFormLng(e.target.value)}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn-action"
                  style={{
                    width: '100%',
                    background: '#0284c7',
                    color: 'white',
                    justifyContent: 'center',
                    padding: '0.75rem'
                  }}
                >
                  {isSubmitting ? 'Validating & Publishing...' : 'Publish Simulated Notice'}
                </button>
              </form>
            )}

            {/* TAB 2: Sources */}
            {activeTab === 'sources' && (
              <div>
                <p style={{ fontSize: '0.82rem', color: '#94a3b8', marginBottom: '1rem' }}>
                  Manage upstream meteorological and disaster authority connectors. Test resilience by simulating outages.
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {sources.map((s) => (
                    <div
                      key={s.id}
                      style={{
                        background: 'rgba(30, 41, 59, 0.6)',
                        border: '1px solid var(--border-subtle)',
                        borderRadius: '8px',
                        padding: '0.85rem 1rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '0.85rem'
                      }}
                    >
                      <div>
                        <div style={{ fontWeight: 600, color: '#f8fafc', fontSize: '0.88rem' }}>
                          {s.name}
                        </div>
                        <div style={{ fontSize: '0.74rem', color: '#94a3b8' }}>
                          Status:{' '}
                          <span
                            style={{
                              color: s.health_status === 'healthy' ? '#34d399' : '#f87171',
                              fontWeight: 700,
                              textTransform: 'uppercase'
                            }}
                          >
                            {s.health_status}
                          </span>{' '}
                          • {s.geographic_coverage}
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: '0.45rem' }}>
                        <button
                          className="btn-demo"
                          onClick={() => handleToggleSource(s.id, s.health_status)}
                          title="Toggle degraded mode to demo stale banner"
                        >
                          {s.health_status === 'healthy' ? 'Simulate Outage' : 'Restore Feed'}
                        </button>
                        <button
                          className="btn-demo"
                          style={{ background: '#3b82f6' }}
                          onClick={() => handleRefreshSource(s.id)}
                        >
                          <RefreshCw size={12} /> Sync
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 3: Audit Trail */}
            {activeTab === 'audit' && (
              <div>
                <p style={{ fontSize: '0.82rem', color: '#94a3b8', marginBottom: '0.75rem' }}>
                  Immutable server-side audit logs tracking editor actions, simulated events, and feed refreshes:
                </p>
                {loadingAudit ? (
                  <div style={{ textAlign: 'center', padding: '1rem', color: '#94a3b8' }}>Loading audit records...</div>
                ) : (
                  <div style={{ maxHeight: '320px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {auditLogs.map((log) => (
                      <div
                        key={log.id}
                        style={{
                          background: 'rgba(15, 23, 42, 0.8)',
                          border: '1px solid var(--border-subtle)',
                          borderRadius: '6px',
                          padding: '0.65rem 0.85rem',
                          fontSize: '0.78rem'
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', color: '#38bdf8', fontWeight: 600 }}>
                          <span>{log.action}</span>
                          <span style={{ color: '#64748b', fontSize: '0.72rem' }}>
                            {new Date(log.timestamp).toLocaleString()}
                          </span>
                        </div>
                        <div style={{ color: '#cbd5e1', marginTop: '0.25rem', fontFamily: 'monospace', fontSize: '0.72rem' }}>
                          {log.details_json}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
