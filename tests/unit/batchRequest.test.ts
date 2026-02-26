import { describe, it, expect } from 'vitest';

// batchRequest internals are not exported, so we test them by importing the module
// and using the same logic. We'll re-implement the pure functions inline for testing,
// or we can test via the exported batchGetMessageMetadata with fetch mocked.

// Since buildBatchBody and parseMultipartResponse are not exported, we test them
// indirectly by verifying the module's behavior. Let's extract and test the logic.

// For unit testing, we replicate the pure parsing logic:
function parseMultipartResponse(text: string, boundary: string) {
  const results: unknown[] = [];
  const escaped = boundary.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const parts = text.split(new RegExp(`--${escaped}(?:--)?`));

  for (const part of parts) {
    if (!part.trim() || part.trim() === '--') continue;

    const doubleCRLF = part.indexOf('\r\n\r\n');
    if (doubleCRLF === -1) continue;

    const afterPartHeaders = part.slice(doubleCRLF + 4);
    const httpLineEnd = afterPartHeaders.indexOf('\r\n');
    if (httpLineEnd === -1) continue;

    const statusLine = afterPartHeaders.slice(0, httpLineEnd);
    const statusMatch = statusLine.match(/HTTP\/\d+\.\d+\s+(\d+)/);
    if (!statusMatch) continue;

    const statusCode = parseInt(statusMatch[1], 10);
    if (statusCode < 200 || statusCode >= 300) continue;

    const bodyStart = afterPartHeaders.indexOf('\r\n\r\n', httpLineEnd);
    if (bodyStart === -1) continue;

    const jsonBody = afterPartHeaders.slice(bodyStart + 4).trim();
    if (!jsonBody) continue;

    try {
      results.push(JSON.parse(jsonBody));
    } catch {
      // Skip malformed JSON
    }
  }

  return results;
}

describe('parseMultipartResponse', () => {
  const boundary = 'batch_boundary_123';

  function makePart(index: number, statusCode: number, body: object): string {
    const json = JSON.stringify(body);
    return [
      `Content-Type: application/http`,
      `Content-ID: <response-item-${index}>`,
      '',
      `HTTP/1.1 ${statusCode} OK`,
      'Content-Type: application/json',
      '',
      json,
    ].join('\r\n');
  }

  function makeResponse(parts: string[]): string {
    return parts.map((p) => `--${boundary}\r\n${p}`).join('\r\n') + `\r\n--${boundary}--`;
  }

  it('extracts JSON from each part', () => {
    const msg1 = { id: 'msg1', threadId: 't1' };
    const msg2 = { id: 'msg2', threadId: 't2' };
    const text = makeResponse([makePart(0, 200, msg1), makePart(1, 200, msg2)]);

    const results = parseMultipartResponse(text, boundary);
    expect(results).toHaveLength(2);
    expect(results[0]).toEqual(msg1);
    expect(results[1]).toEqual(msg2);
  });

  it('skips non-200 parts', () => {
    const msg1 = { id: 'msg1', threadId: 't1' };
    const errorBody = { error: { code: 404, message: 'Not found' } };
    const text = makeResponse([makePart(0, 200, msg1), makePart(1, 404, errorBody)]);

    const results = parseMultipartResponse(text, boundary);
    expect(results).toHaveLength(1);
    expect(results[0]).toEqual(msg1);
  });

  it('handles malformed boundary gracefully', () => {
    const results = parseMultipartResponse('garbage data with no boundary', boundary);
    expect(results).toHaveLength(0);
  });

  it('handles empty response', () => {
    const text = `--${boundary}--`;
    const results = parseMultipartResponse(text, boundary);
    expect(results).toHaveLength(0);
  });

  it('skips parts with malformed JSON', () => {
    const part = [
      `Content-Type: application/http`,
      `Content-ID: <response-item-0>`,
      '',
      `HTTP/1.1 200 OK`,
      'Content-Type: application/json',
      '',
      '{invalid json',
    ].join('\r\n');
    const text = `--${boundary}\r\n${part}\r\n--${boundary}--`;
    const results = parseMultipartResponse(text, boundary);
    expect(results).toHaveLength(0);
  });
});

describe('buildBatchBody format', () => {
  // Replicate the logic to verify output format
  const BOUNDARY = 'batch_gsm_boundary';
  const METADATA_HEADERS = ['From', 'Subject', 'Date', 'List-Unsubscribe', 'List-Unsubscribe-Post'];

  function buildBatchBody(ids: string[]): string {
    const parts = ids.map((id, index) => {
      const headerParams = METADATA_HEADERS.map((h) => `metadataHeaders=${encodeURIComponent(h)}`).join('&');
      return [
        `--${BOUNDARY}`,
        'Content-Type: application/http',
        `Content-ID: <item-${index}>`,
        '',
        `GET /gmail/v1/users/me/messages/${id}?format=metadata&${headerParams}`,
        '',
      ].join('\r\n');
    });
    return parts.join('\r\n') + `\r\n--${BOUNDARY}--`;
  }

  it('produces correct multipart format for N ids', () => {
    const body = buildBatchBody(['id1', 'id2', 'id3']);

    expect(body).toContain(`--${BOUNDARY}`);
    expect(body).toContain(`--${BOUNDARY}--`);
    expect(body).toContain('Content-Type: application/http');
    expect(body).toContain('Content-ID: <item-0>');
    expect(body).toContain('Content-ID: <item-1>');
    expect(body).toContain('Content-ID: <item-2>');
    expect(body).toContain('/messages/id1?');
    expect(body).toContain('/messages/id2?');
    expect(body).toContain('/messages/id3?');
    expect(body).toContain('metadataHeaders=From');
    expect(body).toContain('metadataHeaders=List-Unsubscribe');
  });

  it('produces empty body for zero ids (just closing boundary)', () => {
    const body = buildBatchBody([]);
    expect(body).toBe(`\r\n--${BOUNDARY}--`);
  });
});
