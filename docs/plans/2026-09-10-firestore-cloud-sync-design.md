# Firestore Cloud Database Real-Time Synchronization & Multi-Browser Migration Design

## Problem Statement
Currently, StaxHQ stores enterprise CRM data (Customers, Contracts, Invoices, Projects, Bank Transactions, Notes, Calendar Events, Team Members, and Passwords) inside individual browser `localStorage`. When a user operates in one browser (e.g. `jdnorris`), all entered customers and transactions remain trapped inside that browser's local sandbox and are invisible when signing into other browser profiles, tabs, or devices (e.g. logging in as `jeff@staxifytech.com` on another profile).

Furthermore, password resets and credentials dictionaries were not synchronized across tabs and devices in real time.

## Objective
Implement a multi-tenant, real-time cloud data synchronization layer backed by **Google Cloud Firestore** (`staxhq-74672`), with:
1. **Real-time multi-browser/multi-device synchronization** via Firestore `onSnapshot` subscriptions.
2. **Seamless local data auto-migration**: When the `jdnorris` browser opens, all locally existing customers and records are automatically detected and uploaded to Firestore.
3. **Zero-latency optimistic UI with local fallback**: Instant rendering on first load from cache while live Firestore listeners sync updates seamlessly.
4. **Cloud Sync Status & Migration Tool**: Visible sync indicator and manual "Sync to Cloud" action in Admin settings to give full visibility.

## Architecture & Data Schema

### Firestore Collection Hierarchy
Under the top-level organization document (`organizations/stax/`):
- `organizations/stax/customers/{customerId}`
- `organizations/stax/contracts/{contractId}`
- `organizations/stax/invoices/{invoiceId}`
- `organizations/stax/projects/{projectId}`
- `organizations/stax/bankTransactions/{transactionId}`
- `organizations/stax/notes/{noteId}`
- `organizations/stax/events/{eventId}`
- `organizations/stax/notifications/{notificationId}`
- `organizations/stax/teamMembers/{memberUid}`
- `organizations/stax/settings/auth` -> stores `{ passwords: { [email]: password } }`

```mermaid
graph TD
    subgraph Browser A ("jdnorris Browser")
        LocalA[localStorage Cache] <--> ContextA[TenantContext]
    end

    subgraph Browser B ("jeff@staxifytech.com / Other Tabs")
        LocalB[localStorage Cache] <--> ContextB[TenantContext]
    end

    subgraph Firebase Cloud ("staxhq-74672")
        FS[(Firestore Cloud Database)]
    end

    ContextA -- "Auto-Migrates Local Data & Writes" --> FS
    FS -- "Real-Time onSnapshot Push" --> ContextA
    FS -- "Real-Time onSnapshot Push" --> ContextB
    ContextB -- "Mutations (Add / Update / Delete)" --> FS
```

## Auto-Migration Flow
1. When `TenantProvider` mounts in any browser:
   - Initial state loads from local cache for 0ms visual delay.
   - `onSnapshot` listeners connect to Firestore collections for the active organization (`stax`).
2. When Firestore snapshot is received:
   - If Firestore collection is empty BUT `localStorage` contains user-created records (e.g. in the `jdnorris` profile), `TenantContext` runs a non-destructive batch push to Firestore.
   - Once Firestore has documents, the Firestore cloud state becomes the authoritative source of truth, updating React state and refreshing local cache.
3. Any create/update/delete operation writes directly to Firestore (`setDoc`/`deleteDoc`), triggering immediate broadcast to all connected browsers.

## Error Handling & Offline Resilience
- If network disconnects or Firestore rules temporarily block writes, mutations fall back gracefully to local storage and log non-blocking warnings.
- Sync state (`idle`, `syncing`, `synced`, `error`) is exposed on `useTenant()` so UI indicators can display real-time connection status.
