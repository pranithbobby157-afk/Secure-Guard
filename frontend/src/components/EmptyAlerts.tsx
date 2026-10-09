import React from 'react';
import { Copy } from '../i18n/messages';
import { Icon } from './Icon';
import { Scenario } from './StatusHero';

interface EmptyAlertsProps {
  t: Copy;
  scenario: Scenario;
}

export const EmptyAlerts: React.FC<EmptyAlertsProps> = ({ t, scenario }) => {
  return (
    <div className="empty-state">
      <span>
        <Icon name={scenario === 'clear' ? 'check' : 'search'} size={25} />
      </span>
      <h3>{t.noAlerts}</h3>
      <p>{t.noAlertsBody}</p>
    </div>
  );
};
