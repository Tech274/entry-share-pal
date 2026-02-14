# Known Limitations

**MakeMyLabs Platform – For Stakeholders**

This list captures current limitations at the time of Phase 1 rollout. Use it for UAT and go-live decisions.

---

## 1. Dashboard & Roles

- **Configurable dashboards (Phase 2):** Admin can enable/disable dashboards per role from **Admin Dashboard → Dashboard Config**. A role can have multiple dashboards (e.g. Ops Lead can see both Ops and Leadership as tabs).
- **No regional/BU-specific views**: All users in a role see the same dashboard. No geography or business-unit filtering at login.

---

## 2. Reports

- **Reports** is available to **Admin**, **Finance**, and **Ops Lead** (Phase 4). Report tabs are filtered by role: Finance sees Revenue, Lab Type, Learners; Ops Lead and Admin see all tabs.
- **Agent Performance**: “Own only” for Ops Engineers is not yet implemented; Ops Engineer does not have Reports access. Agent Performance as a dedicated report tab with “own only” filter can be added later.

---

## 3. Data & Sync

- **Realtime sync** depends on Supabase Realtime; if the connection drops, data may stale until the user refocuses the tab or refreshes.
- **Bulk import** (Master Data Sheet): AI autocorrect and personnel resolution depend on reference data (agents, account managers, clients, etc.). Missing or duplicate names may leave some rows with unresolved IDs; text fallback is used where applicable.
- **Historical data**: No built-in archiving or soft-delete; deleted requests are removed from the database.

---

## 4. Configuration

- **Lab Catalog**, **Personnel & Clients**, and **User roles** are managed only in the app (Admin UI). No external config file or env-based role mapping.
- **KPI definitions** (e.g. revenue formula, SLA thresholds) are defined in code/docs; no admin-editable KPI config yet (Phase 3 governance doc will capture definitions and owners).

---

## 5. Technical

- **E2E tests** require auth to be configured for data-flow tests (Solutions, Delivery, cross-page). Public route tests run without auth.
- **Browser support**: Modern browsers (Chrome, Firefox, Edge, Safari). No formal support for legacy browsers.
- **Offline**: No offline mode; the app requires an active connection to Supabase.

---

## 6. Process

- **Approvals / workflows**: No multi-step approval or workflow engine. Status changes are direct edits.
- **Audit trail**: No full change history (who changed what, when) for requests; only created/updated timestamps where applicable.
- **Notifications**: No in-app or email notifications for SLA breach or assignment; rely on dashboard widgets and manual review.

---

*Last updated: Phase 1. Revisit as Phases 2–4 and continuous improvement items are delivered.*
