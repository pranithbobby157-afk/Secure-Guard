import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { api } from './services/api';
import { Alert, Area, EmergencyContact, SafeZone, SupportedLanguage, SystemStatus } from './types';
import { Header } from './components/Header';
import { SystemNoticeBanner } from './components/SystemNoticeBanner';
import { EmergencyBanner } from './components/EmergencyBanner';
import { DemoScenarioBar } from './components/DemoScenarioBar';
import { AlertFilterBar } from './components/AlertFilterBar';
import { AlertCard } from './components/AlertCard';
import { InteractiveMap } from './components/InteractiveMap';
import { SafeZoneSection } from './components/SafeZoneSection';
import { EmergencyContactsModal } from './components/EmergencyContactsModal';
import { AdminModal } from './components/AdminModal';
import { Footer } from './components/Footer';
import { ShieldAlert, RefreshCw, AlertTriangle, Compass } from 'lucide-react';

export const App: React.FC = () => {
  // Core state
  const [areas, setAreas] = useState<Area[]>([]);
  const [selectedAreaId, setSelectedAreaId] = useState<string>('area-chennai-coastal');
  const [selectedLanguage, setSelectedLanguage] = useState<SupportedLanguage>('en');
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [safeZones, setSafeZones] = useState<SafeZone[]>([]);
  const [contacts, setContacts] = useState<EmergencyContact[]>([]);
  const [status, setStatus] = useState<SystemStatus | null>(null);

  // User location
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [isLocating, setIsLocating] = useState<boolean>(false);

  // Filters
  const [selectedHazard, setSelectedHazard] = useState<string>('all');
  const [selectedSeverity, setSelectedSeverity] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Demo & Modals
  const [activeScenario, setActiveScenario] = useState<string>('cyclone_active');
  const [isHelplineOpen, setIsHelplineOpen] = useState<boolean>(false);
  const [isAdminOpen, setIsAdminOpen] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [lastSyncTime, setLastSyncTime] = useState<string>('just now');

  // Load Areas on start
  useEffect(() => {
    api.getAreas()
      .then((data) => {
        setAreas(data);
        if (data.length > 0 && !selectedAreaId) {
          setSelectedAreaId(data[0].id);
        }
      })
      .catch((err) => console.error('Failed to load areas', err));
  }, []);

  // Main data fetch function
  const loadData = useCallback(async (isManualRefresh: boolean = false) => {
    if (isManualRefresh) setIsRefreshing(true);
    try {
      const [statusRes, alertsRes, safeZonesRes, contactsRes] = await Promise.all([
        api.getStatus(),
        api.getAlerts({ area_id: selectedAreaId, status: 'all' }),
        api.getSafeZones({
          area_id: selectedAreaId,
          user_lat: userLocation?.lat,
          user_lng: userLocation?.lng
        }),
        api.getEmergencyContacts(selectedAreaId)
      ]);

      setStatus(statusRes);
      setAlerts(alertsRes);
      setSafeZones(safeZonesRes);
      setContacts(contactsRes);
      setLastSyncTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));

      // Cache locally for offline grace
      try {
        localStorage.setItem(`saferoute_alerts_${selectedAreaId}`, JSON.stringify(alertsRes));
      } catch {}
    } catch (err) {
      console.warn('Network error or server unavailable. Reading from offline cache...', err);
      const cached = localStorage.getItem(`saferoute_alerts_${selectedAreaId}`);
      if (cached) {
        setAlerts(JSON.parse(cached));
      }
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [selectedAreaId, userLocation]);

  useEffect(() => {
    loadData();
    // Auto-refresh every 45s
    const interval = setInterval(() => {
      loadData();
    }, 45000);
    return () => clearInterval(interval);
  }, [loadData]);

  // Handle browser geolocation
  const handleToggleLocation = () => {
    if (userLocation) {
      setUserLocation(null);
      return;
    }

    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLocation({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude
        });
        setIsLocating(false);
      },
      (err) => {
        console.warn('Geolocation permission denied or timed out:', err);
        // Fallback default coordinate near Marina Beach for demo if denied
        alert('Geolocation permission was denied or unavailable. Using manual area selection.');
        setIsLocating(false);
      },
      { timeout: 8000, enableHighAccuracy: true }
    );
  };

  // Demo scenario switch
  const handleSelectScenario = async (scenario: string) => {
    setActiveScenario(scenario);
    try {
      await api.setDemoScenario(scenario);
      await loadData(true);
    } catch (err) {
      console.error('Failed to trigger demo scenario', err);
    }
  };

  // Current selected area object
  const currentArea = useMemo(() => {
    return areas.find((a) => a.id === selectedAreaId) || areas[0];
  }, [areas, selectedAreaId]);

  // Highest severity active alert for EmergencyBanner
  const criticalAlert = useMemo(() => {
    const activeAlerts = alerts.filter((a) => a.status === 'active');
    const critical = activeAlerts.find((a) => a.severity === 'critical');
    if (critical) return critical;
    const warning = activeAlerts.find((a) => a.severity === 'warning');
    if (warning) return warning;
    return activeAlerts[0] || null;
  }, [alerts]);

  // Filtered alert list
  const filteredAlerts = useMemo(() => {
    return alerts.filter((a) => {
      if (selectedHazard !== 'all' && a.hazard_type !== selectedHazard) return false;
      if (selectedSeverity !== 'all' && a.severity !== selectedSeverity) return false;
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesTitle = a.title.toLowerCase().includes(query);
        const matchesDesc = a.description_original.toLowerCase().includes(query);
        const matchesArea = a.area?.name.toLowerCase().includes(query) || false;
        if (!matchesTitle && !matchesDesc && !matchesArea) return false;
      }
      return true;
    });
  }, [alerts, selectedHazard, selectedSeverity, searchQuery]);

  const hasStaleAlerts = useMemo(() => {
    return alerts.some((a) => a.is_stale);
  }, [alerts]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {/* 1. Header Navigation */}
      <Header
        areas={areas}
        selectedAreaId={selectedAreaId}
        onSelectArea={setSelectedAreaId}
        selectedLanguage={selectedLanguage}
        onSelectLanguage={setSelectedLanguage}
        userLocation={userLocation}
        onToggleLocation={handleToggleLocation}
        isLocating={isLocating}
        status={status}
        onOpenHelpline={() => setIsHelplineOpen(true)}
        onOpenAdmin={() => setIsAdminOpen(true)}
        lastSyncTime={lastSyncTime}
      />

      {/* 2. System Warning Banner (if degraded/stale) */}
      <SystemNoticeBanner
        status={status}
        hasStaleAlerts={hasStaleAlerts}
        onRefreshFeed={() => loadData(true)}
        isRefreshing={isRefreshing}
      />

      {/* Main Container */}
      <main className="main-container">
        {/* 3. Demo Scenario Switcher for judging & presentation */}
        <DemoScenarioBar
          activeScenario={activeScenario}
          onSelectScenario={handleSelectScenario}
        />

        {/* 4. Active Emergency Banner */}
        <EmergencyBanner
          criticalAlert={criticalAlert}
          area={currentArea}
          lastSyncTime={lastSyncTime}
        />

        {/* 5. Main Content Two-Column Grid */}
        <div className="dashboard-grid">
          {/* Left Column: Official Bulletins & Warnings */}
          <section aria-label="Official Bulletins and Warnings">
            <AlertFilterBar
              selectedHazard={selectedHazard}
              onSelectHazard={setSelectedHazard}
              selectedSeverity={selectedSeverity}
              onSelectSeverity={setSelectedSeverity}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              totalCount={filteredAlerts.length}
            />

            {isLoading ? (
              <div className="glass-panel" style={{ padding: '2.5rem', textAlign: 'center', color: '#94a3b8' }}>
                <RefreshCw size={24} className="pulse-dot" style={{ margin: '0 auto 0.75rem' }} />
                <span>Synchronizing authoritative warnings from India Meteorological Department...</span>
              </div>
            ) : filteredAlerts.length === 0 ? (
              <div className="glass-panel" style={{ padding: '2.5rem', textAlign: 'center' }}>
                <ShieldAlert size={36} color="#94a3b8" style={{ margin: '0 auto 0.75rem' }} />
                <h3 style={{ fontSize: '1.15rem', color: '#f8fafc', marginBottom: '0.4rem' }}>
                  No Matching Notices
                </h3>
                <p style={{ fontSize: '0.86rem', color: '#94a3b8' }}>
                  No warnings match your current hazard/severity filter criteria in {currentArea?.name}.
                </p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {filteredAlerts.map((alert) => (
                  <AlertCard
                    key={alert.id}
                    alert={alert}
                    currentLanguage={selectedLanguage}
                  />
                ))}
              </div>
            )}
          </section>

          {/* Right Column: Interactive Map & Designated Safe Zones */}
          <aside aria-label="Geospatial Map and Designated Shelters">
            <InteractiveMap
              area={currentArea}
              alerts={alerts}
              safeZones={safeZones}
              userLocation={userLocation}
            />

            <SafeZoneSection
              safeZones={safeZones}
              userLocation={userLocation}
            />
          </aside>
        </div>
      </main>

      {/* 6. Footer */}
      <Footer />

      {/* 7. Emergency Contacts Modal */}
      <EmergencyContactsModal
        isOpen={isHelplineOpen}
        onClose={() => setIsHelplineOpen(false)}
        contacts={contacts}
        areaName={currentArea?.name}
      />

      {/* 8. Admin & Verification Portal Modal */}
      <AdminModal
        isOpen={isAdminOpen}
        onClose={() => setIsAdminOpen(false)}
        areas={areas}
        onAlertCreated={() => loadData(true)}
      />
    </div>
  );
};

export default App;
