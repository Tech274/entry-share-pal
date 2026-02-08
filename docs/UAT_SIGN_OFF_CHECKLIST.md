# UAT Sign-Off Checklist

**MakeMyLabs Platform – Phase 1 Stabilisation**

Use this checklist to confirm platform readiness for production. Sign off per department where applicable.

---

## 1. Data Integrity & Sync

| # | Check | Ops | Finance | Admin | Pass |
|---|--------|-----|---------|-------|------|
| 1.1 | Add a new Solution (Entry Form) – it appears in Solutions list and Dashboard KPIs without manual refresh | ☐ | | | ☐ |
| 1.2 | Edit a Solution (e.g. status) – change reflects in Dashboard and Preview | ☐ | | | ☐ |
| 1.3 | Add a Delivery request – it appears in Delivery list and Dashboard | ☐ | | | ☐ |
| 1.4 | Delete or bulk-update requests – data stays consistent across Dashboard, Preview, Master Data Sheet | ☐ | | | ☐ |
| 1.5 | Open Dashboard in two tabs; add/edit in one tab – other tab updates (realtime or on focus) | ☐ | | | ☐ |

---

## 2. Role-Based Access

| # | Check | Role | Pass |
|---|--------|------|------|
| 2.1 | Ops Engineer sees **Ops Dashboard** only (My workload, pending, Quick Actions) | ops_engineer | ☐ |
| 2.2 | Finance sees **Leadership Dashboard** only (Revenue, margin, learners, MoM) | finance | ☐ |
| 2.3 | Ops Lead sees **Ops + Leadership** combined dashboard | ops_lead | ☐ |
| 2.4 | Admin sees **Admin Dashboard** (Overview, User Management, Lab Catalog, Personnel & Clients) | admin | ☐ |
| 2.5 | Reports page: only Admin can access (or as per Report Access Matrix if Phase 4 applied) | admin | ☐ |
| 2.6 | Unauthorised role cannot access other role’s dashboard or Reports | All | ☐ |

---

## 3. Department-Specific UAT

### 3.1 Ops

| # | Check | Pass |
|---|--------|------|
| 3.1.1 | “My Requests” shows only assigned-to-me items where applicable | ☐ |
| 3.1.2 | Pending counts (Solutions / Delivery) are correct | ☐ |
| 3.1.3 | Quick Actions (e.g. navigate to Solutions/Delivery by status) work | ☐ |
| 3.1.4 | Next 7 Days / upcoming trainings widget shows correct data | ☐ |

### 3.2 Leadership (Finance)

| # | Check | Pass |
|---|--------|------|
| 3.2.1 | Revenue and margin numbers match expectations | ☐ |
| 3.2.2 | Learner counts are correct | ☐ |
| 3.2.3 | Month-over-Month comparison displays correctly | ☐ |

### 3.3 Admin

| # | Check | Pass |
|---|--------|------|
| 3.3.1 | User Management: assign/change roles, list users | ☐ |
| 3.3.2 | Lab Catalog: categories, labels, templates CRUD | ☐ |
| 3.3.3 | Personnel & Clients: Agents, Account Managers, Clients, Solution/Delivery Managers CRUD | ☐ |
| 3.3.4 | Reports page loads and all report tabs work | ☐ |

---

## 4. Critical Flows (No Bugs)

| # | Flow | Pass |
|---|------|------|
| 4.1 | Add → Edit → Delete (Solution and Delivery) – no console errors, state consistent | ☐ |
| 4.2 | Filters on Dashboard (Client, Agent, LOB, Month, etc.) apply correctly | ☐ |
| 4.3 | Export CSV/PDF from Dashboard works | ☐ |
| 4.4 | E2E tests pass (public routes + data-flow when auth configured) | ☐ |

---

## Sign-Off

| Department | Lead | Date | Signature |
|------------|------|------|-----------|
| Ops | | | |
| Finance | | | |
| Admin / Product | | | |

**Notes / Critical bugs found:**  
_(Document any blocking issues here.)_

---

*Checklist version: Phase 1. Update when configurable dashboards (Phase 2) or report access (Phase 4) are in use.*
