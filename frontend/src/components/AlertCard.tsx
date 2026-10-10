import React, { useState } from 'react';
import { Alert } from '../types';
import { Copy, Language } from '../i18n/messages';
import { Icon } from './Icon';
import { savedStore } from '../services/savedStore';

interface AlertCardProps {
  alert: Alert;
  t: Copy;
  language: Language;
  areaName?: string;
}

export const AlertCard: React.FC<AlertCardProps> = ({
  alert,
  t,
  language,
  areaName
}) => {
  const [open, setOpen] = useState(false);
  const [isSaved, setIsSaved] = useState(() => savedStore.isSaved(`alert-${alert.id}`));

  // Find translation matching user's selected language
  const translation = alert.translations?.find(
    (tr) => tr.target_language === language
  );

  const isCritical = alert.severity === 'critical';
  const severityClass = isCritical
    ? 'severity critical'
    : alert.severity === 'warning'
    ? 'severity bg-amber-100 text-[#B54708]'
    : 'severity bg-blue-100 text-[#175CD3]';

  const severityLabel =
    alert.severity === 'critical'
      ? t.critical
      : alert.severity === 'warning'
      ? t.warning
      : alert.severity === 'watch'
      ? t.watch
      : t.info;

  const isOfficial = alert.verification_status === 'official_source';
  const displayArea = alert.area ? `${alert.area.name}, ${alert.area.state_region}` : (areaName || t.area);

  // Formatted issue time
  const issuedDate = new Date(alert.issued_at);
  const formattedIssued = !isNaN(issuedDate.getTime())
    ? `${issuedDate.toLocaleDateString([], { day: 'numeric', month: 'short' })} · ${issuedDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} IST`
    : 'Official Broadcast';

  // Staleness / retrieval
  const retrievedDisplay = alert.is_stale
    ? `⚠️ Stale (${alert.freshness_minutes || 42}m ago)`
    : alert.freshness_minutes != null
    ? `${alert.freshness_minutes}m ago`
    : 'Synced';

  return (
    <article className="alert-card">
      <div
        className={`alert-accent ${
          isCritical ? 'bg-[#D92D20]' : alert.severity === 'warning' ? 'bg-[#DC6803]' : 'bg-[#007F78]'
        }`}
      />
      <div className="alert-content">
        <div className="badge-row">
          <span className={severityClass}>
            <Icon name={isCritical ? 'alert' : 'warning'} size={13} />
            {severityLabel}
          </span>
          {alert.is_simulated && (
            <span className="demo-badge">{t.simulation}</span>
          )}
          <span className={isOfficial ? 'verified-state' : 'unverified'}>
            <Icon name={isOfficial ? 'check' : 'info'} size={14} />
            {isOfficial ? 'Verified official source' : t.unverified}
          </span>
        </div>

        <h3>{translation?.translated_title || alert.title}</h3>

        <p className="alert-area">
          <Icon name="location" size={16} />
          <strong>{t.affected}:</strong> {displayArea}
        </p>

        <p className="alert-description">
          {translation?.translated_description || alert.description_original}
        </p>

        {/* Recommended action */}
        <div className="instruction">
          <Icon name="shield" size={20} />
          <div>
            <strong>{t.instruction}</strong>
            <p>
              {translation?.translated_instruction ||
                alert.instruction_original ||
                t.alertAction}
            </p>
          </div>
        </div>

        {/* Unofficial translation card if not English */}
        {language !== 'en' && (
          <div className="translation">
            <span>{t.translated} ({t.lang})</span>
            <p>
              {translation?.translated_description ||
                alert.description_original}
            </p>
            {translation?.translated_instruction && (
              <p className="mt-2 font-semibold">
                👉 {translation.translated_instruction}
              </p>
            )}
            <small>{t.notReplace}</small>
          </div>
        )}

        {/* Source facts */}
        <dl className="alert-facts">
          <div>
            <dt>{t.source}</dt>
            <dd>{alert.source?.name || 'India Meteorological Department (IMD)'}</dd>
          </div>
          <div>
            <dt>{t.issued}</dt>
            <dd>{formattedIssued}</dd>
          </div>
          <div>
            <dt>{t.retrieved}</dt>
            <dd>{retrievedDisplay}</dd>
          </div>
        </dl>

        {/* Expandable metadata drawer */}
        {open && (
          <div className="metadata">
            <div>
              <span>{t.original}</span>
              <p>{alert.description_original}</p>
              {alert.instruction_original && (
                <p className="mt-2 text-xs italic">
                  Original Directive: {alert.instruction_original}
                </p>
              )}
            </div>
            <dl>
              <div>
                <dt>Record ID</dt>
                <dd className="font-mono">{alert.id}</dd>
              </div>
              <div>
                <dt>{t.verification}</dt>
                <dd>{alert.verification_status}</dd>
              </div>
              <div>
                <dt>{t.status}</dt>
                <dd className="capitalize">{alert.status}</dd>
              </div>
            </dl>
          </div>
        )}

        <div className="alert-actions">
          <button
            type="button"
            className="primary-button"
            onClick={() => setOpen(!open)}
          >
            {open ? t.hide : t.details}
            <Icon name={open ? 'chevron' : 'arrow'} size={16} />
          </button>
          <button
            type="button"
            className="text-button"
            onClick={() => setOpen(!open)}
          >
            {t.metadata}
          </button>
          {alert.source_url && (
            <a
              href={alert.source_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-button inline-flex items-center gap-1"
            >
              Official Bulletin <Icon name="external" size={13} />
            </a>
          )}
          <button
            type="button"
            className="ms-auto flex items-center gap-1.5 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] px-3 py-1.5 text-xs font-bold text-[#475467] hover:bg-[#EAECF0]"
            onClick={() => {
              savedStore.toggle({
                id: `alert-${alert.id}`,
                type: 'alert',
                title: translation?.translated_title || alert.title,
                subtitle: `${alert.hazard_type.toUpperCase()} · ${alert.severity.toUpperCase()}`,
                badge: alert.severity.toUpperCase(),
                details: alert.description_original,
                data: alert
              });
              setIsSaved(!isSaved);
            }}
            title={isSaved ? 'Remove from Saved' : 'Save to Bookmarks'}
          >
            <Icon name={isSaved ? 'check' : 'bookmark'} size={14} />
            <span>{isSaved ? 'Saved' : 'Save Alert'}</span>
          </button>
        </div>
      </div>
    </article>
  );
};
