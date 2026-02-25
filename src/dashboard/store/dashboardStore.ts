import { create } from 'zustand';
import type { Subscription, SubscriptionCategory, SubscriptionStatus } from '../../shared/types';
import { STORAGE_KEYS } from '../../shared/messages';

type CategoryFilter = 'all' | SubscriptionCategory | 'whitelisted' | 'unsubscribed';
type SortField = 'frequency' | 'recent' | 'oldest' | 'alphabetical';

interface DashboardStore {
  // Raw data
  subscriptions: Subscription[];
  selectedIds: Set<string>;

  // Filters
  activeCategory: CategoryFilter;
  sortBy: SortField;
  searchQuery: string;

  // Detail panel
  detailId: string | null;

  // Computed
  filteredSubscriptions: Subscription[];

  // Actions
  loadFromStorage: () => Promise<void>;
  syncFromStorage: (map: Record<string, Subscription>) => void;
  toggleSelected: (id: string) => void;
  selectAll: () => void;
  clearSelection: () => void;
  setCategory: (cat: CategoryFilter) => void;
  setSortBy: (sort: SortField) => void;
  setSearchQuery: (q: string) => void;
  openDetail: (id: string) => void;
  closeDetail: () => void;
  optimisticUpdate: (id: string, status: SubscriptionStatus) => void;
}

function applyFiltersAndSort(
  subs: Subscription[],
  category: CategoryFilter,
  sortBy: SortField,
  query: string
): Subscription[] {
  let result = subs.filter((s) => {
    if (category === 'all') return s.status === 'active';
    if (category === 'whitelisted') return s.status === 'whitelisted';
    if (category === 'unsubscribed') return s.status === 'unsubscribed';
    return s.status === 'active' && s.category === category;
  });

  if (query.trim()) {
    const q = query.toLowerCase();
    result = result.filter(
      (s) => s.senderName.toLowerCase().includes(q) || s.senderEmail.toLowerCase().includes(q)
    );
  }

  result.sort((a, b) => {
    switch (sortBy) {
      case 'frequency':    return b.emailCount - a.emailCount;
      case 'recent':       return b.lastReceived - a.lastReceived;
      case 'oldest':       return a.firstSeen - b.firstSeen;
      case 'alphabetical': return a.senderName.localeCompare(b.senderName);
    }
  });

  return result;
}

export const useDashboardStore = create<DashboardStore>((set, get) => ({
  subscriptions: [],
  selectedIds: new Set(),
  activeCategory: 'all',
  sortBy: 'frequency',
  searchQuery: '',
  detailId: null,
  filteredSubscriptions: [],

  loadFromStorage: async () => {
    const result = await chrome.storage.local.get(STORAGE_KEYS.SUBSCRIPTIONS);
    const map = (result[STORAGE_KEYS.SUBSCRIPTIONS] ?? {}) as Record<string, Subscription>;
    get().syncFromStorage(map);
  },

  syncFromStorage: (map) => {
    const subs = Object.values(map);
    const { activeCategory, sortBy, searchQuery } = get();
    set({
      subscriptions: subs,
      filteredSubscriptions: applyFiltersAndSort(subs, activeCategory, sortBy, searchQuery),
    });
  },

  toggleSelected: (id) => {
    const ids = new Set(get().selectedIds);
    if (ids.has(id)) ids.delete(id); else ids.add(id);
    set({ selectedIds: ids });
  },

  selectAll: () => {
    const ids = new Set(get().filteredSubscriptions.map((s) => s.id));
    set({ selectedIds: ids });
  },

  clearSelection: () => set({ selectedIds: new Set() }),

  setCategory: (cat) => {
    const { subscriptions, sortBy, searchQuery } = get();
    set({
      activeCategory: cat,
      selectedIds: new Set(),
      filteredSubscriptions: applyFiltersAndSort(subscriptions, cat, sortBy, searchQuery),
    });
  },

  setSortBy: (sort) => {
    const { subscriptions, activeCategory, searchQuery } = get();
    set({
      sortBy: sort,
      filteredSubscriptions: applyFiltersAndSort(subscriptions, activeCategory, sort, searchQuery),
    });
  },

  setSearchQuery: (q) => {
    const { subscriptions, activeCategory, sortBy } = get();
    set({
      searchQuery: q,
      filteredSubscriptions: applyFiltersAndSort(subscriptions, activeCategory, sortBy, q),
    });
  },

  openDetail: (id) => set({ detailId: id }),
  closeDetail: () => set({ detailId: null }),

  optimisticUpdate: (id, status) => {
    const subs = get().subscriptions.map((s) => s.id === id ? { ...s, status } : s);
    const { activeCategory, sortBy, searchQuery } = get();
    set({
      subscriptions: subs,
      filteredSubscriptions: applyFiltersAndSort(subs, activeCategory, sortBy, searchQuery),
    });
  },
}));
