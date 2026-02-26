import { useState, useRef, useEffect } from 'react';
import { Icon, IconButton } from '../../components/md3';
import { useDashboardStore } from '../store/dashboardStore';
import { sendMessage } from '../../hooks/useMessage';
import { useSubscriptions } from '../../hooks/useSubscriptions';
import { SettingsModal } from './SettingsModal';

type SortOption = { value: string; label: string; icon: string };

const SORT_OPTIONS: SortOption[] = [
  { value: 'frequency',    label: 'Most emails',  icon: 'bar_chart' },
  { value: 'recent',       label: 'Most recent',  icon: 'schedule' },
  { value: 'oldest',       label: 'Oldest first', icon: 'history' },
  { value: 'alphabetical', label: 'A – Z',        icon: 'sort_by_alpha' },
];

function SortMenu({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open]);

  const selected = SORT_OPTIONS.find((o) => o.value === value) ?? SORT_OPTIONS[0];

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 rounded-full bg-surface-container-highest px-4 py-2 text-label-lg text-surface-on hover:bg-surface-container-high transition-colors"
      >
        <Icon name="sort" size={18} className="text-surface-on-variant" />
        {selected.label}
        <Icon name={open ? 'arrow_drop_up' : 'arrow_drop_down'} size={18} className="text-surface-on-variant" />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1 z-50 min-w-[200px] rounded-lg bg-surface-container-low py-1 ring-1 ring-outline-variant/20 overflow-hidden">
          {SORT_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => { onChange(opt.value); setOpen(false); }}
              className={`
                w-full flex items-center gap-3 px-4 py-2.5 text-left text-body-md transition-colors
                ${opt.value === value
                  ? 'bg-secondary-container text-secondary-on-container'
                  : 'text-surface-on hover:bg-surface-on/8'
                }
              `}
            >
              <Icon name={opt.icon} size={18} className={opt.value === value ? 'text-secondary-on-container' : 'text-surface-on-variant'} />
              {opt.label}
              {opt.value === value && <Icon name="check" size={18} className="ml-auto text-secondary-on-container" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export function TopAppBar() {
  const { searchQuery, setSearchQuery, sortBy, setSortBy } = useDashboardStore();
  const { auth } = useSubscriptions();
  const [showSettings, setShowSettings] = useState(false);

  async function handleRescan() {
    await sendMessage({ type: 'SCAN_START', payload: { fullScan: true } });
  }

  return (
    // surface-container: elevation 2 — sits visually above the list below it
    <header className="flex items-center gap-3 bg-surface-container px-4 py-3 shrink-0">
      {/* MD3 Search bar — bg-surface-container-highest, no border */}
      <div className="flex-1 flex items-center gap-3 rounded-full bg-surface-container-highest px-4 py-2 focus-within:ring-2 focus-within:ring-primary transition-all">
        <Icon name="search" size={20} className="text-surface-on-variant shrink-0" />
        <input
          type="text"
          placeholder="Search subscriptions"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex-1 bg-transparent text-body-lg text-surface-on placeholder:text-surface-on-variant outline-none"
        />
        {searchQuery && (
          <button onClick={() => setSearchQuery('')} className="text-surface-on-variant hover:text-surface-on">
            <Icon name="close" size={18} />
          </button>
        )}
      </div>

      <SortMenu value={sortBy} onChange={(v) => setSortBy(v as Parameters<typeof setSortBy>[0])} />

      <IconButton icon="refresh" label="Rescan inbox" onClick={handleRescan} />
      <IconButton icon="settings" label="Settings" onClick={() => setShowSettings(true)} />

      {/* User avatar */}
      <div
        className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-primary-on text-label-lg font-medium cursor-pointer shrink-0"
        title={auth?.userEmail ?? ''}
      >
        {auth?.userEmail?.[0]?.toUpperCase() ?? 'U'}
      </div>

      {showSettings && <SettingsModal onClose={() => setShowSettings(false)} />}
    </header>
  );
}
