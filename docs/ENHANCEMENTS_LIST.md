# Entry Share Pal - Enhancement List

## Completed Features

### Personnel & Clients Management
- [x] Database tables for agents, account_managers, clients, solution_managers, delivery_managers
- [x] Personnel & Clients tab in Admin Dashboard
- [x] CRUD operations for all personnel types
- [x] Client-to-Account Manager relationship
- [x] Active/Inactive status toggle
- [x] RLS policies for role-based access

### Cloud Billing
- [x] Database table for cloud_billing_details
- [x] Cloud Billing tab in Reports
- [x] AWS, Azure, GCP sections
- [x] Columns: Month, Vendor Name, Overall Business, Cost, Margins, Margin %, Invoiced, Yet to be Billed
- [x] Add/Edit/Delete functionality
- [x] Load sample data feature
- [x] Computed columns (margins, margin_percentage, yet_to_be_billed)

### Dashboard Configuration
- [x] dashboard_config table for role-to-dashboard mapping
- [x] Default configurations for all roles
- [x] Display order support

### Reports Module
- [x] Reports tab accessible to admin, finance, ops_lead
- [x] Revenue breakdown view
- [x] Lab Type breakdown view
- [x] Learners breakdown view
- [x] Summary view with Solutions and Delivery summaries
- [x] Cloud Billing tab integration

### Navigation & Access
- [x] Reports tab in main navigation
- [x] Role-based access control
- [x] Proper routing for /reports page

## UI Patterns

### Filter Button Style
- "Filter:" label with ListFilter icon prefix
- Inline Button components
- `variant="default"` when selected, `variant="outline"` otherwise
- `size="sm"` for compact appearance
- Badge component showing record counts

### Dashboard Cards
- Solutions Overview: Blue header (bg-blue-500)
- Delivery Overview: Green header (bg-green-500)
- KPI cards with colored headers using semantic tokens
- No separate "Revenue" KPI card in Delivery overview grid

### Tables
- Sortable columns
- Inline editing where applicable
- Action buttons (Edit, Delete)
- Status badges with color coding

## Database Schema

### Personnel Tables
```sql
-- agents, account_managers, solution_managers, delivery_managers
CREATE TABLE public.{table_name} (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- clients (with account_manager relationship)
CREATE TABLE public.clients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    account_manager_id UUID REFERENCES public.account_managers(id),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);
```

### Cloud Billing
```sql
CREATE TABLE public.cloud_billing_details (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    provider TEXT NOT NULL CHECK (provider IN ('aws', 'azure', 'gcp')),
    vendor_name TEXT NOT NULL,
    month TEXT NOT NULL,
    year INTEGER NOT NULL,
    overall_business NUMERIC DEFAULT 0,
    cloud_cost NUMERIC DEFAULT 0,
    margins NUMERIC GENERATED ALWAYS AS (overall_business - cloud_cost) STORED,
    margin_percentage NUMERIC GENERATED ALWAYS AS (...) STORED,
    invoiced_to_customer NUMERIC DEFAULT 0,
    yet_to_be_billed NUMERIC GENERATED ALWAYS AS (overall_business - invoiced_to_customer) STORED,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);
```

## Role-Based Access

| Feature | Admin | Ops Lead | Finance | Ops Engineer |
|---------|-------|----------|---------|--------------|
| Personnel & Clients | ✅ | ✅ | ❌ | ❌ |
| Cloud Billing | ✅ | ✅ | ✅ | ❌ |
| Reports | ✅ | ✅ | ✅ | ❌ |
| User Management | ✅ | ❌ | ❌ | ❌ |
| Lab Catalog | ✅ | ✅ | ❌ | ❌ |
| Solutions | ✅ | ✅ | ❌ | ✅ |
| Delivery | ✅ | ✅ | ❌ | ✅ |
