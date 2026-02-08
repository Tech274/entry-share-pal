# KPI Governance

**MakeMyLabs Platform – Definitions, Ownership, Cadence**

Single source of truth for metric definitions and governance (Phase 3).

---

## 1. KPI Definitions and Ownership

| KPI Area | Owner | Definition | Cadence |
|----------|--------|------------|---------|
| **Solutions pipeline** | Ops Lead | Counts by status: Solution Pending, Solution Sent, POC In-Progress, Lost Closed | Daily |
| **Delivery pipeline** | Ops Lead | Counts by status: Pending → Work-in-Progress → Test Credentials Shared → Delivery In-Progress → Delivery Completed | Daily |
| **Revenue (Solutions)** | Finance | Sum of **Total Amount for Training** by Month / Client / LOB / Lab Type | Monthly |
| **Revenue (Delivery)** | Finance | **Margin** = (Selling Cost per User × Number of Users) − (Input Cost per User × Number of Users); summed by Month / Client / LOB / Lab Type | Monthly |
| **SLA** | Ops Lead | Solution Pending > 3 days; Delivery past start date not completed | Daily |
| **Month-over-Month** | Leadership | Solutions count and Delivery count vs prior month; revenue vs prior month | Monthly |

---

## 2. Data Sources

- **Solutions:** `lab_requests` table (status, total_amount_for_training, month, client, line_of_business, cloud, etc.).
- **Delivery:** `delivery_requests` table (lab_status, number_of_users, selling_cost_per_user, input_cost_per_user, total_amount, month, client, etc.).
- **Personnel:** Reference tables `agents`, `account_managers`, `clients`, `solution_managers`, `delivery_managers` for filters and reporting.

---

## 3. Department Responsibilities

| Department | Governance Responsibilities |
|------------|-----------------------------|
| **Ops** | SLA definitions, assignment rules, “Next 7 Days” usage, pipeline counts |
| **Finance** | Revenue and margin definitions, LOB and Lab Type mapping, monthly close alignment |
| **Admin** | Role definitions, access control, Reports visibility, dashboard config |
| **Leadership** | KPI targets, exception escalation, review cadence |

---

## 4. Single Source of Truth

- **Revenue (Solutions):** Field `total_amount_for_training` on `lab_requests`. No other field should be used for “Solutions revenue” in reports.
- **Revenue (Delivery):** Margin formula above; derived from `number_of_users`, `selling_cost_per_user`, `input_cost_per_user` on `delivery_requests`. Total delivery revenue in reports = sum of margin per request.
- **Learners:** `user_count` (Solutions) for capacity; `number_of_users` (Delivery) for actual trained users. “Total learners” in platform = sum of `number_of_users` from delivery_requests.
- **Pipeline counts:** Status and lab_status as defined in app (e.g. SOLUTION_STATUS_OPTIONS, LAB_STATUS_OPTIONS). No ad-hoc status values for KPIs.

---

## 5. Review Cadence (from Plan)

- **Daily:** Ops Lead reviews pipeline and SLA.
- **Monthly:** Finance reviews revenue and margin; Leadership reviews MoM.
- **Quarterly:** Product/Admin review role and dashboard config with department heads.

---

*Document version: Phase 3. Update when definitions or ownership change.*
