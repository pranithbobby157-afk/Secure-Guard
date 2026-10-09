import React from 'react';
import { Area } from '../types';
import { Copy, Language } from '../i18n/messages';
import { Icon } from './Icon';

export type Page = 'dashboard' | 'conditions' | 'contacts' | 'editor';

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
  const nav: { key: Page; label: string }[] = [
    { key: 'dashboard', label: t.dashboard },
    { key: 'conditions', label: t.conditions },
    { key: 'contacts', label: t.contacts }
  ];

  const currentArea = areas.find((a) => a.id === selectedAreaId);

  return (
    <header className="sticky top-0 z-40 border-b border-[#E2E8F0] bg-white">
      <div className="mx-auto flex h-16 max-w-[1440px] items-center gap-4 px-4 sm:px-6 lg:px-10">
        <button type="button" onClick={() => navigate('dashboard')} className="brand">
          <span className="brand-mark">
            <Icon name="shield" size={21} />
          </span>
          <span>
            <strong>SafeRoute</strong>
            <small>{t.tagline}</small>
          </span>
        </button>

        <nav className="ms-7 hidden h-full items-center gap-1 lg:flex" aria-label="Primary">
          {nav.map((item) => (
            <button
              type="button"
              key={item.key}
              onClick={() => navigate(item.key)}
              aria-current={page === item.key ? 'page' : undefined}
              className={`top-nav ${page === item.key ? 'active' : ''}`}
            >
              {item.label}
            </button>
          ))}
        </nav>

        <div className="ms-auto flex items-center gap-2">
          {/* Language Selector */}
          <label className="language-control">
            <span className="sr-only">{t.lang}</span>
            <Icon name="globe" size={17} />
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
            <Icon name="chevron" size={13} />
          </label>

          {/* Emergency contacts action */}
          <button
            type="button"
            onClick={() => navigate('contacts')}
            className="header-emergency"
          >
            <Icon name="phone" size={17} />
            <span className="hidden sm:inline">{t.contacts}</span>
          </button>

          {/* Editor access */}
          <button
            type="button"
            onClick={() => navigate('editor')}
            className={`hidden rounded-lg px-3 py-2 text-sm font-semibold text-[#475467] hover:bg-slate-50 md:block ${page === 'editor' ? 'bg-slate-100 text-[#005E59]' : ''}`}
          >
            {t.editor}
          </button>

          {/* Mobile menu toggle */}
          <button
            type="button"
            className="icon-button lg:hidden"
            onClick={() => setMobileNav(!mobileNav)}
            aria-expanded={mobileNav}
            aria-label={t.mobileNav}
          >
            <Icon name={mobileNav ? 'x' : 'menu'} />
          </button>
        </div>
      </div>

      {/* Mobile nav drawer */}
      {mobileNav && (
        <nav className="border-t border-[#E2E8F0] bg-white p-3 lg:hidden" aria-label="Mobile">
          {[...nav, { key: 'editor' as Page, label: t.editor }].map((item) => (
            <button
              type="button"
              key={item.key}
              onClick={() => navigate(item.key)}
              className="mobile-nav"
            >
              {item.label}
              <Icon name="arrow" size={17} />
            </button>
          ))}
        </nav>
      )}

      {/* Location Bar */}
      <div className="location-bar">
        <div className="mx-auto flex max-w-[1440px] items-center gap-3 px-4 py-2 sm:px-6 lg:px-10">
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
                  {currentArea ? `${currentArea.name}, ${currentArea.state_region}` : t.location}
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
            className={`ms-auto flex items-center gap-2 text-xs font-bold ${userLocation ? 'text-[#079455]' : 'text-[#007F78]'} hover:underline`}
            title={userLocation ? 'Browser GPS coordinates active' : 'Locate nearest safe zones'}
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
