# Data Flow & End-to-End Test Checklist

## Data flow overview

### Source of truth
- **Solutions (lab requests):** Supabase table `lab_requests`
- **Delivery requests:** Supabase table `delivery_requests`

### Hooks (single source per page)
| Hook | Table | Used by |
|------|--------|---------|
| `useLabRequests()` | `lab_requests` | Index, Preview, MasterDataSheet, Reports |
| `useDeliveryRequests()` | `delivery_requests` | Index, DeliveryPreview, MasterDataSheet, Reports |

### Sync behavior
1. **On mount:** Each page that uses the hooks runs a one-time fetch from Supabase and gets the latest rows.
2. **Realtime:** Each hook subscribes to `postgres_changes` on its table (`lab_requests` or `delivery_requests`). On INSERT/UPDATE/DELETE, the hook refetches so the UI stays in sync (e.g. another tab or user changed data).
3. **On tab focus:** When the user returns to the browser tab (`visibilitychange` → visible), both hooks refetch so data is fresh after switching tabs or devices.
4. **Mutations:** Add/update/delete use Supabase client and then either optimistic local state update or realtime refetch, so the UI updates immediately and stays consistent.

### Page-level flow
- **Index (Dashboard):** Uses `useLabRequests` + `useDeliveryRequests` + `useRealtimeSync`. Passes `requests` / `deliveryRequests` into RoleBasedDashboard, SolutionsTabContent, DeliveryTabContent, ADRTabContent, CalendarView, Header. All see the same data for the duration of the Index mount.
- **Preview:** Uses `useLabRequests` only. On route enter, fetches and subscribes to `lab_requests`. All Solutions spreadsheet data comes from this hook.
- **DeliveryPreview:** Uses `useDeliveryRequests` only. Same pattern for delivery data.
- **MasterDataSheet:** Uses both hooks. Sees Solutions and Delivery from Supabase with realtime + focus refetch.
- **Reports:** Uses both hooks (admin only). Same sync behavior.

### Important points
- No React Query for lab/delivery: data is fetched and held in hook state. `useRealtimeSync` invalidates React Query keys, but the hooks do not use those keys; they use their own Supabase + realtime.
- Each **route** has its own hook instances. Navigating from Index → Preview unmounts Index and mounts Preview, so Preview’s `useLabRequests()` runs and fetches/subscribes again. Data is always loaded from Supabase when entering a page.
- Realtime subscription channel names: `lab-requests-realtime`, `delivery-requests-realtime` (one channel per hook instance; cleanup on unmount).

---

## End-to-end test checklist

Use this to verify data sync and user flows for **Solutions** and **Delivery** across all pages.

### 1. Solutions (lab_requests) – full flow
- [ ] **Dashboard (Index)**  
  - Open `/dashboard`. Solutions tab shows list; counts and KPIs match.  
  - Add a new solution from the Solutions tab form. It appears in the list and in dashboard KPIs without refresh.  
  - Change a solution status (e.g. to “Solution Sent”). List and KPIs update.  
  - Switch to another browser tab and back. Data refetches (e.g. check network or that counts still match).
- [ ] **Preview (Solutions spreadsheet)**  
  - Open `/preview`. Table shows same solutions as dashboard (same count and key fields).  
  - Edit a cell and save. Change persists.  
  - Bulk upload CSV: new rows appear; totals match.  
  - Delete one row. It disappears; count decreases.  
  - Open dashboard in another tab, add a solution there; return to Preview and confirm the new row appears (realtime or after focus refetch).
- [ ] **Master Data Sheet**  
  - Open `/master-data-sheet`, Solutions tab. Data matches Preview / Dashboard.  
  - Add or edit a solution; switch to Dashboard or Preview and confirm the same data.
- [ ] **Reports (admin)**  
  - As admin, open `/reports`. Revenue/Lab Type/Learners and Summary use Solutions data.  
  - Add or edit a solution elsewhere; reload or refocus Reports and confirm numbers/charts update.

### 2. Delivery (delivery_requests) – full flow
- [ ] **Dashboard (Index)**  
  - On `/dashboard`, Delivery tab shows list; delivery KPIs and counts are correct.  
  - Add a delivery request from the form. It appears in the list and in delivery KPIs.  
  - Change delivery status (e.g. to “Delivery In-Progress”). List and KPIs update.  
  - Switch tab and come back; data is still correct (refetch on focus).
- [ ] **Delivery Preview (spreadsheet)**  
  - Open `/delivery-preview`. Table matches dashboard delivery data.  
  - Edit a cell (e.g. Lab Status) and save. Change persists.  
  - Bulk upload delivery CSV: new rows appear.  
  - Delete one delivery; count and list update.  
  - Add a delivery on dashboard; confirm it shows in Delivery Preview (realtime or refocus).
- [ ] **Master Data Sheet**  
  - Delivery tab: data matches Delivery Preview and Dashboard.  
  - Add/edit a delivery; verify in Dashboard and Delivery Preview.
- [ ] **Reports (admin)**  
  - Delivery-related metrics in Reports match Dashboard and Delivery Preview.  
  - Change delivery data elsewhere; Reports reflects after refocus or reload.

### 3. Cross-page consistency
- [ ] Add one **Solution** on Index → open Preview → new row present.  
- [ ] Add one **Delivery** on Index → open Delivery Preview → new row present.  
- [ ] Edit a solution on Preview → open Index (Dashboard) → Solutions tab shows same edit.  
- [ ] Edit a delivery on Delivery Preview → open Index → Delivery tab shows same edit.  
- [ ] From Dashboard, use “Convert to Delivery” on a solution: solution disappears from Solutions, new delivery appears in Delivery list and in Delivery Preview.

### 4. Realtime / multi-tab (optional)
- [ ] Open Dashboard and Preview in two tabs (or two windows). Add/edit/delete on one tab; the other updates without manual refresh (realtime or after focus).

---

## Quick verification commands (developer)

- Ensure Supabase is running and env is set (e.g. `.env` with `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`).
- Run app: `npm run dev`.
- Run through the checklist above; check browser console for realtime logs (e.g. “Lab requests realtime update”) and network for `lab_requests` / `delivery_requests` refetches on focus.

---

## Automated E2E tests (Playwright)

Automated tests mirror the checklist above and live in the `e2e/` folder.

### Setup

```bash
npm install
npx playwright install   # install browser binaries (once)
```

### Run tests

```bash
# Run all E2E tests (app must be running, or use webServer in config)
npm run test:e2e

# Interactive UI
npm run test:e2e:ui

# Headed (see browser)
npm run test:e2e:headed
```

### Auth for protected routes

Data-flow tests (Dashboard, Preview, Delivery, Master Data Sheet) require a signed-in user. Set:

- `E2E_TEST_USER_EMAIL` – test user email
- `E2E_TEST_USER_PASSWORD` – test user password

Example (Unix):

```bash
E2E_TEST_USER_EMAIL=you@example.com E2E_TEST_USER_PASSWORD=secret npm run test:e2e
```

If these are not set, data-flow tests are **skipped** and only public-route tests run (landing, auth page, redirect to auth for protected routes).

### Test files

| File | Coverage |
|------|----------|
| `e2e/public-routes.spec.ts` | Landing, auth, submit-request, redirect to auth for /dashboard, /preview, /delivery-preview |
| `e2e/data-flow-solutions.spec.ts` | Dashboard Solutions tab, Preview, Master Data Sheet Solutions, navigation |
| `e2e/data-flow-delivery.spec.ts` | Dashboard Delivery tab, Delivery Preview, Master Data Sheet Delivery, navigation |
| `e2e/data-flow-cross-page.spec.ts` | Cross-page navigation, add solution flow, refetch on re-enter |
| `e2e/auth.setup.ts` | Sign-in and save storage state for authenticated project |
