
# Smart Request Assignment & Automated Status Transitions

✅ **IMPLEMENTED**

This plan implements two major automation features: a smart request assignment system with workload balancing and automated status transitions based on dates.

---

## Current State Analysis

| Component | Status |
|-----------|--------|
| `assigned_to` column | ✅ Already exists in both `lab_requests` and `delivery_requests` tables |
| Profiles table | ✅ Contains `user_id`, `email`, `full_name` for engineers |
| User roles | ✅ `ops_engineer`, `ops_lead`, `finance`, `admin` already defined |
| Existing hooks | ✅ `useLabRequests` and `useDeliveryRequests` updated with assignedTo |
| Email notifications | ✅ Edge function `send-notification-email` already exists |
| Activity log table | ✅ Created `request_activity_log` |
| Engineer settings | ✅ Created `engineer_settings` table |

---

## Implementation Plan

### Phase 1: Database Schema Changes

Create new tables for activity logging, assignment configuration, and engineer settings:

**New Tables:**

1. **`request_activity_log`** - Audit trail for all request changes
   - `id`, `request_id`, `request_type` (solution/delivery)
   - `action` (created, updated, assigned, status_changed)
   - `old_values`, `new_values` (JSONB)
   - `performed_by` (user_id), `created_at`

2. **`engineer_settings`** - Engineer capacity and expertise configuration
   - `user_id`, `max_active_requests` (default: 10)
   - `expertise` (JSONB array of lab types they specialize in)
   - `is_available` (for vacation/unavailable status)

**Database Functions:**

1. **`get_engineer_workload(user_id)`** - Returns count of active requests
2. **`get_available_engineers()`** - Returns engineers with capacity ordered by workload
3. **`log_request_activity()`** - Trigger function to auto-log changes

---

### Phase 2: Smart Assignment System

**New Components:**

1. **`AssigneeDropdown.tsx`** - Dropdown showing engineers with workload indicators
   - Shows engineer name, current load (e.g., "Mahesh (3/10)")
   - Color-coded: green (<50%), yellow (50-80%), red (>80%)
   - "Assign to Me" quick option for logged-in user
   - Only visible to Ops Lead and Admin roles

2. **`TeamWorkloadPanel.tsx`** - Visual workload distribution panel
   - Progress bars showing each engineer's capacity
   - Shows pending vs. in-progress breakdown
   - Quick filter to show unassigned requests

3. **`BulkAssignDialog.tsx`** - Dialog for bulk assigning selected rows
   - Dropdown to select engineer
   - Shows how many will be assigned
   - Auto-assignment option (round-robin)

**New Hooks:**

1. **`useEngineers.ts`** - Fetch engineers with roles and workload
   ```typescript
   // Returns: { engineers, loading, getWorkload, refreshWorkload }
   // Each engineer: { user_id, full_name, email, activeCount, maxCapacity, expertise }
   ```

2. **`useAssignment.ts`** - Assignment operations
   ```typescript
   // Methods: assignRequest, bulkAssign, assignToMe, autoAssign
   ```

**UI Updates:**

- Add "Assignee" column to both Preview.tsx and DeliveryPreview.tsx spreadsheets
- Update BulkActionsBar to include bulk assignment option
- Add workload panel to OpsLeadDashboard

---

### Phase 3: Automated Status Transitions

**New Edge Function: `auto-status-update`**

Scheduled to run daily via cron, this function will:

```text
Status Transition Rules:
+---------------------------------+------------------------+-------------------+
| Condition                       | From Status            | To Status         |
+---------------------------------+------------------------+-------------------+
| Lab Start Date = Today          | Solution Pending       | In Progress       |
| Lab End Date passed (yesterday) | In Progress            | Ready             |
| Lab End Date passed + 3 days    | Ready                  | Completed         |
+---------------------------------+------------------------+-------------------+
```

**Implementation:**

1. Query requests where date conditions match
2. Update status in batch
3. Log activity for each transition
4. Send email notifications to assignee and requester

**Cron Setup:**
```sql
-- Run daily at 1:00 AM UTC
SELECT cron.schedule(
  'auto-status-update-daily',
  '0 1 * * *',
  $$ SELECT net.http_post(...) $$
);
```

---

### Phase 4: Activity Timeline

**New Components:**

1. **`ActivityTimeline.tsx`** - Timeline view of request history
   - Shows all status changes, assignments, updates
   - User avatars/names and timestamps
   - Expandable to show before/after values

2. **`ActivityFeed.tsx`** - Dashboard widget showing recent activity
   - Real-time updates via Supabase subscriptions
   - Filterable by type (assignments, status changes)
   - Click to navigate to request

**Integration:**
- Add activity tab/panel to request detail views
- Add activity feed widget to OpsLead and Admin dashboards

---

## File Structure

```text
New Files to Create:
+-- src/components/assignment/
|   +-- AssigneeDropdown.tsx
|   +-- TeamWorkloadPanel.tsx
|   +-- BulkAssignDialog.tsx
|
+-- src/components/activity/
|   +-- ActivityTimeline.tsx
|   +-- ActivityFeed.tsx
|
+-- src/hooks/
|   +-- useEngineers.ts
|   +-- useAssignment.ts
|   +-- useActivityLog.ts
|
+-- supabase/functions/auto-status-update/
    +-- index.ts

Files to Modify:
+-- src/pages/Preview.tsx (add Assignee column, bulk assign)
+-- src/pages/DeliveryPreview.tsx (add Assignee column, bulk assign)
+-- src/components/BulkActionsBar.tsx (add assign action)
+-- src/components/dashboards/OpsLeadDashboard.tsx (add workload panel)
+-- src/hooks/useLabRequests.ts (add assignRequest method)
+-- src/hooks/useDeliveryRequests.ts (add assignRequest method)
+-- supabase/config.toml (add new edge function)
```

---

## Technical Details

### Database Migration

```sql
-- Activity log table
CREATE TABLE request_activity_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id UUID NOT NULL,
  request_type TEXT NOT NULL CHECK (request_type IN ('solution', 'delivery')),
  action TEXT NOT NULL,
  old_values JSONB,
  new_values JSONB,
  performed_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Engineer settings
CREATE TABLE engineer_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  max_active_requests INTEGER NOT NULL DEFAULT 10,
  expertise JSONB DEFAULT '[]'::jsonb,
  is_available BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Enable RLS with appropriate policies
```

### Edge Function: auto-status-update

```typescript
// Pseudo-code structure
Deno.serve(async (req) => {
  const supabase = createClient(url, serviceKey);
  const today = new Date().toISOString().split('T')[0];
  
  // 1. Lab Start Date = Today -> In Progress
  const { data: starting } = await supabase
    .from('lab_requests')
    .update({ status: 'In Progress' })
    .eq('status', 'Solution Pending')
    .eq('lab_start_date', today)
    .select();
  
  // 2. Lab End Date passed -> Ready
  const { data: ending } = await supabase
    .from('delivery_requests')
    .update({ lab_status: 'Ready' })
    .eq('lab_status', 'In Progress')
    .lt('end_date', today)
    .select();
  
  // 3. Log activities and send notifications
  // ...
  
  return new Response(JSON.stringify({ 
    transitioned: { starting: starting?.length, ending: ending?.length }
  }));
});
```

### AssigneeDropdown Component

```typescript
interface AssigneeDropdownProps {
  requestId: string;
  requestType: 'solution' | 'delivery';
  currentAssignee: string | null;
  onAssign: (userId: string) => Promise<void>;
}

// Features:
// - Fetches engineers with workload via useEngineers hook
// - Shows capacity indicators (progress bars or color coding)
// - "Assign to Me" shortcut for current user
// - Triggers activity log on assignment change
```

---

## Implementation Order

| Step | Task | Effort |
|------|------|--------|
| 1 | Create database tables (`request_activity_log`, `engineer_settings`) | Low |
| 2 | Create `useEngineers` hook to fetch engineers with workload | Low |
| 3 | Create `AssigneeDropdown` component | Medium |
| 4 | Add Assignee column to Preview.tsx and DeliveryPreview.tsx | Low |
| 5 | Create `useAssignment` hook with assign/bulk assign methods | Medium |
| 6 | Update `BulkActionsBar` with bulk assign option | Low |
| 7 | Create `TeamWorkloadPanel` for OpsLead dashboard | Medium |
| 8 | Create `auto-status-update` edge function | Medium |
| 9 | Set up cron schedule for daily status updates | Low |
| 10 | Create `ActivityTimeline` component | Medium |
| 11 | Add activity logging trigger/hook | Medium |

---

## User Experience Flow

### Assignment Flow (Ops Lead/Admin)

1. Navigate to Solutions or Delivery spreadsheet
2. See new "Assignee" column with current assignment or "Unassigned"
3. Click dropdown to see engineers with workload indicators
4. Select engineer to assign (or use "Assign to Me")
5. Activity is logged, notification sent to assignee

### Bulk Assignment Flow

1. Select multiple rows using checkboxes
2. Bulk actions bar appears with new "Assign" button
3. Click "Assign" to open dialog with engineer dropdown
4. Optionally enable "Auto-assign (round-robin)"
5. Confirm to assign all selected requests

### Automated Status Updates

1. Cron job runs daily at 1:00 AM
2. Requests with matching date conditions are transitioned
3. Email notifications sent to affected parties
4. Activity logged for compliance/audit

---

## Security Considerations

- Assignment operations restricted to `ops_lead` and `admin` roles
- Activity log is append-only (no delete/update policies)
- Engineer settings editable only by `admin`
- Edge function uses service role key for status updates
