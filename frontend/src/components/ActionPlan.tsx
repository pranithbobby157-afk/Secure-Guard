import React from 'react';
import { Copy } from '../i18n/messages';

interface ActionPlanProps {
  t: Copy;
  compact?: boolean;
}

export const ActionPlan: React.FC<ActionPlanProps> = ({ t, compact = false }) => {
  const steps = [t.step1, t.step2, t.step3, t.step4, t.step5];
  return (
    <aside className={`action-plan ${compact ? 'compact' : ''}`}>
      <span className="kicker">GUIDANCE</span>
      <h2>{t.emergencyPlan}</h2>
      <p>{t.planIntro}</p>
      <ol>
        {steps.map((step, i) => (
          <li key={i}>
            <span>{i + 1}</span>
            <p>{step}</p>
          </li>
        ))}
      </ol>
    </aside>
  );
};
