# New Enhancements List

All enhancements added for personnel reference data, product plan phases, reports UX, and schema/setup improvements.

---

## 1. Personnel Reference Data (Agents, AM, Clients, Solution/Delivery Managers)

- **Database**
  - New tables: `agents`, `account_managers`, `clients`, `solution_managers`, `delivery_managers` (name, email where applicable, `is_active`, timestamps).
  - `clients` has `account_manager_id` FK to `account_managers`.
  - FK columns added on `lab_requests` and `delivery_requests`: `agent_id`, `account_manager_id`, `client_id`, `requester_id` (solution manager on lab, delivery manager on delivery).
  - RLS enabled on all five tables with permissive policies (read/insert/update/delete) for app access.
  - Triggers for `updated_at` on all personnel tables.
  - Indexes on name and FKs for performance.

- **Migrations**
  - `supabase/migrations/20260208120000_personnel_reference_tables.sql` – creates tables, RLS, FKs, indexes.
  - `supabase/migrations/20260208120001_personnel_backfill.sql` – backfills personnel from existing `lab_requests` / `delivery_requests` text columns and sets FK IDs.

- **Runnable script (no CLI required)**
  - `supabase/RUN_PERSONNEL_MIGRATIONS.sql` – single script for Supabase SQL Editor. Uses `CREATE TABLE IF NOT EXISTS`, idempotent policies/triggers, and only adds columns/indexes on `lab_requests`/`delivery_requests` if those tables exist (safe when DB has no schema yet).

- **Types**
  - `src/types/personnel.ts` – TypeScript types for Agent, AccountManager, Client, SolutionManager, DeliveryManager.

- **API / data layer**
  - `src/hooks/usePersonnel.ts` – queries: `useAgents`, `useAccountManagers`, `useClients`, `useSolutionManagers`, `useDeliveryManagers`; mutations: create/update/delete for each. All mutation errors normalized so toasts show the real Supabase message.

- **Admin CRUD UI**
  - `src/components/personnel/PersonnelManagement.tsx` – tabbed CRUD for all five entities; Clients have optional Account Manager dropdown. Wired into Admin as “Personnel & Clients” tab in `AdminDashboard.tsx`.

- **Forms using personnel**
  - Lab Request and Delivery Request forms use dropdowns for client, agent, account manager, solution/delivery manager (by ID) and sync display names; client selection can pre-fill account manager.
  - Master Data Sheet import uses `resolvePersonnelIds()` to map text to IDs.
  - Role-based dashboard filter options use personnel hooks.

- **Supabase types**
  - `src/integrations/supabase/types.ts` – `Database` type extended with the five personnel tables (Row, Insert, Update) so client calls are type-safe.

---

## 2. Schema Setup and “No DB Schema” Handling

- **Schema setup doc**
  - `supabase/README_SCHEMA.md` – when to run `RUN_PERSONNEL_MIGRATIONS.sql` only vs. running all migrations in order for a fresh project.

- **Personnel UI when schema is missing**
  - If loading personnel fails with errors mentioning “relation”, “does not exist”, or “schema” (e.g. “no DB Schema”), Personnel & Clients shows a red alert: “Database schema not set up” with instructions to run `RUN_PERSONNEL_MIGRATIONS.sql` and, if needed, migrations in `supabase/migrations/` in date order.

- **Validation and errors**
  - Personnel add/edit: “Name is required” toast and trim of name/email before submit.
  - All personnel mutation errors surfaced in toasts via normalized error handling in `usePersonnel.ts`.

---

## 3. Product Plan – Phase 1 (UAT, SOP, Limitations)

- **Docs**
  - `docs/UAT_SIGN_OFF_CHECKLIST.md` – UAT sign-off checklist.
  - `docs/SOP_DASHBOARD_ACCESS_BY_ROLE.md` – SOP for dashboard access by role.
  - `docs/KNOWN_LIMITATIONS.md` – known limitations list.

---

## 4. Product Plan – Phase 2 (Dashboard Config)

- **Database**
  - `supabase/migrations/20260208160000_dashboard_config.sql` – table `dashboard_config` (role, dashboard_slug, enabled, display_order).

- **Runnable script**
  - `supabase/RUN_DASHBOARD_CONFIG.sql` – for SQL Editor.

- **App**
  - `src/hooks/useDashboardConfig.ts` – read/update dashboard config.
  - `src/components/dashboards/DashboardConfigManagement.tsx` – Admin “Dashboard Config” tab to map roles to dashboards and order.
  - `RoleBasedDashboard.tsx` – uses config to show multiple dashboards as tabs per role.

---

## 5. Product Plan – Phase 3 (KPI Governance)

- **Doc**
  - `docs/KPI_GOVERNANCE.md` – KPI definitions and ownership.

---

## 6. Product Plan – Phase 4 (Reports by Role)

- **Access control**
  - `src/lib/reportAccessMatrix.ts` – which roles can access Reports (e.g. admin, finance, ops_lead).
  - Reports route and page restrict access by role; Reports tab and “Open Reports” shown only for allowed roles.

- **Reports UX**
  - Reports page tab layout (TabsList columns) depends on number of allowed tabs (1–4).
  - Index page: Reports tab content is a card with “Open Reports” button; main tab bar uses 6 columns when Reports is visible.

---

## 7. Other Docs and Checklist

- **Docs**
  - `docs/GO_LIVE_CHECKLIST.md` – go-live checklist.
  - `docs/WHATS_NEXT.md` – suggested next steps.

---

## Summary Table

| Area | Enhancements |
|------|----------------|
| **Personnel** | Tables, migrations, runnable SQL, types, hooks, Admin CRUD, forms/dropdowns, backfill, Supabase types |
| **Schema setup** | RUN_PERSONNEL_MIGRATIONS.sql (idempotent, no-schema-safe), README_SCHEMA.md, “Database schema not set up” alert |
| **Phase 1** | UAT checklist, SOP dashboard access, known limitations |
| **Phase 2** | dashboard_config table & Admin UI, RoleBasedDashboard tabs from config |
| **Phase 3** | KPI governance doc |
| **Phase 4** | Report access matrix, Reports by role, Reports UX (tabs, card, 6-col bar) |
| **Other** | Go-live checklist, What’s next |
