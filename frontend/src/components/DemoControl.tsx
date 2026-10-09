import React from 'react';
import { Copy } from '../i18n/messages';
import { Icon } from './Icon';
import { Scenario } from './StatusHero';

interface DemoControlProps {
  t: Copy;
  scenario: Scenario;
  onSelectScenario: (s: Scenario) => void;
  isLoading?: boolean;
}

export const DemoControl: React.FC<DemoControlProps> = ({
  t,
  scenario,
  onSelectScenario,
  isLoading = false
}) => {
  const options: [Scenario, string][] = [
    ['default', t.default],
    ['cyclone', t.redAlert],
    ['clear', t.clearDemo],
    ['outage', t.outage]
  ];

  const currentLabel =
    scenario === 'default'
      ? t.default
      : scenario === 'cyclone'
      ? t.redAlert
      : scenario === 'clear'
      ? t.clearDemo
      : t.outage;

  return (
    <details className="demo-control" open>
      <summary>
        <span>
          <Icon name="settings" size={16} />
          {t.demoControls}
        </span>
        <strong>{isLoading ? 'Updating…' : currentLabel}</strong>
        <Icon name="chevron" size={15} />
      </summary>
      <div>
        <p>{t.demoHint}</p>
        <div className="demo-options">
          {options.map(([key, label]) => (
            <button
              type="button"
              key={key}
              onClick={() => onSelectScenario(key)}
              className={scenario === key ? 'active' : ''}
              disabled={isLoading}
            >
              {scenario === key && <Icon name="check" size={15} />}
              <span>{label}</span>
            </button>
          ))}
        </div>
      </div>
    </details>
  );
};
