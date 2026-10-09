import React from 'react';
import { Copy } from '../i18n/messages';
import { Icon } from './Icon';

interface FooterProps {
  t: Copy;
}

export const Footer: React.FC<FooterProps> = ({ t }) => {
  return (
    <footer className="mt-20 border-t border-[#E2E8F0] bg-white text-[#475467]">
      <div className="mx-auto max-w-[1240px] px-4 py-12 sm:px-6 lg:px-10">
        <div className="flex flex-col justify-between gap-8 md:flex-row md:items-start">
          <div className="max-w-md">
            <div className="brand">
              <span className="brand-mark">
                <Icon name="shield" size={21} />
              </span>
              <span>
                <strong>SafeRoute</strong>
                <small>{t.tagline}</small>
              </span>
            </div>
            <p className="mt-4 text-xs leading-6 text-[#667085]">
              SafeRoute is an authoritative crisis communication aid designed specifically for travellers caught in extreme weather disasters in coastal Tamil Nadu.
            </p>
          </div>

          <div className="flex flex-col gap-2 text-xs">
            <strong className="text-sm text-[#101828]">Authoritative Provenance</strong>
            <span className="text-[#667085]">• India Meteorological Department (IMD)</span>
            <span className="text-[#667085]">• Tamil Nadu State Disaster Management (TNSDMA)</span>
            <span className="text-[#667085]">• Greater Chennai Corporation (GCC 24x7)</span>
          </div>

          <div className="flex flex-col gap-2 text-xs">
            <strong className="text-sm text-[#101828]">Hackathon Submission</strong>
            <span className="text-[#667085]">Team: <b>Bits &amp; Bytes</b></span>
            <span className="text-[#667085]">Domain: TravelTech</span>
            <span className="text-[#667085]">IIITDM Kancheepuram 24-Hour Web Dev Hackathon</span>
          </div>
        </div>

        <div className="mt-10 border-t border-[#E2E8F0] pt-6 flex flex-col items-center justify-between gap-4 text-[11px] text-[#98A2B3] sm:flex-row">
          <p>
            ⚠️ Safety Notice: SafeRoute preserves original official bulletins. Straight-line map distances are approximations and never guarantee that unverified routes are safe.
          </p>
          <p>© 2026 SafeRoute Project. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};
