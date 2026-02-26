import { useState } from 'react';
import { Button } from '../../components/md3';
import { useDashboardStore } from '../store/dashboardStore';
import { sendMessage } from '../../hooks/useMessage';

export function BulkActions() {
  const { selectedIds, clearSelection, filteredSubscriptions, selectAll, optimisticUpdate } = useDashboardStore();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  const count = selectedIds.size;
  const allSelected = count > 0 && count === filteredSubscriptions.length;

  async function handleBulkUnsubscribe() {
    setLoading(true);
    const ids = Array.from(selectedIds);
    ids.forEach((id) => optimisticUpdate(id, 'unsubscribed'));
    clearSelection();
    const res = await sendMessage({ type: 'UNSUBSCRIBE_BULK', payload: { subscriptionIds: ids } });
    if (!res.success) {
      // Rollback all on total failure
      ids.forEach((id) => optimisticUpdate(id, 'active'));
      setResult('Bulk unsubscribe failed — items restored');
    } else {
      // Rollback individual failures
      const results = (res.data ?? []) as Array<{ subscriptionId: string; success: boolean }>;
      const failedIds = results.filter((r) => !r.success).map((r) => r.subscriptionId);
      failedIds.forEach((id) => optimisticUpdate(id, 'active'));
      const successCount = ids.length - failedIds.length;
      setResult(
        failedIds.length === 0
          ? `Unsubscribed from ${successCount} sender${successCount > 1 ? 's' : ''}`
          : `Unsubscribed from ${successCount}, ${failedIds.length} failed`
      );
    }
    setLoading(false);
    setTimeout(() => setResult(null), 5000);
  }

  async function handleBulkArchive() {
    setLoading(true);
    const ids = Array.from(selectedIds);
    for (const id of ids) await sendMessage({ type: 'ARCHIVE_ALL', payload: { subscriptionId: id } });
    clearSelection();
    setLoading(false);
    setResult(`Archived emails from ${ids.length} sender${ids.length > 1 ? 's' : ''}`);
    setTimeout(() => setResult(null), 5000);
  }

  // primary-container tint — clearly different from the surface-container top bar, no border needed
  return (
    <div className="flex items-center gap-3 px-4 py-2.5 bg-surface-container-low shrink-0">
      <label className="flex items-center gap-2.5 cursor-pointer">
        <input
          type="checkbox"
          checked={allSelected}
          onChange={allSelected ? clearSelection : selectAll}
          className="h-4 w-4 rounded accent-primary"
        />
        <span className="text-label-lg text-surface-on-variant">
          {count > 0 ? `${count} selected` : 'Select all'}
        </span>
      </label>

      <div className="flex-1" />

      {result && <span className="text-body-sm text-surface-on-variant">{result}</span>}

      {count > 0 && (
        <>
          <Button variant="tonal" icon={loading ? undefined : 'archive'} onClick={handleBulkArchive} disabled={loading} className="py-1.5 h-9">
            Archive
          </Button>
          <Button variant="filled" icon={loading ? undefined : 'unsubscribe'} onClick={handleBulkUnsubscribe} disabled={loading} className="py-1.5 h-9">
            {loading ? 'Working…' : `Unsubscribe (${count})`}
          </Button>
        </>
      )}
    </div>
  );
}
