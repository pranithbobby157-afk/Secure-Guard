export type SavedItemType = 'alert' | 'shelter' | 'contact' | 'phrase' | 'route';

export interface SavedItem {
  id: string;
  type: SavedItemType;
  title: string;
  subtitle?: string;
  badge?: string;
  details?: string;
  data: any;
  savedAt: string;
}

const STORAGE_KEY = 'saferoute_saved_items_v1';
const EVENT_NAME = 'saferoute_saved_changed';

export const savedStore = {
  getAll(): SavedItem[] {
    if (typeof window === 'undefined') return [];
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  },

  isSaved(id: string): boolean {
    const items = this.getAll();
    return items.some((item) => item.id === id);
  },

  save(item: Omit<SavedItem, 'savedAt'>): void {
    if (typeof window === 'undefined') return;
    try {
      const items = this.getAll().filter((i) => i.id !== item.id);
      const updated: SavedItem[] = [
        {
          ...item,
          savedAt: new Date().toISOString()
        },
        ...items
      ];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: updated }));
    } catch (e) {
      console.warn('Failed to save item locally', e);
    }
  },

  remove(id: string): void {
    if (typeof window === 'undefined') return;
    try {
      const items = this.getAll().filter((i) => i.id !== id);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
      window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: items }));
    } catch (e) {
      console.warn('Failed to remove saved item', e);
    }
  },

  toggle(item: Omit<SavedItem, 'savedAt'>): boolean {
    if (this.isSaved(item.id)) {
      this.remove(item.id);
      return false;
    } else {
      this.save(item);
      return true;
    }
  },

  clearAll(): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.removeItem(STORAGE_KEY);
      window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: [] }));
    } catch (e) {
      console.warn('Failed to clear saved items', e);
    }
  },

  subscribe(callback: (items: SavedItem[]) => void): () => void {
    if (typeof window === 'undefined') return () => {};
    const handler = (e: Event) => {
      const custom = e as CustomEvent<SavedItem[]>;
      callback(custom.detail || this.getAll());
    };
    window.addEventListener(EVENT_NAME, handler);
    return () => window.removeEventListener(EVENT_NAME, handler);
  }
};
