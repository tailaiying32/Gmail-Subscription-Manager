import React, { useState } from 'react';
import { Button, Icon } from '../../components/md3';
import { sendMessage } from '../../hooks/useMessage';

export function AuthScreen() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSignIn() {
    setLoading(true);
    setError(null);
    try {
      const res = await sendMessage({ type: 'AUTH_GET_TOKEN', payload: { interactive: true } });
      if (!res.success) setError(res.error ?? 'Sign-in failed');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sign-in failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col items-center px-6 py-8 gap-6 text-center bg-surface">
      <div className="flex h-[72px] w-[72px] items-center justify-center rounded-full bg-primary-container">
        <Icon name="mark_email_unread" size={36} filled className="text-primary" />
      </div>

      <div className="space-y-1.5">
        <h1 className="text-title-lg text-surface-on">Gmail Subscription Manager</h1>
        <p className="text-body-md text-surface-on-variant">
          Find and remove email subscriptions you no longer want.
        </p>
      </div>

      {/* Privacy list — tonal surface, no border */}
      <div className="w-full rounded-xl bg-surface-container-low p-4 space-y-3 text-left">
        {[
          ['privacy_tip',    'No data sent to external servers'        ],
          ['visibility_off', 'Read-only until you take action'         ],
          ['key_off',        'Revoke access anytime in Google settings'],
        ].map(([icon, text]) => (
          <div key={text} className="flex items-center gap-3">
            <Icon name={icon} size={18} className="text-primary shrink-0" />
            <span className="text-body-sm text-surface-on-variant">{text}</span>
          </div>
        ))}
      </div>

      {error && (
        <div className="w-full rounded-xl bg-error-container px-4 py-3 text-body-sm text-error-on-container">
          {error}
        </div>
      )}

      <Button variant="filled" icon={loading ? undefined : 'login'} onClick={handleSignIn} disabled={loading} className="w-full">
        {loading ? 'Signing in…' : 'Sign in with Google'}
      </Button>
    </div>
  );
}
