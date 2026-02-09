# Entry Share Pal - Deployment Guide

## Lovable Deployment

This project is deployed on the Lovable platform with GitHub integration for version control.

### Prerequisites

1. Lovable account with project access
2. GitHub repository connected to the project
3. Supabase project configured (auto-managed by Lovable Cloud)

### Environment Variables

Set these in Lovable project settings (Settings → Secrets):

| Variable | Description |
|----------|-------------|
| `VITE_SUPABASE_URL` | Auto-populated by Lovable Cloud |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Auto-populated by Lovable Cloud |

**Note:** For external Supabase instances, you can also set:
- `VITE_EXTERNAL_SUPABASE_URL`
- `VITE_EXTERNAL_SUPABASE_ANON_KEY`

### Deployment Steps

1. **Connect Repository**
   - Open project settings in Lovable
   - Navigate to GitHub → Connect project
   - Select the main branch for builds

2. **Configure Environment**
   - Lovable Cloud auto-configures Supabase credentials
   - Additional secrets can be added in project settings

3. **Deploy**
   - Click "Publish" in the Lovable editor
   - Changes are deployed automatically on commit to main

### Database Setup

If using a fresh Supabase instance, run these migrations in order:

1. Core migrations from `supabase/migrations/` (auto-applied by Lovable Cloud)
2. Personnel tables (if needed): Run from Cloud UI → Database → SQL Editor
3. Cloud Billing tables (if needed): Run from Cloud UI → Database → SQL Editor

### Continuous Deployment

- **GitHub → Lovable**: Pushes to main auto-sync to Lovable
- **Lovable → GitHub**: Edits in Lovable auto-commit to GitHub
- **Backend Changes**: Deploy immediately (edge functions, migrations)
- **Frontend Changes**: Require clicking "Update" in publish dialog

## Build Commands

```bash
# Development
npm run dev

# Production build
npm run build

# Type checking
npm run typecheck
```

## Project Structure

```
src/
├── components/         # React components
│   ├── dashboards/    # Role-based dashboard views
│   ├── personnel/     # Personnel management
│   ├── reports/       # Reports and analytics
│   └── ui/            # shadcn/ui components
├── hooks/             # Custom React hooks
├── pages/             # Route pages
├── contexts/          # React contexts (Auth)
├── integrations/      # Supabase clients
└── types/             # TypeScript types

supabase/
├── functions/         # Edge functions
└── migrations/        # Database migrations
```
