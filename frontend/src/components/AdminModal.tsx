import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Area, AuditLog, Source } from '../types';
import { Lock, X, PlusCircle, RefreshCw, Activity, History, LogOut } from 'lucide-react';
import { signInWithGoogle } from '../services/supabase';

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
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'create' | 'places' | 'sources' | 'audit'>('create');

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

  // Form states for creating safe place / shelter
  const [szName, setSzName] = useState('Marina Beach GCC Relief Shelter');
  const [szType, setSzType] = useState('cyclone_shelter');
  const [szAddress, setSzAddress] = useState('Kamarajar Salai, Triplicane, Chennai 600005');
  const [szLat, setSzLat] = useState('13.0500');
  const [szLng, setSzLng] = useState('80.2824');
  const [szPhone, setSzPhone] = useState('044-25619206');
  const [szCapacity, setSzCapacity] = useState('Capacity 400 evacuees, food and medical supplies');

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

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true);
    setLoginError('');
    try {
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('saferoute_auth_redirect_page', 'editor');
      }
      const { error } = await signInWithGoogle();
      if (error) {
        setLoginError(error.message);
        setIsGoogleLoading(false);
      }
    } catch (err: any) {
      setLoginError(err.message || 'Google OAuth failed');
      setIsGoogleLoading(false);
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

  const handleCreateSafeZone = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setIsSubmitting(true);
    setCreateSuccess('');
    try {
      await api.adminCreateSafeZone(token, {
        area_id: formAreaId,
        name: szName,
        facility_type: szType,
        address: szAddress,
        latitude: parseFloat(szLat) || 13.05,
        longitude: parseFloat(szLng) || 80.2824,
        source_name: 'Greater Chennai Corporation (GCC)',
        source_url: 'https://chennaicorporation.gov.in',
        verification_status: 'official_verified',
        operational_status: 'open',
        contact_phone: szPhone || null,
        capacity_notes: szCapacity || null,
        is_simulated: true
      });
      setCreateSuccess('Safe place registered and added to live map with verified shelter status!');
      onAlertCreated();
    } catch (err: any) {
      alert(err.message || 'Failed to create safe place');
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
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={isGoogleLoading}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                padding: '0.65rem',
                border: '1px solid #cbd5e1',
                borderRadius: '0.5rem',
                background: '#ffffff',
                color: '#334155',
                fontSize: '0.85rem',
                fontWeight: 600,
                cursor: 'pointer',
                marginBottom: '1rem',
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
                <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.66v3.04h3.88c2.27-2.09 3.66-5.17 3.66-9.14z"/>
                <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.04c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.94H1.24v3.13C3.26 21.36 7.33 24 12 24z"/>
                <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.6H1.24C.45 8.18 0 9.95 0 12s.45 3.82 1.24 5.4l4.04-3.13z"/>
                <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.24 6.6l4.04 3.13c.95-2.84 3.6-4.98 6.72-4.98z"/>
              </svg>
              {isGoogleLoading ? 'Connecting to Google…' : 'Sign In with Google'}
            </button>

            <div style={{ textAlign: 'center', borderBottom: '1px solid #e2e8f0', lineHeight: '0.1em', margin: '1rem 0' }}>
              <span style={{ background: '#fff', padding: '0 10px', color: '#94a3b8', fontSize: '0.75rem', fontWeight: 600 }}>
                OR CREDENTIALS
              </span>
            </div>

            {/* Quick Test Credentials */}
            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '8px', marginBottom: '12px' }}>
              <span style={{ fontSize: '10px', fontWeight: 700, color: '#64748b', display: 'block', marginBottom: '6px', textTransform: 'uppercase' }}>
                Quick Test Accounts:
              </span>
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  onClick={() => { setUsername('admin'); setPassword('admin123'); }}
                  style={{ fontSize: '11px', padding: '3px 8px', borderRadius: '4px', border: '1px solid #cbd5e1', background: '#fff', cursor: 'pointer', fontWeight: 600 }}
                >
                  Admin (admin123)
                </button>
                <button
                  type="button"
                  onClick={() => { setUsername('editor'); setPassword('editor123'); }}
                  style={{ fontSize: '11px', padding: '3px 8px', borderRadius: '4px', border: '1px solid #cbd5e1', background: '#fff', cursor: 'pointer', fontWeight: 600, color: '#007F78' }}
                >
                  Editor (editor123)
                </button>
                <button
                  type="button"
                  onClick={() => { setUsername('user'); setPassword('user123'); }}
                  style={{ fontSize: '11px', padding: '3px 8px', borderRadius: '4px', border: '1px solid #cbd5e1', background: '#fff', cursor: 'pointer', fontWeight: 600, color: '#175CD3' }}
                >
                  User (user123)
                </button>
              </div>
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
                  <PlusCircle size={13} style={{ display: 'inline', marginRight: 4 }} /> Create Alert
                </button>
                <button
                  className={`filter-chip ${activeTab === 'places' ? 'active' : ''}`}
                  onClick={() => setActiveTab('places')}
                >
                  <PlusCircle size={13} style={{ display: 'inline', marginRight: 4 }} /> Add Safe Place
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

            {/* TAB 2: Add Safe Place */}
            {activeTab === 'places' && (
              <form onSubmit={handleCreateSafeZone}>
                {createSuccess && (
                  <div style={{ background: 'rgba(16, 185, 129, 0.15)', border: '1px solid #10b981', color: '#34d399', padding: '0.5rem 0.85rem', borderRadius: '6px', fontSize: '0.82rem', marginBottom: '1rem' }}>
                    {createSuccess}
                  </div>
                )}

                <div className="form-group">
                  <label className="form-label">Shelter / Facility Name</label>
                  <input
                    type="text"
                    className="form-input"
                    value={szName}
                    onChange={(e) => setSzName(e.target.value)}
                    required
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <div className="form-group">
                    <label className="form-label">Facility Type</label>
                    <select
                      className="form-input"
                      value={szType}
                      onChange={(e) => setSzType(e.target.value)}
                    >
                      <option value="cyclone_shelter">Cyclone Shelter</option>
                      <option value="flood_relief_camp">Flood Relief Camp</option>
                      <option value="hospital">Hospital / Medical Hub</option>
                      <option value="community_hall">Community Hall</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Jurisdiction</label>
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
                </div>

                <div className="form-group">
                  <label className="form-label">Street Address</label>
                  <input
                    type="text"
                    className="form-input"
                    value={szAddress}
                    onChange={(e) => setSzAddress(e.target.value)}
                    required
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <div className="form-group">
                    <label className="form-label">Latitude</label>
                    <input
                      type="text"
                      className="form-input"
                      value={szLat}
                      onChange={(e) => setSzLat(e.target.value)}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Longitude</label>
                    <input
                      type="text"
                      className="form-input"
                      value={szLng}
                      onChange={(e) => setSzLng(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <div className="form-group">
                    <label className="form-label">Contact Phone</label>
                    <input
                      type="text"
                      className="form-input"
                      value={szPhone}
                      onChange={(e) => setSzPhone(e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Capacity Notes</label>
                    <input
                      type="text"
                      className="form-input"
                      value={szCapacity}
                      onChange={(e) => setSzCapacity(e.target.value)}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn-action"
                  style={{
                    width: '100%',
                    background: '#059669',
                    color: 'white',
                    justifyContent: 'center',
                    padding: '0.75rem'
                  }}
                >
                  {isSubmitting ? 'Registering Place...' : 'Register Safe Place on Map'}
                </button>
              </form>
            )}

            {/* TAB 3: Sources */}
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
