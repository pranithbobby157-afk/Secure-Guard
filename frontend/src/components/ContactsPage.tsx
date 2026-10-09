import React from 'react';
import { Copy } from '../i18n/messages';
import { Icon } from './Icon';
import { ActionPlan } from './ActionPlan';
import { EmergencyContact } from '../types';

interface ContactsPageProps {
  t: Copy;
  contacts: EmergencyContact[];
  areaName?: string;
}

export const ContactsPage: React.FC<ContactsPageProps> = ({
  t,
  contacts,
  areaName
}) => {
  return (
    <div className="page-shell narrow">
      <section className="page-intro">
        <div>
          <div className="eyebrow">
            <Icon name="phone" size={14} />
            {areaName || t.location}
          </div>
          <h1>{t.contactTitle}</h1>
          <p>{t.contactIntro}</p>
        </div>
      </section>

      {/* Hero: 112 Primary Helpline */}
      <div className="contact-hero">
        <span>
          <Icon name="phone" size={27} />
        </span>
        <div>
          <small>{t.emergency}</small>
          <strong>112</strong>
          <p>{t.emergencyDesc}</p>
        </div>
        <a href="tel:112" className="call-button">
          <Icon name="phone" size={19} />
          {t.call} 112
        </a>
      </div>

      {/* Regional Verified Helplines Directory */}
      {contacts.length > 0 && (
        <div className="mt-8">
          <h2 className="text-lg font-extrabold text-[#101828] mb-4">
            Regional Emergency Services ({areaName || 'Local Jurisdiction'})
          </h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {contacts.map((c) => (
              <div
                key={c.id}
                className="flex flex-col justify-between rounded-xl border border-[#E2E8F0] bg-white p-4 shadow-sm"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#007F78]">
                      {c.is_toll_free ? 'TOLL FREE 24x7' : 'OFFICIAL HELPLINE'}
                    </span>
                    <strong className="text-xl font-extrabold text-[#101828]">
                      {c.phone_number}
                    </strong>
                  </div>
                  <h3 className="mt-2 text-sm font-bold text-[#344054]">
                    {c.service_name}
                  </h3>
                  {c.description && (
                    <p className="mt-1 text-xs text-[#667085] leading-5">
                      {c.description}
                    </p>
                  )}
                </div>
                <div className="mt-4 pt-3 border-t border-[#E2E8F0]">
                  <a
                    href={`tel:${c.phone_number}`}
                    className="inline-flex min-h-9 items-center justify-center gap-2 rounded-lg bg-[#007F78] px-4 text-xs font-bold text-white hover:bg-[#005E59] w-full"
                  >
                    <Icon name="phone" size={14} />
                    {t.call} {c.phone_number}
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Trust & Provenance Note */}
      <div className="trust-note">
        <Icon name="info" size={19} />
        <p>
          <strong>{t.numberSource}</strong>
          <br />
          Emergency numbers are verified against official state guidelines issued by the Tamil Nadu State Disaster Management Authority and Ministry of Home Affairs.
        </p>
      </div>

      <ActionPlan t={t} />
    </div>
  );
};
