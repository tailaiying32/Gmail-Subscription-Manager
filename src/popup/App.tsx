import { useSubscriptions } from '../hooks/useSubscriptions';
import { AuthScreen } from './components/AuthScreen';
import { ScanStatus } from './components/ScanStatus';
import { SubscriptionList } from './components/SubscriptionList';

export function App() {
  const { isAuthenticated, isScanning, hasScanData, scanError, auth, scanProgress, activeSubscriptions } =
    useSubscriptions();

  if (!isAuthenticated) return <AuthScreen />;

  if (isScanning || !hasScanData || scanError) {
    return (
      <ScanStatus
        userEmail={auth?.userEmail ?? ''}
        scanProgress={scanProgress}
        isScanning={isScanning}
      />
    );
  }

  return (
    <SubscriptionList
      userEmail={auth?.userEmail ?? ''}
      subscriptions={activeSubscriptions}
      scanProgress={scanProgress}
    />
  );
}
