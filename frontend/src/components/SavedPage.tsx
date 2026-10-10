import React, { useEffect, useState } from 'react';
import { Copy } from '../i18n/messages';
import { Icon } from './Icon';
import { SavedItem, savedStore } from '../services/savedStore';
import { Page } from './Header';

interface SavedPageProps {
  t: Copy;
  navigate: (p: Page) => void;
}

export const SavedPage: React.FC<SavedPageProps> = ({ t: _t, navigate }) => {
  const [items, setItems] = useState<SavedItem[]>(() => savedStore.getAll());
  const [filterType, setFilterType] = useState<string>('all');
  const [showConfirmClear, setShowConfirmClear] = useState(false);

  useEffect(() => {
    const unsubscribe = savedStore.subscribe((updated) => {
      setItems(updated);
    });
    return unsubscribe;
  }, []);

  const handleRemove = (id: string) => {
    savedStore.remove(id);
  };

  const handleClearAll = () => {
    savedStore.clearAll();
    setShowConfirmClear(false);
  };

  const filteredItems = items.filter((item) => {
    if (filterType === 'all') return true;
    return item.type === filterType;
  });

  return (
    <div className="page-shell narrow">
      {/* Intro Header */}
      <section className="page-intro">
        <div>
          <div className="eyebrow">
            <Icon name="bookmark" size={14} />
            Offline Saved Bookmarks
          </div>
          <h1>Saved Emergency Resources</h1>
          <p>
            Quick offline access to critical alerts, relief shelters, helpline contacts, emergency phrases, and assessed travel routes.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className="record-count">{items.length}</span>
          {items.length > 0 && (
            <button
              type="button"
              onClick={() => setShowConfirmClear(true)}
              className="text-xs font-bold text-[#B42318] hover:underline"
            >
              Clear All
            </button>
          )}
        </div>
      </section>

      {/* Storage Isolation Transparency Notice */}
      <div className="mb-6 rounded-xl border border-[#E2E8F0] bg-white p-4 text-xs text-[#475467] shadow-sm">
        <div className="flex items-start gap-2.5">
          <span className="text-[#007F78] mt-0.5">
            <Icon name="lock" size={16} />
          </span>
          <div>
            <strong className="text-sm font-bold text-[#101828] block">
              Device-Local Storage Policy
            </strong>
            <p className="mt-0.5 leading-5 text-[#667085]">
              These entries are persisted securely in your local browser storage for offline crisis readiness. They are isolated to this device and never uploaded to public servers or visible to other users.
            </p>
          </div>
        </div>
      </div>

      {/* Filter Row */}
      {items.length > 0 && (
        <div className="filter-row mb-6" aria-label="Filter saved items">
          {[
            ['all', 'All Items'],
            ['alert', 'Alerts'],
            ['shelter', 'Shelters'],
            ['contact', 'Contacts'],
            ['phrase', 'Phrases'],
            ['route', 'Routes']
          ].map(([key, label]) => {
            const count =
              key === 'all'
                ? items.length
                : items.filter((i) => i.type === key).length;
            return (
              <button
                type="button"
                key={key}
                className={filterType === key ? 'selected' : ''}
                onClick={() => setFilterType(key)}
              >
                {label} ({count})
              </button>
            );
          })}
        </div>
      )}

      {/* Items List */}
      {filteredItems.length > 0 ? (
        <div className="space-y-3">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className="flex items-start justify-between gap-4 rounded-2xl border border-[#E2E8F0] bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
            >
              <div className="flex items-start gap-3">
                <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-[#F2F4F7] text-[#007F78] mt-0.5">
                  <Icon
                    name={
                      item.type === 'alert'
                        ? 'alert'
                        : item.type === 'shelter'
                        ? 'building'
                        : item.type === 'contact'
                        ? 'phone'
                        : item.type === 'phrase'
                        ? 'volume'
                        : 'route'
                    }
                    size={18}
                  />
                </span>

                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded bg-[#EAECF0] px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-[#475467]">
                      {item.type}
                    </span>
                    {item.badge && (
                      <span className="rounded bg-teal-50 px-2 py-0.5 text-[10px] font-bold text-[#005E59] border border-teal-200">
                        {item.badge}
                      </span>
                    )}
                    <span className="text-[11px] text-[#98A2B3]">
                      Saved {new Date(item.savedAt).toLocaleDateString()}
                    </span>
                  </div>

                  <h3 className="mt-1.5 text-base font-extrabold text-[#101828]">
                    {item.title}
                  </h3>

                  {item.subtitle && (
                    <p className="mt-1 text-xs font-semibold text-[#344054]">
                      {item.subtitle}
                    </p>
                  )}

                  {item.details && (
                    <p className="mt-1 text-xs text-[#667085] leading-5">
                      {item.details}
                    </p>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleRemove(item.id)}
                  className="flex size-8 items-center justify-center rounded-lg text-[#98A2B3] hover:bg-red-50 hover:text-[#B42318]"
                  title="Remove from saved items"
                  aria-label="Remove item"
                >
                  <Icon name="trash" size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <Icon name="bookmark" size={26} />
          <h3>No saved items yet</h3>
          <p>
            You can bookmark active advisories, relief shelters, essential phrases, and travel routes by clicking the bookmark icon on any card.
          </p>
          <div className="mt-4 flex flex-wrap gap-2 justify-center">
            <button
              type="button"
              onClick={() => navigate('dashboard')}
              className="primary-button text-xs"
            >
              Explore Alerts
            </button>
            <button
              type="button"
              onClick={() => navigate('phrasebook')}
              className="rounded-lg border border-[#E2E8F0] bg-white px-3 py-2 text-xs font-bold text-[#475467] hover:bg-slate-50"
            >
              Browse Phrasebook
            </button>
          </div>
        </div>
      )}

      {/* Confirmation Modal for Clearing All */}
      {showConfirmClear && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
            <h3 className="text-lg font-bold text-[#101828]">Clear all saved items?</h3>
            <p className="mt-2 text-xs leading-5 text-[#667085]">
              This will remove all bookmarked alerts, shelters, phrases, and routes from this device's storage. This action cannot be undone.
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowConfirmClear(false)}
                className="rounded-lg border border-[#D0D5DD] px-3.5 py-2 text-xs font-bold text-[#344054] hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleClearAll}
                className="rounded-lg bg-[#D92D20] px-3.5 py-2 text-xs font-bold text-white hover:bg-[#B42318]"
              >
                Yes, Clear All
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
