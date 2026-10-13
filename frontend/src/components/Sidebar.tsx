import React from 'react';
import { Copy } from '../i18n/messages';
import { Icon } from './Icon';
import { Page } from './Header';

interface SidebarProps {
  t: Copy;
  page: Page;
  navigate: (p: Page) => void;
  savedCount: number;
  mobileNav: boolean;
  setMobileNav: (v: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  t,
  page,
  navigate,
  savedCount,
  mobileNav,
  setMobileNav
}) => {
  const isCurrentActive = (key: Page) => {
    if (page === key) return true;
    if (key === 'map' && page === 'conditions') return true;
    return false;
  };

  const pageNavItems: { key: Page; label: string; icon: any; badge?: number }[] = [
    { key: 'dashboard', label: t.dashboard || 'Dashboard', icon: 'shield' },
    { key: 'map', label: t.conditions || 'Conditions & shelters', icon: 'building' },
    { key: 'routes', label: 'Route Check', icon: 'route' },
    { key: 'verify', label: 'Verify', icon: 'check' },
    { key: 'phrasebook', label: 'Phrasebook', icon: 'volume' },
    { key: 'saved', label: 'Saved', icon: 'bookmark', badge: savedCount },
    { key: 'sources', label: 'Data Sources', icon: 'database' }
  ];

  const quickNavItems: { key: Page; label: string; icon: any; hasDot?: boolean }[] = [
    { key: 'quick', label: 'Quick Mode', icon: 'zap', hasDot: true },
    { key: 'editor', label: 'Editor access', icon: 'lock' }
  ];

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {mobileNav && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs lg:hidden"
          onClick={() => setMobileNav(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed inset-y-0 start-0 z-50 flex w-64 flex-col bg-[#0C1825] text-white transition-transform duration-200 ease-in-out lg:static lg:translate-x-0 ${
          mobileNav ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
        }`}
        aria-label="Sidebar Navigation"
      >
        {/* Brand Header */}
        <div className="flex h-20 items-center justify-between border-b border-white/10 px-5">
          <button
            type="button"
            onClick={() => {
              navigate('dashboard');
              setMobileNav(false);
            }}
            className="flex items-center gap-3 text-start hover:opacity-90 transition-opacity"
          >
            <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-[#007F78] text-white shadow-md shadow-teal-900/40">
              <Icon name="shield" size={20} />
            </span>
            <div className="flex flex-col">
              <strong className="text-base font-extrabold tracking-tight text-white leading-tight">
                SafeRoute
              </strong>
              <small className="text-[8px] font-extrabold tracking-[0.14em] text-[#94A3B8] uppercase">
                {t.tagline || 'TOURIST CRISIS COMMUNICATION'}
              </small>
            </div>
          </button>

          {/* Close button on mobile */}
          <button
            type="button"
            onClick={() => setMobileNav(false)}
            className="grid size-8 place-items-center rounded-lg text-slate-400 hover:bg-white/10 hover:text-white lg:hidden"
            aria-label="Close sidebar"
          >
            <Icon name="x" size={18} />
          </button>
        </div>

        {/* Scrollable Navigation Body */}
        <div className="flex-1 overflow-y-auto px-3 py-5 scrollbar-thin">
          {/* Section: PAGES */}
          <div>
            <div className="px-3 pb-2 text-[10px] font-extrabold uppercase tracking-[0.18em] text-[#64748B]">
              PAGES
            </div>
            <nav className="space-y-1">
              {pageNavItems.map((item) => {
                const active = isCurrentActive(item.key);
                return (
                  <button
                    type="button"
                    key={item.key}
                    onClick={() => {
                      navigate(item.key);
                      setMobileNav(false);
                    }}
                    className={`group flex w-full items-center justify-between rounded-xl px-3.5 py-2.5 text-xs font-bold transition-all ${
                      active
                        ? 'bg-[#38D9A9] text-[#0A192F] shadow-sm'
                        : 'text-[#94A3B8] hover:bg-white/8 hover:text-white'
                    }`}
                  >
                    <span className="flex items-center gap-3">
                      <span className={active ? 'text-[#0A192F]' : 'text-[#64748B] group-hover:text-slate-300'}>
                        <Icon name={item.icon} size={17} />
                      </span>
                      <span>{item.label}</span>
                    </span>

                    <span className="flex items-center gap-2">
                      {item.badge !== undefined && item.badge > 0 && (
                        <span
                          className={`rounded-full px-2 py-0.2 text-[10px] font-extrabold ${
                            active
                              ? 'bg-[#0A192F] text-[#38D9A9]'
                              : 'bg-[#007F78] text-white'
                          }`}
                        >
                          {item.badge}
                        </span>
                      )}
                      <span className={active ? 'text-[#0A192F]' : 'text-[#475569] group-hover:text-slate-300'}>
                        <Icon name="arrow" size={13} />
                      </span>
                    </span>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Section: QUICK ACCESS */}
          <div className="mt-7">
            <div className="px-3 pb-2 text-[10px] font-extrabold uppercase tracking-[0.18em] text-[#64748B]">
              QUICK ACCESS
            </div>
            <nav className="space-y-1">
              {quickNavItems.map((item) => {
                const active = isCurrentActive(item.key);
                return (
                  <button
                    type="button"
                    key={item.key}
                    onClick={() => {
                      navigate(item.key);
                      setMobileNav(false);
                    }}
                    className={`group flex w-full items-center justify-between rounded-xl px-3.5 py-2.5 text-xs font-bold transition-all ${
                      active
                        ? 'bg-[#38D9A9] text-[#0A192F] shadow-sm'
                        : 'text-[#94A3B8] hover:bg-white/8 hover:text-white'
                    }`}
                  >
                    <span className="flex items-center gap-3">
                      <span className={active ? 'text-[#0A192F]' : 'text-[#64748B] group-hover:text-slate-300'}>
                        <Icon name={item.icon} size={17} />
                      </span>
                      <span>{item.label}</span>
                    </span>

                    <span className="flex items-center gap-2">
                      {item.hasDot && (
                        <span className="size-2 rounded-full bg-[#EF4444] animate-pulse" />
                      )}
                      <span className={active ? 'text-[#0A192F]' : 'text-[#475569] group-hover:text-slate-300'}>
                        <Icon name="arrow" size={13} />
                      </span>
                    </span>
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Footer status summary inside sidebar */}
        <div className="border-t border-white/10 p-4 text-[11px] text-[#64748B]">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-2 font-medium">
              <span className="size-2 rounded-full bg-[#10B981]" />
              SafeRoute Live
            </span>
            <span className="text-[10px] font-mono text-[#94A3B8]">v1.0.0</span>
          </div>
        </div>
      </aside>
    </>
  );
};
