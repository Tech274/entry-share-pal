# SOP: Dashboard Access by Role

**MakeMyLabs Platform – Standard Operating Procedure**

This document describes how dashboard access is determined by user role and where to manage it.

---

## 1. Role–Dashboard Mapping (Default)

| Role | Dashboard(s) | Scope |
|------|--------------|--------|
| **Ops Engineer** (`ops_engineer`) | Ops Dashboard | My workload, pending deliveries, ready/expiring, Quick Actions, Next 7 Days |
| **Finance** (`finance`) | Leadership Dashboard | Revenue, costs, margins, learners, Month-over-Month |
| **Ops Lead** (`ops_lead`) | Ops + Leadership | Combined view: team workload, SLA/MoM, revenue, learners |
| **Admin** (`admin`) | Admin Dashboard | Full access: Overview, User Management, Lab Catalog, Personnel & Clients, Reports link |

---

## 2. What Each Role Sees

- **Ops Engineer**  
  - Sees only the **Ops Dashboard**: assignments, pending counts, Quick Actions, filters.  
  - Does **not** see Leadership metrics, Admin tabs, or Reports (unless Phase 4 report access grants it).

- **Finance**  
  - Sees only the **Leadership Dashboard**: revenue breakdown, margins, learners, MoM.  
  - Does **not** see Ops workload, Admin tabs, or User Management.

- **Ops Lead**  
  - Sees the **combined Ops + Leadership** dashboard: both execution and financial oversight in one view.

- **Admin**  
  - Sees the **Admin Dashboard** with Overview, User Management, Lab Catalog, Personnel & Clients.  
  - Can open **Reports** from the dashboard (Admin-only by default; Phase 4 can extend to Finance/Ops Lead).

---

## 3. How Access Is Enforced

- User **role** is stored in the database (e.g. `user_roles` table) and set via **Admin → User Management**.
- After login, the app reads the user’s role and renders the **corresponding dashboard(s)**.
- Protected routes (e.g. `/dashboard`, `/reports`) allow only authenticated users; `/reports` may further restrict by role (e.g. admin only, or admin + finance + ops_lead per Phase 4).

---

## 4. Changing a User’s Dashboard Access

1. Log in as **Admin**.
2. Go to **Dashboard → User Management** tab.
3. Find the user and set their **Role** (Ops Engineer, Finance, Ops Lead, or Admin).
4. Save. On next login (or refresh), the user will see the dashboard(s) for that role.

**Note:** **Phase 2 (Configurable Dashboards)** is implemented. Admin can enable/disable specific dashboards per role from **Admin Dashboard → Dashboard Config** tab. The table in section 1 reflects the *configured* mapping when config is used; otherwise default mapping applies.

---

## 5. Reports Access

- **Reports** is available to **Admin**, **Finance**, and **Ops Lead** (Phase 4).
- Visibility of report tabs differs by role: **Admin** sees all (Revenue, Lab Type, Learners, Summary); **Finance** sees Revenue, Lab Type, Learners; **Ops Lead** sees all. **Ops Engineer** does not have Reports access (Agent Performance “own only” can be added later).

---

*Document version: Phase 1. Update when Phase 2 (configurable dashboards) or Phase 4 (report access matrix) is implemented.*
