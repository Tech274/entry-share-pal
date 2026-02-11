# Go-Live Checklist

**MakeMyLabs Platform – Production Rollout**

Use this checklist before and on go-live day.

---

## Pre–go-live

| # | Task | Owner | Done |
|---|------|--------|------|
| 1 | All migrations applied (personnel reference tables, backfill, dashboard_config) | DevOps/Admin | ☐ |
| 2 | UAT sign-off received from Ops Lead and Finance Lead | Product | ☐ |
| 3 | KPI definitions and ownership agreed (see KPI_GOVERNANCE.md) | Leadership | ☐ |
| 4 | User roles assigned in Admin → User Management for all internal users | Admin | ☐ |
| 5 | Dashboard Config reviewed (Admin → Dashboard Config); default or custom mapping confirmed | Admin | ☐ |
| 6 | Reports access verified for Admin, Finance, Ops Lead | Admin | ☐ |
| 7 | E2E tests passing (auth configured for data-flow tests) | Dev | ☐ |
| 8 | Known limitations (docs/KNOWN_LIMITATIONS.md) shared with stakeholders | Product | ☐ |
| 9 | SOP “Dashboard access by role” (docs/SOP_DASHBOARD_ACCESS_BY_ROLE.md) shared with teams | Product | ☐ |

---

## Go-live day

| # | Task | Done |
|---|------|------|
| 1 | Final data refresh / sync verified | ☐ |
| 2 | Access tested for each role (Ops Engineer, Finance, Ops Lead, Admin) | ☐ |
| 3 | Reports page and dashboard filters tested per role | ☐ |
| 4 | Communication sent: platform live, link, support contact | ☐ |
| 5 | Monitor for critical errors (console, Supabase logs) | ☐ |

---

## Post–go-live (first week)

| # | Task | Done |
|---|------|------|
| 1 | Gather feedback from Ops and Finance on dashboard and reports | ☐ |
| 2 | Log any critical bugs; prioritise fixes | ☐ |
| 3 | Schedule first monthly ops/finance review (per Phase 5) | ☐ |

---

*Update this checklist as items are completed.*
