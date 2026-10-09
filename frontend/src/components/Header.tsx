import React from 'react';
import { Area, SupportedLanguage, SystemStatus } from '../types';
import { Shield, MapPin, Globe, Phone, Lock, RefreshCw, Radio } from 'lucide-react';

interface HeaderProps {
  areas: Area[];
  selectedAreaId: string;
  onSelectArea: (areaId: string) => void;
  selectedLanguage: SupportedLanguage;
  onSelectLanguage: (lang: SupportedLanguage) => void;
  userLocation: { lat: number; lng: number } | null;
  onToggleLocation: () => void;
  isLocating: boolean;
  status: SystemStatus | null;
  onOpenHelpline: () => void;
  onOpenAdmin: () => void;
  lastSyncTime: string;
}

export const Header: React.FC<HeaderProps> = ({
  areas,
  selectedAreaId,
  onSelectArea,
  selectedLanguage,
  onSelectLanguage,
  userLocation,
  onToggleLocation,
  isLocating,
  status,
  onOpenHelpline,
  onOpenAdmin,
  lastSyncTime
}) => {
  const isDegraded = status?.status === 'degraded' || status?.status === 'unavailable';

  return (
    <header className="header-container">
      <div className="header-content">
        {/* Brand */}
        <div className="brand-section">
          <div className="brand-logo-badge">
            <Shield size={26} strokeWidth={2.4} />
          </div>
          <div>
            <div className="brand-title">SafeRoute</div>
            <div className="brand-subtitle">Tourist Crisis Communication Aid</div>
          </div>
        </div>

        {/* Controls */}
        <div className="controls-group">
          {/* Area Selector */}
          <select
            className="custom-select"
            value={selectedAreaId}
            aria-label="Select Target Region"
            onChange={(e) => onSelectArea(e.target.value)}
          >
            {areas.map((a) => (
              <option key={a.id} value={a.id}>
                📍 {a.name}
              </option>
            ))}
          </select>

          {/* Browser Geolocation Button */}
          <button
            type="button"
            className={`btn-action btn-location ${userLocation ? 'active' : ''}`}
            onClick={onToggleLocation}
            title={userLocation ? 'Location sharing active' : 'Locate nearest safe zones'}
          >
            <MapPin size={16} />
            {isLocating
              ? 'Locating...'
              : userLocation
              ? 'GPS Active'
              : 'Use My Location'}
          </button>

          {/* Language Selector */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <Globe size={16} color="#94a3b8" />
            <select
              className="custom-select"
              value={selectedLanguage}
              aria-label="Select Preferred Language"
              onChange={(e) => onSelectLanguage(e.target.value as SupportedLanguage)}
            >
              <option value="en">English (Original/EN)</option>
              <option value="ta">தமிழ் (Tamil)</option>
              <option value="hi">हिन्दी (Hindi)</option>
              <option value="fr">Français (French)</option>
            </select>
          </div>

          {/* Live Sync Status */}
          <div className={`freshness-pill ${isDegraded ? 'stale' : ''}`}>
            <span className="pulse-dot" />
            {isDegraded ? 'Feed Degraded' : `Synced ${lastSyncTime}`}
          </div>

          {/* Emergency Helpline CTA */}
          <button
            type="button"
            className="btn-action btn-helpline"
            onClick={onOpenHelpline}
          >
            <Phone size={15} />
            Helplines (112)
          </button>

          {/* Admin / Editor Portal */}
          <button
            type="button"
            className="btn-action btn-ghost"
            onClick={onOpenAdmin}
            title="Editor Verification & Simulator Controls"
          >
            <Lock size={15} />
            Editor
          </button>
        </div>
      </div>
    </header>
  );
};
