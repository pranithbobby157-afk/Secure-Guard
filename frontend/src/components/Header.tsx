import React, { useEffect, useState } from 'react';
import { Area } from '../types';
import { Copy, Language } from '../i18n/messages';
import { Icon } from './Icon';
import { savedStore } from '../services/savedStore';

export type Page =
  | 'dashboard'
  | 'map'
  | 'conditions'
  | 'routes'
  | 'verify'
  | 'phrasebook'
  | 'saved'
  | 'quick'
  | 'sources'
  | 'contacts'
  | 'editor';

interface HeaderProps {
  t: Copy;
  language: Language;
  setLanguage: (lang: Language) => void;
  page: Page;
  navigate: (p: Page) => void;
  mobileNav: boolean;
  setMobileNav: (v: boolean) => void;
  areas: Area[];
  selectedAreaId: string;
  onSelectArea: (id: string) => void;
  userLocation: { lat: number; lng: number } | null;
  onToggleLocation: () => void;
  isLocating: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  t,
  language,
  setLanguage,
  page,
  navigate,
  mobileNav,
  setMobileNav,
  areas,
  selectedAreaId,
  onSelectArea,
  userLocation,
  onToggleLocation,
  isLocating
}) => {
  const [savedCount, setSavedCount] = useState(() => savedStore.getAll().length);

  useEffect(() => {
    const unsub = savedStore.subscribe((items) => {
      setSavedCount(items.length);
    });
    return unsub;
  }, []);

  const navItems: { key: Page; label: string; icon: any; isSpecial?: boolean; badge?: number }[] = [
    { key: 'dashboard', label: t.dashboard || 'Dashboard', icon: 'shield' },
    { key: 'map', label: t.conditions || 'Map & Shelters', icon: 'building' },
    { key: 'routes', label: 'Route Check', icon: 'route' },
    { key: 'verify', label: 'Verify', icon: 'check' },
    { key: 'phrasebook', label: 'Phrasebook', icon: 'volume' },
    { key: 'saved', label: 'Saved', icon: 'bookmark', badge: savedCount },
    { key: 'sources', label: 'Data Sources', icon: 'database' },
    { key: 'quick', label: 'Quick Mode', icon: 'zap', isSpecial: true }
  ];

  const currentArea = areas.find((a) => a.id === selectedAreaId);

  const isCurrentActive = (key: Page) => {
    if (page === key) return true;
    if (key === 'map' && page === 'conditions') return true;
    return false;
  };

  return (
    <header className="sticky top-0 z-40 border-b border-[#E2E8F0] bg-white">
      <div className="mx-auto flex h-16 max-w-[1440px] items-center gap-3 px-4 sm:px-6 lg:px-8">
        {/* Brand */}
        <button type="button" onClick={() => navigate('dashboard')} className="brand shrink-0">
          <span className="brand-mark">
            <Icon name="shield" size={21} />
          </span>
          <span>
            <strong>SafeRoute</strong>
            <small>{t.tagline}</small>
          </span>
        </button>

        {/* Primary Desktop Nav */}
        <nav
          className="ms-4 hidden h-full items-center gap-0.5 xl:flex"
          aria-label="Primary"
        >
          {navItems.map((item) => (
            <button
              type="button"
              key={item.key}
              onClick={() => navigate(item.key)}
              aria-current={isCurrentActive(item.key) ? 'page' : undefined}
              className={`top-nav px-2.5 py-1 text-xs ${
                item.isSpecial
                  ? 'text-[#D92D20] font-black hover:text-[#B42318]'
                  : isCurrentActive(item.key)
                  ? 'active'
                  : ''
              }`}
            >
              <span className="flex items-center gap-1.5">
                {item.label}
                {item.badge !== undefined && item.badge > 0 && (
                  <span className="rounded-full bg-[#007F78] px-1.5 py-0.2 text-[10px] font-extrabold text-white">
                    {item.badge}
                  </span>
                )}
                {item.isSpecial && (
                  <span className="size-2 rounded-full bg-[#D92D20] animate-pulse" />
                )}
              </span>
            </button>
          ))}
        </nav>

        {/* Medium Screen Secondary Nav (Dropdown or Scrollable) */}
        <nav
          className="ms-3 hidden h-full items-center gap-1 lg:flex xl:hidden overflow-x-auto"
          aria-label="Compact Nav"
        >
          {navItems.slice(0, 5).map((item) => (
            <button
              type="button"
              key={item.key}
              onClick={() => navigate(item.key)}
              className={`top-nav px-2 text-xs ${isCurrentActive(item.key) ? 'active' : ''}`}
            >
              {item.label}
            </button>
          ))}
        </nav>

        {/* Header Actions */}
        <div className="ms-auto flex items-center gap-2">
          {/* Quick Mode Button on tablet/mobile if hidden from top-nav */}
          <button
            type="button"
            onClick={() => navigate('quick')}
            className="flex min-h-9 items-center gap-1.5 rounded-lg border border-red-200 bg-red-50 px-2.5 text-xs font-black text-[#D92D20] hover:bg-red-100 xl:hidden"
            title="Open high-priority quick emergency mode"
          >
            <Icon name="zap" size={14} />
            <span className="hidden sm:inline">Quick Mode</span>
          </button>

          {/* Language Selector */}
          <label className="language-control">
            <span className="sr-only">{t.lang}</span>
            <Icon name="globe" size={16} />
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value as Language)}
              aria-label={t.lang}
            >
              <option value="en">English</option>
              <option value="ta">தமிழ்</option>
              <option value="hi">हिन्दी</option>
              <option value="fr">Français</option>
            </select>
            <Icon name="chevron" size={12} />
          </label>

          {/* Emergency Helplines Button */}
          <button
            type="button"
            onClick={() => navigate('contacts')}
            className="header-emergency"
            title="View verified emergency helplines"
          >
            <Icon name="phone" size={16} />
            <span className="hidden sm:inline">{t.contacts || 'Contacts'}</span>
          </button>

          {/* Operations / Editor Access */}
          <button
            type="button"
            onClick={() => navigate('editor')}
            className={`hidden rounded-lg px-2.5 py-1.5 text-xs font-bold text-[#475467] hover:bg-slate-50 md:block ${
              page === 'editor' ? 'bg-slate-100 text-[#005E59]' : ''
            }`}
          >
            {t.editor || 'Editor'}
          </button>

          {/* Mobile Menu Toggle */}
          <button
            type="button"
            className="icon-button lg:hidden"
            onClick={() => setMobileNav(!mobileNav)}
            aria-expanded={mobileNav}
            aria-label={t.mobileNav || 'Open menu'}
          >
            <Icon name={mobileNav ? 'x' : 'menu'} />
          </button>
        </div>
      </div>

      {/* Mobile Nav Drawer */}
      {mobileNav && (
        <nav
          className="max-h-[calc(100vh-64px)] overflow-y-auto border-t border-[#E2E8F0] bg-white p-3 lg:hidden"
          aria-label="Mobile Navigation"
        >
          <div className="space-y-1">
            {navItems.map((item) => (
              <button
                type="button"
                key={item.key}
                onClick={() => navigate(item.key)}
                className={`mobile-nav ${
                  item.isSpecial
                    ? 'bg-red-50 text-[#D92D20] font-black'
                    : isCurrentActive(item.key)
                    ? 'bg-slate-100 text-[#005E59] font-bold'
                    : ''
                }`}
              >
                <span className="flex items-center gap-2.5">
                  <Icon name={item.icon} size={18} />
                  <span>{item.label}</span>
                </span>
                <span className="flex items-center gap-2">
                  {item.badge !== undefined && item.badge > 0 && (
                    <span className="rounded-full bg-[#007F78] px-2 py-0.5 text-xs font-extrabold text-white">
                      {item.badge}
                    </span>
                  )}
                  <Icon name="arrow" size={16} />
                </span>
              </button>
            ))}

            <div className="border-t border-[#E2E8F0] pt-2 mt-2">
              <button
                type="button"
                onClick={() => navigate('contacts')}
                className="mobile-nav text-[#D92D20] font-bold"
              >
                <span className="flex items-center gap-2.5">
                  <Icon name="phone" size={18} />
                  <span>{t.contacts || 'Emergency Contacts'}</span>
                </span>
                <Icon name="arrow" size={16} />
              </button>

              <button
                type="button"
                onClick={() => navigate('editor')}
                className="mobile-nav font-medium text-[#475467]"
              >
                <span className="flex items-center gap-2.5">
                  <Icon name="lock" size={18} />
                  <span>{t.editor || 'Operations & Editor Access'}</span>
                </span>
                <Icon name="arrow" size={16} />
              </button>
            </div>
          </div>
        </nav>
      )}

      {/* Location Bar with Search / Selection */}
      <div className="location-bar">
        <div className="mx-auto flex max-w-[1440px] items-center gap-3 px-4 py-2 sm:px-6 lg:px-8">
          <Icon name="location" size={16} />
          <span className="hidden text-xs font-semibold text-[#667085] sm:block">
            {t.selectLocation}:
          </span>
          <div className="relative flex items-center">
            <select
              value={selectedAreaId}
              onChange={(e) => onSelectArea(e.target.value)}
              className="appearance-none bg-transparent pr-6 text-start text-sm font-bold text-[#101828] cursor-pointer focus:outline-none"
              aria-label={t.selectLocation}
            >
              {areas.length > 0 ? (
                areas.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name}, {a.state_region}
                  </option>
                ))
              ) : (
                <option value="area-chennai-coastal">
                  {currentArea
                    ? `${currentArea.name}, ${currentArea.state_region}`
                    : t.location}
                </option>
              )}
            </select>
            <span className="pointer-events-none absolute right-1">
              <Icon name="chevron" size={13} />
            </span>
          </div>

          {/* Browser Geolocation Button */}
          <button
            type="button"
            onClick={onToggleLocation}
            className={`ms-auto flex items-center gap-1.5 text-xs font-bold ${
              userLocation ? 'text-[#079455]' : 'text-[#007F78]'
            } hover:underline`}
            title={
              userLocation
                ? 'Browser GPS coordinates active'
                : 'Locate nearest safe zones'
            }
          >
            <Icon name="route" size={15} />
            <span>
              {isLocating
                ? 'Locating...'
                : userLocation
                ? `GPS Active (${userLocation.lat.toFixed(2)}, ${userLocation.lng.toFixed(2)})`
                : t.useLocation}
            </span>
          </button>
        </div>
      </div>
    </header>
  );
};
