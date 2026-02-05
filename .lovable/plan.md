
# Dashboard Restructuring Plan

## Understanding the Workflow

Based on your explanation, here's the clarified process:

```text
+--------------------------------------------------+
|               EXTERNAL FLOW                       |
|   Solution Manager / Delivery Manager raises      |
|   requests via public portal (/submit-request)    |
+--------------------------------------------------+
                        |
                        v
+--------------------------------------------------+
|               INTERNAL SYSTEM                     |
|   Ops Team can:                                   |
|   1. View external requests                       |
|   2. Raise internal requests via forms            |
|   3. Manage all requests in consolidated view     |
|   4. Import/Export data via Excel                 |
+--------------------------------------------------+
                        |
                        v
+--------------------------------------------------+
|               ADR (All Delivery Records)          |
|   Categorized by Lab Type:                        |
|   - Public Cloud Labs                             |
|   - Private Cloud Labs                            |
|   - Third-Party Labs                              |
+--------------------------------------------------+
```

---

## Proposed Tab Structure

```text
HOME PAGE TABS (4 Main Tabs)
+-------------------------------------------------------------------+
| Dashboard | Solutions | Delivery | ADR                            |
+-------------------------------------------------------------------+

SOLUTIONS TAB (2 Sub-tabs)
+-------------------------------------------------------------------+
| Entry Form | Requests List                                        |
+-------------------------------------------------------------------+
  - Entry Form: Form for Ops team to raise internal solution requests
  - Requests List: Consolidated view of ALL solution requests
    (both internal from Ops + external from Solution Managers)

DELIVERY TAB (2 Sub-tabs)
+-------------------------------------------------------------------+
| Entry Form | Requests List                                        |
+-------------------------------------------------------------------+
  - Entry Form: Form for Ops team to raise internal delivery requests
  - Requests List: Consolidated view of ALL delivery requests
    (both internal from Ops + external from Delivery Managers)

ADR TAB (3 Sub-tabs)
+-------------------------------------------------------------------+
| Public Cloud | Private Cloud | Third-Party Labs                   |
+-------------------------------------------------------------------+
  - Each sub-tab shows combined Solutions + Delivery for that lab type
  - Import/Export features available (CSV/Excel)
  - Date range filtering
  - Summary statistics
```

---

## Implementation Plan

### Phase 1: Restructure Main Index.tsx Navigation

**Current State:** 9 tabs (Dashboard, Calendar, Solutions, Delivery, Solutions Table, Delivery Table, Private, Public, TP Labs)

**New State:** 4 tabs (Dashboard, Solutions, Delivery, ADR)

| Change | Description |
|--------|-------------|
| Remove tabs | Calendar, Solutions Table, Delivery Table, Private Cloud, Public Cloud, TP Labs |
| Restructure Solutions | Merge form + table into one tab with sub-tabs |
| Restructure Delivery | Merge form + table into one tab with sub-tabs |
| Create ADR | Move cloud-based views here with Import/Export |

### Phase 2: Create Solutions Tab with Sub-tabs

Create a new component that combines the entry form and requests list:

**File: `src/components/SolutionsTabContent.tsx`**

```text
Structure:
+------------------------------------------------------------+
| Solutions                                                   |
+------------------------------------------------------------+
| [Entry Form] [Requests List (count)]                        |
+------------------------------------------------------------+
|                                                              |
|  Tab Content:                                                |
|  - Entry Form: LabRequestForm component                      |
|  - Requests List: RequestsTable with full CRUD               |
|                                                              |
+------------------------------------------------------------+
```

**Features:**
- Sub-tabs: "Entry Form" and "Requests List"
- Requests List shows combined internal + external requests
- Full table functionality (sorting, filtering, inline editing)

### Phase 3: Create Delivery Tab with Sub-tabs

Similar structure to Solutions:

**File: `src/components/DeliveryTabContent.tsx`**

```text
Structure:
+------------------------------------------------------------+
| Delivery                                                    |
+------------------------------------------------------------+
| [Entry Form] [Requests List (count)]                        |
+------------------------------------------------------------+
|                                                              |
|  Tab Content:                                                |
|  - Entry Form: DeliveryRequestForm component                 |
|  - Requests List: DeliveryTable with full CRUD               |
|                                                              |
+------------------------------------------------------------+
```

### Phase 4: Create ADR Tab with Cloud Sub-tabs

Restructure the existing cloud-based views into the ADR tab:

**Updates to `src/pages/Index.tsx`:**

```text
ADR Tab Structure:
+------------------------------------------------------------+
| ADR (All Delivery Records)                                  |
+------------------------------------------------------------+
| [Public Cloud] [Private Cloud] [Third-Party Labs]           |
+------------------------------------------------------------+
|                                                              |
|  Import/Export Toolbar:                                      |
|  [Import CSV] [Export CSV] [Export XLS]                      |
|                                                              |
|  Summary Stats (filtered by cloud type)                      |
|  +------------+  +------------+  +------------+              |
|  | Revenue    |  | Users      |  | Margin     |              |
|  +------------+  +------------+  +------------+              |
|                                                              |
|  Date Range Filter                                           |
|  [Presets] [Custom Date Picker]                              |
|                                                              |
|  Combined/Separate View Toggle                               |
|  [Combined View] / [Separate Tables]                         |
|                                                              |
|  Data Table(s)                                               |
+------------------------------------------------------------+
```

**Role-Based Access:**
- Import/Export visible to: Admin, Ops Lead, Ops Engineer
- Finance role: View-only access (no import feature)

### Phase 5: Update Index.tsx Tab Structure

**Before:**
```text
Tabs: Dashboard | Calendar | Solutions | Delivery | Solutions (n) | Delivery (n) | Private | Public | TP Labs
```

**After:**
```text
Tabs: Dashboard | Solutions | Delivery | ADR
```

### Phase 6: Enhance ADR with Import/Export

Add import/export functionality to the ADR tab:

**Features:**
- "Import CSV" button opens bulk upload dialog
- "Export" dropdown with CSV and XLS options
- Role-based visibility (ops_engineer, ops_lead, admin)
- Template download for import

---

## File Changes Summary

| File | Action | Description |
|------|--------|-------------|
| `src/pages/Index.tsx` | Modify | Restructure to 4 main tabs with nested sub-tabs |
| `src/components/SolutionsTabContent.tsx` | Create | New component with Entry Form + Requests List sub-tabs |
| `src/components/DeliveryTabContent.tsx` | Create | New component with Entry Form + Requests List sub-tabs |
| `src/components/ADRTabContent.tsx` | Create | New component for ADR with cloud sub-tabs and Import/Export |
| `src/components/CloudTabContent.tsx` | Modify | Add Import/Export toolbar, role-based visibility |

---

## Technical Details

### SolutionsTabContent Component

```typescript
// Structure
<Tabs defaultValue="form">
  <TabsList>
    <TabsTrigger value="form">Entry Form</TabsTrigger>
    <TabsTrigger value="list">Requests List ({count})</TabsTrigger>
  </TabsList>
  
  <TabsContent value="form">
    <LabRequestForm onSubmit={handleSubmit} />
  </TabsContent>
  
  <TabsContent value="list">
    {/* Toolbar with Import/Export */}
    <RequestsTable requests={requests} onDelete={handleDelete} />
  </TabsContent>
</Tabs>
```

### ADRTabContent Component

```typescript
// Structure  
<Tabs defaultValue="public-cloud">
  {/* Import/Export Toolbar - visible to Ops roles */}
  {canImportExport && (
    <div className="toolbar">
      <BulkUploadDialog ... />
      <ExportDropdown ... />
    </div>
  )}
  
  <TabsList>
    <TabsTrigger value="public-cloud">Public Cloud ({count})</TabsTrigger>
    <TabsTrigger value="private-cloud">Private Cloud ({count})</TabsTrigger>
    <TabsTrigger value="tp-labs">Third-Party Labs ({count})</TabsTrigger>
  </TabsList>
  
  {/* Each TabsContent uses CloudTabContent */}
</Tabs>
```

### Role-Based Access for Import/Export

```typescript
const { isAdmin, isOpsLead, isOpsEngineer } = useAuth();
const canImportExport = isAdmin || isOpsLead || isOpsEngineer;
```

---

## Minimal Changes Approach

This plan focuses on:

1. **Reusing existing components** - LabRequestForm, DeliveryRequestForm, RequestsTable, DeliveryTable, CloudTabContent, BulkUploadDialog
2. **Restructuring navigation** - Moving existing functionality under new tab hierarchy
3. **Creating wrapper components** - SolutionsTabContent, DeliveryTabContent, ADRTabContent as thin wrappers
4. **Adding role-based visibility** - Using existing auth context for Import/Export access

**No changes needed to:**
- Database schema
- Existing hooks (useLabRequests, useDeliveryRequests)
- Export utilities (exportToCSV, exportToXLS)
- Form components (LabRequestForm, DeliveryRequestForm)
- Table components (RequestsTable, DeliveryTable)
