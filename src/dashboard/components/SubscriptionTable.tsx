import { Icon, LinearProgress } from '../../components/md3';
import { useDashboardStore } from '../store/dashboardStore';
import { SubscriptionRow } from './SubscriptionRow';
import { useSubscriptions } from '../../hooks/useSubscriptions';

export function SubscriptionTable() {
  const { filteredSubscriptions, activeCategory, searchQuery } = useDashboardStore();
  const { isScanning, scanProgress } = useSubscriptions();

  if (isScanning) {
    return (
      <div className="flex flex-col items-center justify-center gap-6 py-24 px-8">
        <div className="w-full max-w-xs space-y-3">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-primary-container flex items-center justify-center animate-pulse">
              <Icon name="radar" size={20} className="text-primary" />
            </div>
            <div>
              <p className="text-title-sm text-surface-on">Scanning inbox…</p>
              <p className="text-body-sm text-surface-on-variant capitalize">{scanProgress?.phase}</p>
            </div>
          </div>
          <LinearProgress value={scanProgress?.percentComplete ?? 0} />
          <p className="text-label-md text-surface-on-variant text-right">
            {scanProgress?.processed?.toLocaleString()} / {scanProgress?.totalFound?.toLocaleString()}
          </p>
        </div>
      </div>
    );
  }

  if (filteredSubscriptions.length === 0) {
    const isFiltered = !!searchQuery || activeCategory !== 'all';
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-24 text-center px-8">
        <Icon name={isFiltered ? 'search_off' : 'inbox'} size={56} className="text-surface-on-variant opacity-25" />
        <p className="text-title-md text-surface-on-variant">
          {isFiltered ? 'No results' : 'Nothing here'}
        </p>
        <p className="text-body-md text-surface-on-variant opacity-60 max-w-xs">
          {isFiltered ? 'Try adjusting your search or filter' : 'Scan your inbox to find subscriptions'}
        </p>
      </div>
    );
  }

  return (
    <div>
      {/* Sticky column header — surface-container-low so it reads above rows */}
      <div className="sticky top-0 z-10 flex items-center gap-4 px-4 py-2 bg-surface-container-low">
        <div className="w-4 shrink-0" />
        <div className="w-9 shrink-0" />
        <div className="flex-1 text-label-md text-surface-on-variant">Sender</div>
        <div className="hidden md:block w-28 text-label-md text-surface-on-variant">Category</div>
        <div className="w-16 text-right text-label-md text-surface-on-variant shrink-0">Emails</div>
        <div className="hidden lg:block w-20 text-right text-label-md text-surface-on-variant shrink-0">Last seen</div>
        <div className="w-24 shrink-0" />
      </div>

      {filteredSubscriptions.map((sub) => (
        <SubscriptionRow key={sub.id} subscription={sub} />
      ))}
    </div>
  );
}
