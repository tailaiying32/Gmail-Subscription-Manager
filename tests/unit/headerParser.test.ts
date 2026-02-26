import { describe, it, expect } from 'vitest';
import { parseListUnsubscribe, getHeader } from '../../src/background/gmail/headerParser';

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

  it('handles malformed angle brackets gracefully', () => {
    const result = parseListUnsubscribe('no-brackets-here');
    expect(result.http).toBeNull();
    expect(result.mailto).toBeNull();
  });

  it('returns empty string header as no options', () => {
    const result = parseListUnsubscribe('');
    expect(result.http).toBeNull();
    expect(result.mailto).toBeNull();
  });

  it('handles encoded URL in header', () => {
    const result = parseListUnsubscribe('<https://example.com/unsub?email=user%40example.com>');
    expect(result.http).toBe('https://example.com/unsub?email=user%40example.com');
  });

  it('defaults mailto subject to "unsubscribe" when missing', () => {
    const result = parseListUnsubscribe('<mailto:unsub@example.com>');
    expect(result.mailto?.address).toBe('unsub@example.com');
    expect(result.mailto?.subject).toBe('unsubscribe');
  });
});

describe('getHeader', () => {
  const headers = [
    { name: 'From', value: 'sender@example.com' },
    { name: 'Subject', value: 'Hello' },
    { name: 'List-Unsubscribe', value: '<https://unsub.example.com>' },
  ];

  it('finds header by exact name', () => {
    expect(getHeader(headers, 'From')).toBe('sender@example.com');
  });

  it('finds header case-insensitively', () => {
    expect(getHeader(headers, 'from')).toBe('sender@example.com');
    expect(getHeader(headers, 'SUBJECT')).toBe('Hello');
    expect(getHeader(headers, 'list-unsubscribe')).toBe('<https://unsub.example.com>');
  });

  it('returns undefined for missing header', () => {
    expect(getHeader(headers, 'X-Custom')).toBeUndefined();
  });

  it('returns undefined for empty header array', () => {
    expect(getHeader([], 'From')).toBeUndefined();
  });
});
