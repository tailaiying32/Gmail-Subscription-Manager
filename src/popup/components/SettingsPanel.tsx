import { Icon, IconButton, Divider } from '../../components/md3';
import { useSettings } from '../../hooks/useSettings';
import type { ScanFrequency } from '../../shared/types';

const FREQUENCY_OPTIONS: { value: ScanFrequency; label: string }[] = [
  { value: 30, label: '30 min' },
  { value: 60, label: '1 hour' },
  { value: 360, label: '6 hours' },
  { value: 1440, label: '24 hours' },
];

interface Props {
  onBack: () => void;
}

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-8 w-[52px] shrink-0 items-center rounded-full transition-colors ${
        checked ? 'bg-primary' : 'bg-surface-container-highest'
      }`}
    >
      <span
        className={`inline-block h-6 w-6 rounded-full bg-white transition-transform ${
          checked ? 'translate-x-[26px]' : 'translate-x-[2px]'
        }`}
      />
    </button>
  );
}

export function SettingsPanel({ onBack }: Props) {
  const [settings, updateSettings] = useSettings();

  return (
    <div className="flex flex-col" style={{ height: 600, maxHeight: 600 }}>
      {/* Header */}
      <div className="bg-surface-container px-2 py-3 shrink-0">
        <div className="flex items-center gap-1">
          <IconButton icon="arrow_back" label="Back" onClick={onBack} />
          <span className="text-title-md text-surface-on">Settings</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto bg-surface">
        {/* Scanning */}
        <div className="px-4 pt-4 pb-2">
          <span className="text-label-lg text-primary font-medium">Scanning</span>
        </div>

        <div className="px-4 py-3 flex items-center justify-between">
          <div>
            <div className="text-body-lg text-surface-on">Auto-scan</div>
            <div className="text-body-sm text-surface-on-variant">Periodically check for new subscriptions</div>
          </div>
          <Toggle
            checked={settings.autoScanEnabled}
            onChange={(v) => updateSettings({ autoScanEnabled: v })}
          />
        </div>

        {settings.autoScanEnabled && (
          <div className="px-4 py-3">
            <div className="text-body-lg text-surface-on mb-2">Scan frequency</div>
            <div className="flex gap-2 flex-wrap">
              {FREQUENCY_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => updateSettings({ scanFrequencyMinutes: opt.value })}
                  className={`rounded-full px-3 py-1.5 text-label-lg transition-colors ${
                    settings.scanFrequencyMinutes === opt.value
                      ? 'bg-secondary-container text-secondary-on-container'
                      : 'bg-surface-container-high text-surface-on hover:bg-surface-container-highest'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        )}

        <Divider className="mx-4 my-1" />

        {/* Display */}
        <div className="px-4 pt-3 pb-2">
          <span className="text-label-lg text-primary font-medium">Display</span>
        </div>

        <div className="px-4 py-3 flex items-center justify-between">
          <div>
            <div className="text-body-lg text-surface-on">Badge count</div>
            <div className="text-body-sm text-surface-on-variant">Show active subscription count on icon</div>
          </div>
          <Toggle
            checked={settings.showBadgeCount}
            onChange={(v) => updateSettings({ showBadgeCount: v })}
          />
        </div>

        <div className="px-4 py-3">
          <div className="text-body-lg text-surface-on mb-2">Theme</div>
          <div className="flex gap-2">
            {(['system', 'light', 'dark'] as const).map((theme) => (
              <button
                key={theme}
                onClick={() => updateSettings({ theme })}
                className={`rounded-full px-3 py-1.5 text-label-lg capitalize transition-colors ${
                  settings.theme === theme
                    ? 'bg-secondary-container text-secondary-on-container'
                    : 'bg-surface-container-high text-surface-on hover:bg-surface-container-highest'
                }`}
              >
                {theme}
              </button>
            ))}
          </div>
          <div className="text-body-sm text-surface-on-variant mt-1.5">
            <Icon name="info" size={14} className="inline-block align-text-bottom mr-1" />
            Dark mode coming soon
          </div>
        </div>

        <Divider className="mx-4 my-1" />

        {/* Notifications */}
        <div className="px-4 pt-3 pb-2">
          <span className="text-label-lg text-primary font-medium">Notifications</span>
        </div>

        <div className="px-4 py-3 flex items-center justify-between">
          <div>
            <div className="text-body-lg text-surface-on">New subscriptions</div>
            <div className="text-body-sm text-surface-on-variant">Notify when new senders are detected</div>
          </div>
          <Toggle
            checked={settings.notifyOnNewSubscriptions}
            onChange={(v) => updateSettings({ notifyOnNewSubscriptions: v })}
          />
        </div>
      </div>
    </div>
  );
}
