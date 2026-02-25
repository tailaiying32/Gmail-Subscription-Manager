# Gmail Subscription Manager

A Chrome Extension that scans your Gmail inbox, automatically detects email subscriptions, and lets you unsubscribe, archive, or whitelist senders in one click — eliminating hours of manual email cleanup.

![Chrome Extension](https://img.shields.io/badge/Chrome-Extension-blue?logo=googlechrome&logoColor=white)
![Manifest V3](https://img.shields.io/badge/Manifest-V3-green)
![TypeScript](https://img.shields.io/badge/TypeScript-5.5-blue?logo=typescript&logoColor=white)
![React](https://img.shields.io/badge/React-18.3-61DAFB?logo=react&logoColor=white)

## Features

- **Inbox Scanning** — Finds all emails with unsubscribe headers (RFC 2369) and groups them by sender
- **One-Click Unsubscribe** — Supports both HTTP (RFC 8058 one-click) and mailto unsubscribe methods
- **Bulk Actions** — Select multiple subscriptions and unsubscribe or archive them all at once
- **Archive All** — Remove all emails from a sender from your inbox without deleting them
- **Whitelist** — Mark senders you want to keep so they don't appear in future scans
- **Incremental Sync** — Automatically checks for new subscriptions every 30 minutes
- **Full Dashboard** — A dedicated full-page UI with filtering, sorting, search, and detailed sender info
- **Privacy-First** — No data leaves your browser. All processing happens locally in the extension

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Extension | Chrome Manifest V3 (Service Worker) |
| Frontend | React 18 + TypeScript |
| Build | Vite + vite-plugin-web-extension |
| Styling | Tailwind CSS (Material Design 3 tokens) |
| Typography | Google Sans |
| Icons | Material Symbols Outlined |
| State | Zustand (dashboard), custom hooks (popup) |
| Auth | Google Cloud Platform OAuth 2.0 via `chrome.identity` |
| API | Gmail REST API (direct fetch, no SDK) |
| Persistence | `chrome.storage.local` / `chrome.storage.session` |

## Architecture

```
Popup (React)  ──┐
                  ├── chrome.runtime.sendMessage ──▶ Service Worker (background.ts)
Dashboard (React)─┘         chrome.storage.local ◀──┘        │
                                                              │
                                                    Gmail REST API (OAuth 2.0)
```

**Key design decisions:**

- UI contexts never call the Gmail API directly — all requests go through the Service Worker via message passing
- The Service Worker is the single gateway to Gmail, handling auth, scanning, and action execution
- Real-time UI updates are driven by `chrome.storage.onChanged` listeners (no polling)
- Batch API requests (up to 50 per call) with rate limiting and exponential backoff to stay within Gmail quotas

## Project Structure

```
src/
├── background/
│   ├── background.ts              # Service Worker entry point
│   ├── messageHandler.ts          # Routes chrome.runtime.onMessage
│   ├── alarms.ts                  # Incremental sync alarm (30 min)
│   ├── auth/
│   │   ├── tokenManager.ts        # OAuth token caching & refresh
│   │   └── authState.ts           # Auth state persistence
│   ├── gmail/
│   │   ├── gmailClient.ts         # Typed Gmail REST API wrapper
│   │   ├── batchRequest.ts        # Multipart batch builder & parser
│   │   ├── scanner.ts             # Full scan + incremental sync
│   │   └── headerParser.ts        # RFC 2369 List-Unsubscribe parser
│   ├── subscriptions/
│   │   ├── detector.ts            # Groups messages into subscriptions
│   │   └── store.ts               # CRUD on chrome.storage.local
│   └── actions/
│       ├── unsubscribe.ts         # HTTP + mailto unsubscribe execution
│       └── archive.ts             # Gmail label modification
├── popup/
│   ├── popup.html / popup.tsx     # Extension popup entry
│   └── components/
│       ├── AuthScreen.tsx          # Sign-in screen
│       ├── ScanStatus.tsx          # Scan progress UI
│       ├── SubscriptionList.tsx    # Scrollable sender list
│       └── SubscriptionCard.tsx    # Per-sender action card
├── dashboard/
│   ├── dashboard.html / .tsx      # Full-page dashboard entry
│   ├── store/dashboardStore.ts    # Zustand store
│   └── components/
│       ├── NavigationDrawer.tsx    # Category sidebar
│       ├── TopAppBar.tsx           # Search + sort bar
│       ├── BulkActions.tsx         # Multi-select toolbar
│       ├── SubscriptionTable.tsx   # Subscription list with columns
│       ├── SubscriptionRow.tsx     # Individual row with hover actions
│       └── SubscriptionDetail.tsx  # Slide-in detail panel
├── components/
│   └── md3.tsx                    # Shared Material Design 3 primitives
├── shared/
│   ├── types.ts                   # All TypeScript interfaces
│   ├── messages.ts                # Discriminated union message types
│   ├── constants.ts               # Batch sizes, delays, API config
│   └── utils.ts                   # Helpers (sleep, chunk, base64url)
└── hooks/
    ├── useStorage.ts              # Reactive chrome.storage hook
    ├── useMessage.ts              # Typed sendMessage wrapper
    └── useSubscriptions.ts        # Derived subscription state
```

## Getting Started

### Prerequisites

- Node.js 18+
- npm
- Google Chrome
- A Google Cloud Platform project with the Gmail API enabled

### 1. Clone & Install

```bash
git clone <repo-url>
cd gmail-subscription-manager
npm install
```

### 2. Google Cloud Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project (or select an existing one)
3. Enable the **Gmail API** under APIs & Services > Library
4. Configure the **OAuth Consent Screen**:
   - User type: External
   - Add scopes: `gmail.readonly`, `gmail.modify`, `gmail.send`
   - Add your Gmail address as a test user (required while in testing mode)
5. Create an **OAuth Client ID**:
   - Application type: **Chrome Extension**
   - Paste your extension ID (see step 3 below)
6. Copy the generated `client_id`

### 3. Configure the Extension

Update `manifest.json` with your OAuth client ID:

```json
"oauth2": {
  "client_id": "YOUR_CLIENT_ID.apps.googleusercontent.com",
  "scopes": [
    "https://www.googleapis.com/auth/gmail.readonly",
    "https://www.googleapis.com/auth/gmail.modify",
    "https://www.googleapis.com/auth/gmail.send"
  ]
}
```

### 4. Build

```bash
npm run build
```

For development with watch mode:

```bash
npm run dev
```

### 5. Load in Chrome

1. Open `chrome://extensions`
2. Enable **Developer mode** (top right)
3. Click **Load unpacked** and select the `dist/` folder
4. Copy the extension ID and paste it into your GCP OAuth Client ID configuration

> **Note:** The extension ID changes if loaded from a different folder. To pin it, generate a `key.pem` and add the public key to `manifest.json` under `"key"`.

## Usage

### Popup

1. Click the extension icon in Chrome's toolbar
2. **Sign in with Google** — grants read/modify access to your Gmail
3. **Scan My Inbox** — the extension searches for emails with unsubscribe headers
4. Browse your subscriptions and take action:
   - **Unsubscribe** — sends an unsubscribe request via HTTP or email
   - **Archive** — removes all emails from this sender from your inbox
   - **Keep** — whitelists the sender so it won't appear in future scans

### Dashboard

Click **Open full dashboard** at the bottom of the popup to access the full-page UI with:

- **Category filters** — All, Newsletters, Marketing, Notifications, Other
- **Search** — find specific senders by name or email
- **Sort** — by email count, most recent, oldest, or alphabetical
- **Bulk actions** — checkbox-select multiple senders and unsubscribe/archive in bulk
- **Detail panel** — click any row to see sender stats, email counts, and unsubscribe method info

## How It Works

### Scanning

The extension queries Gmail for emails matching `has:list-unsubscribe` and `from:(noreply OR no-reply OR newsletter)`. Messages are fetched in batches of 50 using the Gmail Batch API (`multipart/mixed` encoding) with rate limiting (1s delay between batches) to stay within quota.

### Subscription Detection

Emails are grouped by sender address. For each sender, the extension parses the `List-Unsubscribe` header (RFC 2369) to extract:

- **HTTP URLs** — direct unsubscribe links
- **mailto addresses** — unsubscribe-by-email targets
- **One-click support** — detected via `List-Unsubscribe-Post` header (RFC 8058)

Senders are categorized as newsletter, marketing, notification, or other based on header keywords and sender patterns.

### Unsubscribe Execution

- **HTTP (preferred):** If the sender supports RFC 8058 one-click, a `POST` request is sent with `List-Unsubscribe=One-Click`. Otherwise, a `GET` request is sent to the unsubscribe URL.
- **mailto (fallback):** The extension composes and sends an unsubscribe email from your account via the Gmail API.

### Incremental Sync

After the initial scan, the extension stores Gmail's `historyId` and uses the History API every 30 minutes to detect new subscription emails — no full rescan needed.

## Scripts

| Command | Description |
|---------|-------------|
| `npm run build` | Production build to `dist/` |
| `npm run dev` | Watch mode for development |
| `npm run lint` | ESLint check |
| `npm run test` | Unit tests (Vitest) |
| `npm run test:e2e` | E2E tests (Playwright) |

## Privacy

- **No external servers** — all data stays in `chrome.storage.local` on your machine
- **Read-only until you act** — emails are only modified when you click Unsubscribe or Archive
- **Minimal permissions** — only requests Gmail access needed for scanning and unsubscribing
- **Revocable** — remove access anytime from [Google Account Settings](https://myaccount.google.com/permissions)
