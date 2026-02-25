import type { CachedToken, TokenInfo } from '@shared/types';
import { TOKEN_INFO_URL, TOKEN_EXPIRY_BUFFER_MS } from '@shared/constants';
import { SESSION_KEYS } from '@shared/messages';

function isTokenExpired(cached: CachedToken): boolean {
  return Date.now() >= cached.expiresAt - TOKEN_EXPIRY_BUFFER_MS;
}

async function getCachedToken(): Promise<CachedToken | null> {
  const result = await chrome.storage.session.get(SESSION_KEYS.CACHED_TOKEN);
  return (result[SESSION_KEYS.CACHED_TOKEN] as CachedToken) ?? null;
}

async function setCachedToken(token: CachedToken): Promise<void> {
  await chrome.storage.session.set({ [SESSION_KEYS.CACHED_TOKEN]: token });
}

export async function getTokenInfo(token: string): Promise<TokenInfo> {
  const res = await fetch(`${TOKEN_INFO_URL}?access_token=${token}`);
  if (!res.ok) throw new Error('Failed to fetch token info');
  return res.json() as Promise<TokenInfo>;
}

export async function getAccessToken(interactive = false): Promise<string | null> {
  const cached = await getCachedToken();
  if (cached && !isTokenExpired(cached)) return cached.token;

  // Remove stale cached token from Chrome's internal cache before re-requesting
  if (cached) {
    await new Promise<void>((resolve) =>
      chrome.identity.removeCachedAuthToken({ token: cached.token }, resolve)
    );
  }

  try {
    const token = await new Promise<string>((resolve, reject) => {
      chrome.identity.getAuthToken({ interactive }, (t) => {
        if (chrome.runtime.lastError || !t) {
          reject(new Error(chrome.runtime.lastError?.message ?? 'No token returned'));
        } else {
          resolve(t);
        }
      });
    });

    const info = await getTokenInfo(token);
    const newCached: CachedToken = {
      token,
      email: info.email,
      expiresAt: info.expiry_date,
      fetchedAt: Date.now(),
    };
    await setCachedToken(newCached);
    return token;
  } catch {
    return null;
  }
}

export async function revokeToken(): Promise<void> {
  const cached = await getCachedToken();
  if (cached) {
    await new Promise<void>((resolve) =>
      chrome.identity.removeCachedAuthToken({ token: cached.token }, resolve)
    );
  }
  await chrome.storage.session.clear();
  await chrome.storage.local.clear();
}

export async function getAuthenticatedEmail(): Promise<string | null> {
  const cached = await getCachedToken();
  return cached?.email ?? null;
}
