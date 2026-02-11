# End-to-End Single Block Lovable Prompt

Copy the **entire block below** (from the opening ``` to the closing ```) and paste it into Lovable chat or your Lovable-hosted project context so the project can be accommodated as-is.

---

```
PROJECT: entry-share-pal (Lovable-hosted)

This is a React + Vite + TypeScript web app using Supabase for database and auth. Deploy the latest state from GitHub and ensure the following is understood and preserved.

——— DEPLOYMENT ON LOVABLE ———
• Source: GitHub repository (branch main). Connect the repo via Lovable’s “Import / Connect repository” and use main for builds.
• Build: npm run build (Vite).
• Environment variables (set in Lovable project settings): VITE_SUPABASE_URL, VITE_SUPABASE_PUBLISHABLE_KEY. Do not commit .env.
• After connecting the repo and setting env vars, deploy; optionally enable auto-deploy on push to main.

——— DATABASE (SUPABASE) ———
The app expects these to be run in Supabase Dashboard → SQL Editor (no CLI required). If the project has no schema yet, run migrations in supabase/migrations/ in date order first.
• Personnel tables (agents, account_managers, clients, solution_managers, delivery_managers): run supabase/RUN_PERSONNEL_MIGRATIONS.sql.
• Dashboard config: run supabase/RUN_DASHBOARD_CONFIG.sql.
• Cloud Billing: run supabase/RUN_CLOUD_BILLING.sql. Optional sample data: supabase/RUN_CLOUD_BILLING_SAMPLE_DATA.sql.
• If “no DB Schema” or “relation does not exist” appears in the app, the UI shows an alert instructing users to run the above scripts; see supabase/README_SCHEMA.md for full instructions.

——— APPLICATION STRUCTURE & FEATURES ———
• Main navigation: Dashboard, Solutions, Delivery, ADR, Calendar, Reports (role-based; Reports for admin, finance, ops_lead).
• Dashboard: Role-based tabs (e.g. Overview, User Management, Lab Catalog, Personnel & Clients, Dashboard Config). Filters (date, lab type, client, LOB, agent, account manager, status). Delivery overview shows KPI cards for Total, Pending, Work-in-Progress, Test Creds Shared, Delivery In-Progress, Completed (no separate “Total Revenue” KPI card in that grid).
• Solutions: Entry Form + Requests List. List uses inline filter buttons: “Filter:” then All, Pending, Sent, POC In-Progress, Lost Closed (each Button with Badge count; selected = default variant, unselected = outline, size sm).
• Delivery: Entry Form + Requests List. List uses the same pattern as Solutions: “Filter:” then All, Pending, Work In-Progress, Test Credentials (inline Button + Badge; default/outline, size sm). One table below showing filtered delivery requests.
• Reports (route /reports): Tabs Revenue, Lab Type, Learners, Summary, Cloud Billing (Cloud Billing for admin/finance/ops_lead). Summary shows Solutions Summary and Delivery Summary panels (totals and status counts). Cloud Billing tab: AWS, Azure, GCP sections; columns Month, Vendor Name, Overall Business, Cost on [Cloud], Margins, Margin %, Invoiced to Customer, Yet to be Billed; Add/Edit/Delete and “Load sample data” button.
• Personnel & Clients (Admin): Tabbed CRUD for Agents, Account Managers, Clients (with optional Account Manager), Solution Managers, Delivery Managers. If personnel tables are missing, a red alert tells users to run RUN_PERSONNEL_MIGRATIONS.sql.
• Master Data Sheet: Solutions and Delivery tables; filter by lab type (All, Public Cloud, Private Cloud, TP Labs); AI Edit; export.
• Auth: Role-based access; protected routes; Reports and Admin sections gated by role.

——— DATA & SCHEMA HIGHLIGHTS ———
• Personnel: agents, account_managers, clients, solution_managers, delivery_managers; FKs on lab_requests and delivery_requests (agent_id, account_manager_id, client_id, requester_id).
• Cloud Billing: cloud_billing_details (provider aws/azure/gcp, vendor_name, month, year, overall_business, cloud_cost, invoiced_to_customer, yet_to_be_billed). vendor_name is a column; add it if missing (see supabase/migrations/20260208200001_add_vendor_name.sql or RUN_CLOUD_BILLING.sql).
• dashboard_config: role-to-dashboard mapping and display order for role-based dashboard tabs.

——— UI PATTERNS TO PRESERVE ———
• Listing filters: “Filter:” label with ListFilter icon, then a row of inline Button components (variant default when selected, outline otherwise, size sm), each with icon + label + Badge(count). Used in Solutions list and Delivery list.
• No dedicated “Revenue” KPI card in the Delivery overview card grid (only Total, Pending, WIP, Test Creds Shared, Delivery In-Progress, Completed).
• Reports and Admin tabs: tab list layout (e.g. grid-cols-4 or 5) based on number of tabs; Cloud Billing as a report tab with provider sections and vendor_name column.

——— FILES OF INTEREST ———
• docs/ENHANCEMENTS_LIST.md – full list of enhancements (personnel, schema, product plan, reports, cloud billing).
• docs/LOVABLE_DEPLOY.md, PUSH_TO_GITHUB.md – deployment and push steps.
• supabase/README_SCHEMA.md – when to run which SQL scripts.

Accommodate this project on the Lovable-hosted project: connect the GitHub repo, set the two Supabase env vars, run the listed SQL scripts in the linked Supabase project, and ensure the UI and behaviour above (including filter button style, no revenue KPI in Delivery overview, Cloud Billing with vendor_name, and Personnel & Clients with schema alert) are preserved.
```

---

Use this block in Lovable’s chat or project context so the host has the full picture for deployment, database setup, and feature/UI expectations.
