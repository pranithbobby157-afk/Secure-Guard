import React, { useState, useEffect, useCallback } from 'react';
import { api } from './services/api';
import { Alert, Area, EmergencyContact, SafeZone, SystemStatus } from './types';
import { Copy, Language, messages } from './i18n/messages';
import { Header, Page } from './components/Header';
import { Dashboard } from './components/Dashboard';
import { ConditionsPage } from './components/ConditionsPage';
import { ContactsPage } from './components/ContactsPage';
import { EditorPage } from './components/EditorPage';
import { Footer } from './components/Footer';
import { Scenario } from './components/StatusHero';
import { Icon } from './components/Icon';

export const App: React.FC = () => {
  // Navigation & Language
  const [page, setPage] = useState<Page>(() => {
    if (typeof window !== 'undefined') {
      const hash = window.location.hash || '';
      const search = window.location.search || '';
      if (
        hash.includes('access_token') ||
        hash.includes('error') ||
        search.includes('code=') ||
        search.includes('error=')
      ) {
        return 'editor';
      }
      const returnPage = sessionStorage.getItem('saferoute_auth_redirect_page') as Page | null;
      if (returnPage && ['dashboard', 'conditions', 'contacts', 'editor'].includes(returnPage)) {
        sessionStorage.removeItem('saferoute_auth_redirect_page');
        return returnPage;
      }
    }
    return 'dashboard';
  });
  const [language, setLanguage] = useState<Language>('en');
  const [mobileNav, setMobileNav] = useState(false);
  const t: Copy = messages[language];

  // Areas & Location
  const [areas, setAreas] = useState<Area[]>([]);
  const [selectedAreaId, setSelectedAreaId] = useState<string>('area-chennai-coastal');
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [isLocating, setIsLocating] = useState<boolean>(false);

  // Application Data
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [safeZones, setSafeZones] = useState<SafeZone[]>([]);
  const [contacts, setContacts] = useState<EmergencyContact[]>([]);
  const [status, setStatus] = useState<SystemStatus | null>(null);
  const [lastSyncTime, setLastSyncTime] = useState<string>('just now');

  // Scenario
  const [scenario, setScenario] = useState<Scenario>('cyclone');
  const [isScenarioLoading, setIsScenarioLoading] = useState(false);

  // Smooth Navigation
  const navigate = (next: Page) => {
    setPage(next);
    setMobileNav(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // 1. Fetch available geographic areas on start
  useEffect(() => {
    api.getAreas()
      .then((data) => {
        setAreas(data);
        if (data.length > 0 && !selectedAreaId) {
          setSelectedAreaId(data[0].id);
        }
      })
      .catch((err) => console.warn('Could not load areas from backend', err));
  }, []);

  // 2. Main data loader
  const loadData = useCallback(async () => {
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
      setLastSyncTime(
        new Date().toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit'
        })
      );

      // Cache locally for offline grace during connectivity loss
      try {
        localStorage.setItem(`saferoute_alerts_${selectedAreaId}`, JSON.stringify(alertsRes));
        localStorage.setItem(`saferoute_safezones_${selectedAreaId}`, JSON.stringify(safeZonesRes));
      } catch {}
    } catch (err) {
      console.warn('Network error or server unavailable. Reading from offline cache...', err);
      try {
        const cachedAlerts = localStorage.getItem(`saferoute_alerts_${selectedAreaId}`);
        const cachedSafeZones = localStorage.getItem(`saferoute_safezones_${selectedAreaId}`);
        if (cachedAlerts) setAlerts(JSON.parse(cachedAlerts));
        if (cachedSafeZones) setSafeZones(JSON.parse(cachedSafeZones));
      } catch {}
    }
  }, [selectedAreaId, userLocation]);

  // Initial fetch and auto-refresh every 45s
  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 45000);
    return () => clearInterval(interval);
  }, [loadData]);

  // Handle Scenario Switching
  const handleSelectScenario = async (s: Scenario) => {
    setScenario(s);
    setIsScenarioLoading(true);

    try {
      const backendScenarioMap: Record<Scenario, string> = {
        default: 'default',
        cyclone: 'cyclone_active',
        clear: 'all_clear',
        outage: 'source_outage'
      };

      await api.setDemoScenario(backendScenarioMap[s]);
      await loadData();
    } catch (err) {
      console.warn('Failed to switch scenario on server', err);
    } finally {
      setIsScenarioLoading(false);
    }
  };

  // Browser Geolocation
  const handleToggleLocation = () => {
    if (userLocation) {
      setUserLocation(null);
      return;
    }

    if (!('geolocation' in navigator)) {
      alert('Geolocation is not supported by your browser.');
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude
        });
        setIsLocating(false);
      },
      (error) => {
        console.warn('Geolocation denied or unavailable', error);
        // Default to Marina Beach coordinates for demo testing if permission not granted
        setUserLocation({ lat: 13.0500, lng: 80.2824 });
        setIsLocating(false);
      },
      { timeout: 6000, enableHighAccuracy: true }
    );
  };

  const currentArea = areas.find((a) => a.id === selectedAreaId);
  const activeAlerts = alerts.filter((a) => a.status === 'active');

  return (
    <div className="min-h-screen bg-[#F6F8FA] text-[#101828]">
      {/* Skip to Main Content Accessible Link */}
      <a href="#main" className="skip-link">
        {t.skip}
      </a>

      {/* Header */}
      <Header
        t={t}
        language={language}
        setLanguage={setLanguage}
        page={page}
        navigate={navigate}
        mobileNav={mobileNav}
        setMobileNav={setMobileNav}
        areas={areas}
        selectedAreaId={selectedAreaId}
        onSelectArea={setSelectedAreaId}
        userLocation={userLocation}
        onToggleLocation={handleToggleLocation}
        isLocating={isLocating}
      />

      {/* Main Pages */}
      <main id="main">
        {page === 'dashboard' && (
          <Dashboard
            t={t}
            language={language}
            scenario={scenario}
            onSelectScenario={handleSelectScenario}
            navigate={navigate}
            alerts={activeAlerts}
            currentArea={currentArea}
            status={status}
            lastSyncTime={lastSyncTime}
            isScenarioLoading={isScenarioLoading}
          />
        )}

        {page === 'conditions' && (
          <ConditionsPage
            t={t}
            area={currentArea}
            alerts={activeAlerts}
            safeZones={safeZones}
            sources={status?.sources}
            userLocation={userLocation}
          />
        )}

        {page === 'contacts' && (
          <ContactsPage
            t={t}
            contacts={contacts}
            areaName={currentArea ? `${currentArea.name}, ${currentArea.state_region}` : undefined}
          />
        )}

        {page === 'editor' && (
          <EditorPage
            t={t}
            navigate={navigate}
            areas={areas}
            alerts={alerts}
            status={status}
            onRefreshData={loadData}
          />
        )}
      </main>

      {/* Footer */}
      <Footer t={t} />

      {/* Floating Emergency Action Button (FAB) */}
      {page !== 'contacts' && page !== 'editor' && (
        <button
          type="button"
          className="emergency-fab"
          onClick={() => navigate('contacts')}
          aria-label={t.contacts}
        >
          <Icon name="phone" size={19} />
          <span>{t.contacts}</span>
        </button>
      )}
    </div>
  );
};

export default App;
