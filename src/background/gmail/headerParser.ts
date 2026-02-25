import type { UnsubscribeOptions } from '@shared/types';

/**
 * Parses RFC 2369 List-Unsubscribe header.
 * Example: <mailto:unsub@example.com?subject=unsub>, <https://example.com/unsub>
 */
export function parseListUnsubscribe(
  headerValue: string | undefined,
  postHeaderValue?: string | undefined
): UnsubscribeOptions {
  if (!headerValue) {
    return { mailto: null, http: null, isOneClick: false };
  }

  const tokens = [...headerValue.matchAll(/<([^>]+)>/g)].map((m) => m[1]);

  let mailto: UnsubscribeOptions['mailto'] = null;
  let http: string | null = null;

  for (const token of tokens) {
    if (token.startsWith('mailto:')) {
      const url = new URL(token);
      mailto = {
        address: url.pathname,
        subject: url.searchParams.get('subject') ?? 'unsubscribe',
      };
    } else if (token.startsWith('http://') || token.startsWith('https://')) {
      http = token;
    }
  }

  const isOneClick =
    !!postHeaderValue &&
    postHeaderValue.trim().toLowerCase().includes('list-unsubscribe=one-click');

  return { mailto, http, isOneClick };
}

export function getHeader(
  headers: { name: string; value: string }[],
  name: string
): string | undefined {
  return headers.find((h) => h.name.toLowerCase() === name.toLowerCase())?.value;
}
