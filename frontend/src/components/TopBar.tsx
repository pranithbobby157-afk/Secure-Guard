import React from 'react';
import { Area } from '../types';
import { Copy, Language } from '../i18n/messages';
import { Icon } from './Icon';
import { Page } from './Header';

interface TopBarProps {
  t: Copy;
  language: Language;
  setLanguage: (lang: Language) => void;
  navigate: (p: Page) => void;
  mobileNav: boolean;
  setMobileNav: (v: boolean) => void;
  areas: Area[];
  selectedAreaId: string;
  onSelectArea: (id: string) => void;
  userLocation: { lat: number; lng: number } | null;
  onToggleLocation: () => void;
  isLocating: boolean;
  searchQuery: string;
  onSearchChange: (q: string) => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  t,
  language,
  setLanguage,
  navigate,
  mobileNav,
  setMobileNav,
  areas,
  selectedAreaId,
  onSelectArea,
  userLocation,
  onToggleLocation,
  isLocating,
  searchQuery,
  onSearchChange
}) => {
  const currentArea = areas.find((a) => a.id === selectedAreaId);

  return (
    <header className="sticky top-0 z-30 border-b border-[#E2E8F0] bg-white shadow-xs">
      <div className="flex h-16 w-full items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
        {/* Left Side: Mobile Menu Button + Search Input */}
        <div className="flex flex-1 items-center gap-3 max-w-xl">
          {/* Mobile Menu Toggle Button */}
          <button
            type="button"
            onClick={() => setMobileNav(!mobileNav)}
            className="grid size-10 shrink-0 place-items-center rounded-xl border border-[#E2E8F0] text-[#475467] hover:bg-slate-50 lg:hidden"
            aria-label="Toggle navigation menu"
          >
            <Icon name={mobileNav ? 'x' : 'menu'} size={18} />
          </button>

          {/* Search Pill Input */}
          <div className="relative flex-1">
            <span className="pointer-events-none absolute inset-y-0 start-3 flex items-center text-[#98A2B3]">
              <Icon name="search" size={16} />
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search alerts, shelters, travel corridors…"
              className="h-10 w-full rounded-full border border-[#E2E8F0] bg-[#F8FAFC] ps-9 pe-4 text-xs font-semibold text-[#101828] placeholder-[#98A2B3] transition-colors focus:border-[#007F78] focus:bg-white focus:outline-none"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => onSearchChange('')}
                className="absolute inset-y-0 end-3 flex items-center text-[#98A2B3] hover:text-[#475467]"
                aria-label="Clear search"
              >
                <Icon name="x" size={14} />
              </button>
            )}
          </div>
        </div>

        {/* Right Side: Area Pill + GPS Pill + Language Pill + Emergency Helplines Button */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* 1. Location Selector Pill */}
          <div className="relative hidden md:flex items-center rounded-full border border-[#E2E8F0] bg-white px-3 py-1.5 shadow-2xs hover:border-[#CBD5E1] transition-colors">
            <span className="text-[#007F78] me-1.5 shrink-0">
              <Icon name="location" size={14} />
            </span>
            <select
              value={selectedAreaId}
              onChange={(e) => onSelectArea(e.target.value)}
              className="appearance-none bg-transparent pe-5 text-xs font-bold text-[#101828] cursor-pointer focus:outline-none max-w-[200px] truncate"
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
            <span className="pointer-events-none absolute end-2.5 text-[#667085]">
              <Icon name="chevron" size={12} />
            </span>
          </div>

          {/* 2. GPS Location Toggle Pill */}
          <button
            type="button"
            onClick={onToggleLocation}
            className={`hidden sm:flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-bold shadow-2xs transition-colors ${
              userLocation
                ? 'border-emerald-200 bg-emerald-50 text-[#079455]'
                : 'border-[#E2E8F0] bg-white text-[#475467] hover:bg-slate-50'
            }`}
            title={userLocation ? 'GPS active in browser RAM' : 'Click to enable device GPS positioning'}
          >
            {userLocation ? (
              <>
                <span className="size-2 rounded-full bg-[#10B981] animate-pulse" />
                <span className="font-mono">
                  GPS Active ({userLocation.lat.toFixed(2)}, {userLocation.lng.toFixed(2)})
                </span>
              </>
            ) : (
              <>
                <span className="text-[#007F78]">
                  <Icon name="compass" size={14} />
                </span>
                <span>{isLocating ? 'Locating…' : t.useLocation || 'Use my location'}</span>
              </>
            )}
          </button>

          {/* 3. Language Selector Pill */}
          <div className="relative flex items-center rounded-full border border-[#E2E8F0] bg-white px-3 py-1.5 shadow-2xs hover:border-[#CBD5E1] transition-colors">
            <span className="text-[#475467] me-1.5 shrink-0">
              <Icon name="globe" size={14} />
            </span>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value as Language)}
              className="appearance-none bg-transparent pe-5 text-xs font-bold text-[#101828] cursor-pointer focus:outline-none"
              aria-label={t.lang}
            >
              <option value="en">English</option>
              <option value="ta">தமிழ்</option>
              <option value="hi">हिन्दी</option>
              <option value="fr">Français</option>
            </select>
            <span className="pointer-events-none absolute end-2.5 text-[#667085]">
              <Icon name="chevron" size={12} />
            </span>
          </div>

          {/* 4. Red Emergency Contacts Button */}
          <button
            type="button"
            onClick={() => navigate('contacts')}
            className="flex min-h-9 items-center gap-2 rounded-full bg-[#D92D20] px-3.5 py-1.5 text-xs font-extrabold text-white shadow-sm shadow-red-900/20 hover:bg-[#B42318] transition-colors active:scale-98"
            title="Open regional verified emergency helplines"
          >
            <Icon name="phone" size={14} />
            <span className="hidden sm:inline">Emergency contacts</span>
          </button>
        </div>
      </div>
    </header>
  );
};
