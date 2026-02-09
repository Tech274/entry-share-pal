# Database Schema Guide

## Overview

This document describes the database tables used by Entry Share Pal and when to run specific migration scripts.

## Core Tables (Auto-Applied)

These tables are created automatically by Lovable Cloud migrations:

- `lab_requests` - Solution/Lab request records
- `delivery_requests` - Delivery workflow records
- `profiles` - User profiles
- `user_roles` - Role-based access control
- `engineer_settings` - Engineer availability/capacity
- `lab_catalog_entries` - Lab template catalog
- `lab_catalog_categories` - Category definitions
- `lab_catalog_labels` - Label definitions
- `lab_catalog_entry_labels` - Entry-label associations
- `request_activity_log` - Audit trail
- `catalog_share_tracking` - Email share analytics

## Personnel Tables

Tables for managing agents, account managers, clients, and managers.

### Tables

- `agents` - Sales/support agents
- `account_managers` - Account managers
- `clients` - Client organizations (with optional AM relationship)
- `solution_managers` - Solution architects
- `delivery_managers` - Delivery leads

### When to Run

Run the personnel migration if you see:
- "Personnel tables not found" alert in the UI
- Errors referencing `agents`, `account_managers`, `clients`, etc.

### Migration

The tables are included in the main migration. If they're missing, check:
1. Cloud UI → Database → Tables to verify existence
2. Re-run the latest migration if needed

## Cloud Billing Tables

Tables for tracking AWS/Azure/GCP cloud billing.

### Tables

- `cloud_billing_details` - Cloud provider billing entries
  - `provider`: 'aws' | 'azure' | 'gcp'
  - `vendor_name`: Vendor identifier
  - `month`, `year`: Billing period
  - `overall_business`: Total business value
  - `cloud_cost`: Provider costs
  - `margins`: Computed (overall_business - cloud_cost)
  - `margin_percentage`: Computed percentage
  - `invoiced_to_customer`: Amount invoiced
  - `yet_to_be_billed`: Computed (overall_business - invoiced_to_customer)

### When to Run

Run the cloud billing migration if you see:
- "Database Schema Missing" alert in Cloud Billing tab
- Errors referencing `cloud_billing_details`

## Dashboard Config

Configuration for role-based dashboard views.

### Tables

- `dashboard_config` - Role-to-dashboard mapping
  - `role`: User role (admin, ops_lead, finance, ops_engineer)
  - `dashboard_key`: Dashboard identifier
  - `display_order`: Tab ordering
  - `is_enabled`: Whether tab is visible

## RLS Policies

All tables have Row Level Security (RLS) enabled:

- **Personnel Tables**: Viewable by authenticated users; manageable by admin/ops_lead
- **Cloud Billing**: Viewable by admin/finance/ops_lead; manageable by admin/finance
- **Dashboard Config**: Viewable by authenticated users; manageable by admin only

## Troubleshooting

### "relation does not exist" Error

1. Check if table exists in Cloud UI → Database → Tables
2. Look for pending migrations
3. Verify your user has the correct role

### RLS Policy Errors

1. Ensure user is authenticated
2. Verify user has required role in `user_roles` table
3. Check the specific policy in Cloud UI → Database → Policies

### Missing Data

1. Check Supabase default limit (1000 rows)
2. Verify filters aren't hiding records
3. Check browser console for API errors
