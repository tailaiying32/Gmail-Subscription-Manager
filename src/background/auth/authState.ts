import type { AuthState } from '@shared/types';
import { STORAGE_KEYS } from '@shared/messages';
import { getAccessToken, getAuthenticatedEmail } from './tokenManager';

export async function getAuthState(): Promise<AuthState> {
  const result = await chrome.storage.local.get(STORAGE_KEYS.AUTH);
  return (result[STORAGE_KEYS.AUTH] as AuthState) ?? {
    isAuthenticated: false,
    userEmail: null,
    lastAuthCheck: 0,
  };
}

export async function setAuthState(state: AuthState): Promise<void> {
  await chrome.storage.local.set({ [STORAGE_KEYS.AUTH]: state });
}

export async function refreshAuthState(): Promise<AuthState> {
  const token = await getAccessToken(false);
  const email = token ? await getAuthenticatedEmail() : null;
  const state: AuthState = {
    isAuthenticated: !!token,
    userEmail: email,
    lastAuthCheck: Date.now(),
  };
  await setAuthState(state);
  return state;
}
