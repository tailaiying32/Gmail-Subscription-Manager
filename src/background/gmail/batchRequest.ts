import type { GmailMessage } from '@shared/types';
import { BATCH_URL, BATCH_SIZE, BATCH_DELAY_MS } from '@shared/constants';
import { chunkArray, sleep } from '@shared/utils';

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

function parseMultipartResponse(text: string, boundary: string): GmailMessage[] {
  const results: GmailMessage[] = [];
  // Split on boundary markers using the boundary from the response Content-Type header
  const escaped = boundary.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const parts = text.split(new RegExp(`--${escaped}(?:--)?`));

  for (const part of parts) {
    if (!part.trim() || part.trim() === '--') continue;

    // Each part is: headers \r\n\r\n HTTP-response-line \r\n headers \r\n\r\n JSON-body
    const doubleCRLF = part.indexOf('\r\n\r\n');
    if (doubleCRLF === -1) continue;

    const afterPartHeaders = part.slice(doubleCRLF + 4);

    // Now parse the nested HTTP response
    const httpLineEnd = afterPartHeaders.indexOf('\r\n');
    if (httpLineEnd === -1) continue;

    const statusLine = afterPartHeaders.slice(0, httpLineEnd);
    const statusMatch = statusLine.match(/HTTP\/\d+\.\d+\s+(\d+)/);
    if (!statusMatch) continue;

    const statusCode = parseInt(statusMatch[1], 10);
    if (statusCode < 200 || statusCode >= 300) continue;

    // Find the JSON body (after the nested headers)
    const bodyStart = afterPartHeaders.indexOf('\r\n\r\n', httpLineEnd);
    if (bodyStart === -1) continue;

    const jsonBody = afterPartHeaders.slice(bodyStart + 4).trim();
    if (!jsonBody) continue;

    try {
      const parsed = JSON.parse(jsonBody) as GmailMessage;
      results.push(parsed);
    } catch {
      // Skip malformed JSON
    }
  }

  return results;
}

function extractBoundary(contentType: string): string | null {
  const match = contentType.match(/boundary=([^\s;]+)/i);
  return match ? match[1].replace(/^"|"$/g, '') : null;
}

async function fetchBatchWithRetry(
  body: string,
  token: string,
  attempt = 0
): Promise<{ text: string; boundary: string }> {
  const res = await fetch(BATCH_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': `multipart/mixed; boundary=${BOUNDARY}`,
    },
    body,
  });

  if (res.status === 429 || res.status === 403) {
    if (attempt >= 4) throw new Error(`Rate limit exceeded after ${attempt + 1} attempts`);
    await sleep(BATCH_DELAY_MS * Math.pow(2, attempt));
    return fetchBatchWithRetry(body, token, attempt + 1);
  }

  if (!res.ok) throw new Error(`Batch request failed: ${res.status}`);

  // Extract the response boundary from the Content-Type header
  const contentType = res.headers.get('content-type') ?? '';
  const boundary = extractBoundary(contentType) ?? BOUNDARY;
  const text = await res.text();
  return { text, boundary };
}

export async function batchGetMessageMetadata(
  ids: string[],
  token: string
): Promise<GmailMessage[]> {
  const chunks = chunkArray(ids, BATCH_SIZE);
  const results: GmailMessage[] = [];

  for (let i = 0; i < chunks.length; i++) {
    const { text, boundary } = await fetchBatchWithRetry(buildBatchBody(chunks[i]), token);
    results.push(...parseMultipartResponse(text, boundary));
    if (i < chunks.length - 1) await sleep(BATCH_DELAY_MS);
  }

  return results;
}
