# What's Next

**After Phases 1–4 (Product & Business Plan)**

---

## If migrations are not yet applied

1. **Personnel & backfill**  
   Run in Supabase Dashboard → SQL Editor:  
   `supabase/RUN_PERSONNEL_MIGRATIONS.sql`

2. **Dashboard config**  
   Run in Supabase Dashboard → SQL Editor:  
   `supabase/RUN_DASHBOARD_CONFIG.sql`

Or, with Supabase CLI linked and logged in:  
`npx supabase db push`

---

## Immediate (Weeks 1–4)

- **Week 1:** Run UAT with Ops and Finance using `docs/UAT_SIGN_OFF_CHECKLIST.md`; document critical bugs.
- **Week 2:** Finalise KPI definitions and ownership with department leads (align with `docs/KPI_GOVERNANCE.md`).
- **Week 4:** Use `docs/GO_LIVE_CHECKLIST.md` for production rollout decision and go-live.

---

## Later enhancements (Phase 5 and beyond)

- **Agent Performance “own only”** for Ops Engineer: add Reports access for ops_engineer with a single “Agent Performance” report filtered to current user’s assignments.
- **Report visibility in DB:** move report access matrix from code (`src/lib/reportAccessMatrix.ts`) to a config table so Admin can change report visibility per role without code deploy.
- **Audit trail:** who changed what and when on lab/delivery requests.
- **Notifications:** in-app or email for SLA breach or assignment.
- **Quarterly review:** roles and dashboard config with department heads (per plan risks).

---

## Reference

- **UAT:** `docs/UAT_SIGN_OFF_CHECKLIST.md`
- **SOP (dashboard access):** `docs/SOP_DASHBOARD_ACCESS_BY_ROLE.md`
- **Limitations:** `docs/KNOWN_LIMITATIONS.md`
- **KPI governance:** `docs/KPI_GOVERNANCE.md`
- **Go-live:** `docs/GO_LIVE_CHECKLIST.md`
