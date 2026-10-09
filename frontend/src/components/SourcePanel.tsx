import React from 'react';
import { Copy } from '../i18n/messages';
import { Icon } from './Icon';
import { Source } from '../types';

interface SourcePanelProps {
  t: Copy;
  sources?: Source[];
}

export const SourcePanel: React.FC<SourcePanelProps> = ({ t, sources = [] }) => {
  return (
    <aside className="source-panel">
      <Icon name="document" size={20} />
      <div className="flex-1">
        <h2>{t.sourcePanel}</h2>
        <p>{t.sourceBody}</p>
        {sources.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2 text-[11px]">
            {sources.map((s) => (
              <span
                key={s.id}
                className="inline-flex items-center gap-1.5 rounded-md bg-slate-100 px-2.5 py-1 font-semibold text-[#344054]"
                title={`${s.name} · ${s.attribution_text}`}
              >
                <span
                  className={`size-2 rounded-full ${
                    s.health_status === 'healthy'
                      ? 'bg-[#079455]'
                      : s.health_status === 'degraded'
                      ? 'bg-[#DC6803]'
                      : 'bg-[#D92D20]'
                  }`}
                />
                <span>{s.name}</span>
                <span className={`text-[10px] font-normal ${s.health_status === 'healthy' ? 'text-[#005E59]' : 'text-[#B54708]'}`}>
                  ({s.health_status === 'healthy' ? 'Healthy' : s.health_status === 'degraded' ? 'Degraded' : 'Offline'})
                </span>
              </span>
            ))}
          </div>
        )}
      </div>
      <span>{t.simulation}</span>
    </aside>
  );
};
