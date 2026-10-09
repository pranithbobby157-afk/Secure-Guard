import React from 'react';
import { SafeZone } from '../types';
import { Copy } from '../i18n/messages';
import { Icon, IconName } from './Icon';

interface ShelterListProps {
  safeZones: SafeZone[];
  t: Copy;
}

export const ShelterList: React.FC<ShelterListProps> = ({ safeZones, t }) => {
  const getIcon = (type: string): IconName => {
    switch (type) {
      case 'hospital':
        return 'hospital';
      case 'relief_centre':
        return 'users';
      case 'transit_hub':
        return 'route';
      default:
        return 'building';
    }
  };

  const getTypeName = (type: string) => {
    switch (type) {
      case 'hospital':
        return t.hospital;
      case 'relief_centre':
        return 'Relief Centre';
      case 'transit_hub':
        return 'Transit Hub';
      default:
        return t.shelter;
    }
  };

  return (
    <section className="section-block" aria-labelledby="shelters-heading">
      <div className="section-heading">
        <div>
          <span className="kicker">03 / RESOURCES</span>
          <h2 id="shelters-heading">{t.shelterTitle}</h2>
          <p>{t.shelterIntro}</p>
        </div>
        <span className="record-count">{safeZones.length}</span>
      </div>

      <div className="shelter-list" aria-label={t.alternative}>
        {safeZones.length > 0 ? (
          safeZones.map((sz, index) => {
            const distanceText =
              sz.distance_km != null
                ? `${sz.distance_km.toFixed(1)} km`
                : t.unavailable;

            return (
              <article key={sz.id} className="shelter-row">
                <span className="facility-icon">
                  <Icon name={getIcon(sz.facility_type)} size={21} />
                </span>

                <div className="facility-main">
                  <div className="badge-row">
                    <span className="demo-badge">
                      {sz.is_simulated ? t.demoListing : 'Official Facility'}
                    </span>
                    <span className="unverified">
                      <Icon name="info" size={13} />
                      {sz.is_simulated ? t.notVerified : 'Verified'}
                    </span>
                  </div>
                  <h3>{sz.name}</h3>
                  <p>
                    {getTypeName(sz.facility_type)} · {sz.address}
                  </p>
                </div>

                <dl>
                  <div>
                    <dt>{t.approximate}</dt>
                    <dd className="font-bold text-[#005E59]">{distanceText}</dd>
                  </div>
                  <div>
                    <dt>{t.sourceOrg}</dt>
                    <dd>{sz.source_name || 'Municipal Registry'}</dd>
                  </div>
                  <div>
                    <dt>{t.capacity}</dt>
                    <dd>{sz.capacity_notes || 'Operational'}</dd>
                  </div>
                </dl>

                <details>
                  <summary>
                    {t.detailsAction}
                    <Icon name="chevron" size={15} />
                  </summary>
                  <p>
                    <strong>{t.lastVerified}:</strong>{' '}
                    {new Date(sz.last_verified_at).toLocaleDateString([], {
                      month: 'short',
                      day: 'numeric'
                    })}
                    .<br />
                    <strong>{t.address}:</strong> {sz.address}.<br />
                    <strong>Status:</strong>{' '}
                    <span className="capitalize">{sz.operational_status}</span>.<br />
                    <strong>ID:</strong> {sz.id}
                  </p>
                </details>
              </article>
            );
          })
        ) : (
          <div className="empty-state">
            <span>
              <Icon name="building" size={25} />
            </span>
            <h3>No designated shelters returned</h3>
            <p>
              Confirm designated assembly locations with local emergency services.
            </p>
          </div>
        )}
      </div>
    </section>
  );
};
