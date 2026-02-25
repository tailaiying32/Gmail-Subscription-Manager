import React, { useState } from 'react';
import { sendMessage } from '../../hooks/useMessage';

export function AuthScreen() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSignIn() {
    setLoading(true);
    setError(null);
    const res = await sendMessage({ type: 'AUTH_GET_TOKEN', payload: { interactive: true } });
    if (!res.success) setError(res.error);
    setLoading(false);
  }

  return (
    <div className="flex flex-col items-center justify-center gap-6 p-8 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">
        <svg className="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      </div>

      <div>
        <h1 className="text-lg font-semibold text-gray-900">Gmail Subscription Manager</h1>
        <p className="mt-1 text-sm text-gray-500">Find and remove email subscriptions you no longer want.</p>
      </div>

      <ul className="w-full space-y-2 text-left text-sm text-gray-600">
        <li className="flex items-center gap-2"><span className="text-green-500">✓</span> No data sent to external servers</li>
        <li className="flex items-center gap-2"><span className="text-green-500">✓</span> Read-only until you take action</li>
        <li className="flex items-center gap-2"><span className="text-green-500">✓</span> Revoke access anytime in Google settings</li>
      </ul>

      {error && <p className="text-sm text-red-500">{error}</p>}

      <button
        onClick={handleSignIn}
        disabled={loading}
        className="w-full rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60"
      >
        {loading ? 'Signing in…' : 'Sign in with Google'}
      </button>
    </div>
  );
}
