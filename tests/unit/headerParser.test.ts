import { describe, it, expect } from 'vitest';
import { parseListUnsubscribe } from '../../src/background/gmail/headerParser';

describe('parseListUnsubscribe', () => {
  it('parses http-only header', () => {
    const result = parseListUnsubscribe('<https://example.com/unsub?token=abc>');
    expect(result.http).toBe('https://example.com/unsub?token=abc');
    expect(result.mailto).toBeNull();
    expect(result.isOneClick).toBe(false);
  });

  it('parses mailto-only header', () => {
    const result = parseListUnsubscribe('<mailto:unsub@example.com?subject=unsubscribe>');
    expect(result.mailto?.address).toBe('unsub@example.com');
    expect(result.mailto?.subject).toBe('unsubscribe');
    expect(result.http).toBeNull();
  });

  it('prefers http when both are present', () => {
    const result = parseListUnsubscribe(
      '<mailto:unsub@example.com?subject=unsub>, <https://example.com/unsub>'
    );
    expect(result.http).toBe('https://example.com/unsub');
    expect(result.mailto).not.toBeNull();
  });

  it('detects one-click from post header', () => {
    const result = parseListUnsubscribe(
      '<https://example.com/unsub>',
      'List-Unsubscribe=One-Click'
    );
    expect(result.isOneClick).toBe(true);
  });

  it('returns nulls for missing header', () => {
    const result = parseListUnsubscribe(undefined);
    expect(result.http).toBeNull();
    expect(result.mailto).toBeNull();
    expect(result.isOneClick).toBe(false);
  });
});
