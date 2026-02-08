
# Technical Audit & Remediation Plan
## MakeMyLabs Operations Platform

---

## Executive Summary (CTO-Readable)

This audit reveals a functional application with **moderate security vulnerabilities**, **no automated quality gates**, and **zero observability infrastructure**. The codebase is production-deployed but lacks the hardening expected for enterprise software handling financial and customer data.

### Critical Findings
| Category | Severity | Risk |
|----------|----------|------|
| All Edge Functions bypass JWT verification | HIGH | Unauthenticated access to data modification endpoints |
| No rate limiting on public endpoints | HIGH | DoS/abuse vectors on AI and email functions |
| TypeScript strict mode disabled | MEDIUM | Runtime errors, null pointer exceptions |
| Zero test coverage | MEDIUM | Regression risk, deployment anxiety |
| No CI/CD pipeline | MEDIUM | Manual deployments, no quality gates |
| No error boundaries | LOW | White screen crashes for users |
| No observability | MEDIUM | Blind to production issues |

### Production Readiness Verdict: **CONDITIONAL GO**
The application can continue operating but requires immediate remediation of security issues within 2 weeks, followed by infrastructure hardening over 90 days.

---

## Agent 1: Security & Threat Modeling

### Current Attack Surface

```text
+------------------+     +-------------------+     +------------------+
|  Public Internet | --> | Edge Functions    | --> | Supabase DB      |
|                  |     | (NO JWT VERIFY)   |     | (RLS Enabled)    |
+------------------+     +-------------------+     +------------------+
                              |
                              v
                    +-------------------+
                    | Lovable AI Gateway|
                    | (Rate Limited)    |
                    +-------------------+
```

### Threat Model

| Threat | Vector | Current Mitigation | Gap |
|--------|--------|-------------------|-----|
| Spam Request Submission | `submit-request` accepts any input | None | No rate limiting, no CAPTCHA |
| Email Bomb Attack | `send-notification-email` / `send-catalog-share` | None | Unlimited emails per IP |
| AI Credit Exhaustion | `ai-assistant` / `ai-data-editor` | Gateway 429/402 | No per-user limits |
| Data Scraping | `track-email-open` exposes share IDs | None | Enumerable share IDs |
| Privilege Escalation | RLS on user_roles | `has_role()` SECURITY DEFINER | Properly implemented |

### Edge Function Security Matrix

| Function | `verify_jwt` | Auth Check in Code | Rate Limit | Verdict |
|----------|-------------|-------------------|------------|---------|
| submit-request | false | None | None | PUBLIC (intentional) |
| send-notification-email | false | None | None | VULNERABLE |
| send-catalog-share | false | None | None | VULNERABLE |
| track-email-open | false | None | None | PUBLIC (tracking pixel) |
| auto-status-update | false | None | None | VULNERABLE (cron-only) |
| ai-assistant | false | None | None | VULNERABLE |
| ai-data-editor | false | None | None | VULNERABLE |
| ai-csv-autocorrect | false | None | None | VULNERABLE |

### Remediation: Edge Function Security

**Priority 1: Add Authentication (Week 1)**

For authenticated functions (`ai-assistant`, `ai-data-editor`, `ai-csv-autocorrect`):

```typescript
// Add at top of each function
const authHeader = req.headers.get('Authorization');
if (!authHeader?.startsWith('Bearer ')) {
  return new Response(JSON.stringify({ error: 'Unauthorized' }), { 
    status: 401, 
    headers: corsHeaders 
  });
}

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_ANON_KEY')!,
  { global: { headers: { Authorization: authHeader } } }
);

const { data, error } = await supabase.auth.getClaims(authHeader.replace('Bearer ', ''));
if (error || !data?.claims) {
  return new Response(JSON.stringify({ error: 'Unauthorized' }), { 
    status: 401, 
    headers: corsHeaders 
  });
}
```

**Priority 2: Rate Limiting Strategy**

| Endpoint | Limit | Implementation |
|----------|-------|----------------|
| submit-request | 5/min per IP | In-memory counter + Supabase log |
| send-catalog-share | 10/hour per sender | Check `catalog_share_tracking` count |
| ai-* functions | 30/min per user | Gateway + local counter |

**Priority 3: Input Validation Hardening**

- Add Zod schemas for all edge function inputs
- Validate email formats with strict regex
- Sanitize HTML in email templates (DOMPurify equivalent)
- Limit text field lengths (subject: 200, description: 5000)

### RLS Policy Issues Detected

| Issue | Table | Fix |
|-------|-------|-----|
| All profiles visible to authenticated users | profiles | Restrict to own profile + admin |
| Customer emails exposed | catalog_share_tracking | Scope to sender_email = user email |

---

## Agent 2: Frontend Architecture

### Current State Analysis

```text
App.tsx
├── QueryClientProvider
├── AuthProvider (Context)
├── TooltipProvider
├── Toaster (shadcn/ui)
├── Sonner (notifications)
└── BrowserRouter
    └── Routes (no error handling)
```

### Critical Gaps

1. **No Error Boundaries**: Application crashes show white screen
2. **No Suspense Boundaries**: Loading states inconsistent
3. **No Layout Component**: Header duplicated per page
4. **Accessibility Gaps**: Missing skip links, focus management

### Recommended Architecture

```text
App.tsx
├── ErrorBoundary (global catch)
├── QueryClientProvider
├── AuthProvider
├── TooltipProvider
├── Toaster + Sonner
└── BrowserRouter
    └── Routes
        ├── PublicLayout (Landing, Auth, Catalog)
        │   └── Suspense boundary
        └── ProtectedLayout (Dashboard, etc.)
            ├── Header
            ├── ErrorBoundary (route-level)
            ├── Suspense boundary
            └── Outlet
```

### Error Boundary Implementation

Create `src/components/ErrorBoundary.tsx`:

```typescript
import { Component, ReactNode } from 'react';
import { Button } from '@/components/ui/button';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, info);
    // TODO: Send to Sentry when integrated
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="min-h-screen flex items-center justify-center p-4">
          <div className="text-center space-y-4">
            <h1 className="text-2xl font-bold">Something went wrong</h1>
            <p className="text-muted-foreground">
              {this.state.error?.message || 'An unexpected error occurred'}
            </p>
            <Button onClick={() => window.location.reload()}>
              Reload Page
            </Button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
```

### Accessibility Checklist

| Issue | Location | Fix |
|-------|----------|-----|
| No skip link | App.tsx | Add "Skip to main content" link |
| Focus trapping in modals | Dialog components | Already handled by Radix |
| Missing aria-live for toasts | Toaster | Already handled by Sonner |
| Keyboard navigation in tables | DataTable | Add arrow key navigation |

---

## Agent 3: TypeScript & Code Quality

### Current Configuration Issues

**tsconfig.json** (root):
```json
{
  "noImplicitAny": false,      // DANGEROUS
  "strictNullChecks": false,   // DANGEROUS
  "noUnusedLocals": false,     // Code smell
  "noUnusedParameters": false  // Code smell
}
```

**tsconfig.app.json**:
```json
{
  "strict": false,             // Disables all strict checks
  "noFallthroughCasesInSwitch": false
}
```

### Incremental Strict Mode Rollout Plan

**Phase 1 (Week 1-2): Low-Risk Flags**
```json
{
  "noFallthroughCasesInSwitch": true,
  "noUnusedLocals": true,
  "noUnusedParameters": true
}
```
Expected fixes: ~50-100 unused variable warnings

**Phase 2 (Week 3-4): Null Safety**
```json
{
  "strictNullChecks": true
}
```
Expected fixes: ~200-400 null checks needed. Focus on:
- Hook return values
- API response handling
- Optional chaining additions

**Phase 3 (Week 5-6): Type Inference**
```json
{
  "noImplicitAny": true
}
```
Expected fixes: ~100-200 type annotations needed

**Phase 4 (Week 7-8): Full Strict**
```json
{
  "strict": true
}
```
Enables: strictBindCallApply, strictFunctionTypes, strictPropertyInitialization

### ESLint Hardening

Current `eslint.config.js` disables important rules:
```javascript
"@typescript-eslint/no-unused-vars": "off"  // Should be "warn"
```

Recommended additions:
```javascript
rules: {
  "@typescript-eslint/no-unused-vars": ["warn", { 
    argsIgnorePattern: "^_",
    varsIgnorePattern: "^_"
  }],
  "@typescript-eslint/no-explicit-any": "warn",
  "@typescript-eslint/explicit-function-return-type": "off", // Keep off for JSX
  "react-hooks/exhaustive-deps": "warn"
}
```

---

## Agent 4: Testing & Quality Assurance

### Current State

- **Test files**: 1 placeholder (`src/test/example.test.ts`)
- **Coverage**: 0%
- **Framework**: Vitest configured but unused

### Test Pyramid for This Application

```text
                    ┌─────────────┐
                    │   E2E (5%)  │  ← Critical user flows
                    ├─────────────┤
                    │Integration  │  ← API + Component (25%)
               ┌────┴─────────────┴────┐
               │    Unit Tests (70%)   │  ← Hooks, utils, logic
               └───────────────────────┘
```

### Priority Test Targets

**Tier 1: Critical Path (Week 1)**
| Component | Type | Why |
|-----------|------|-----|
| useAuth hook | Unit | Auth state management |
| useLabRequests hook | Unit | Data CRUD operations |
| ProtectedRoute | Integration | Authorization gate |
| Auth.tsx | Integration | Login/signup flows |

**Tier 2: Business Logic (Week 2-3)**
| Component | Type | Why |
|-----------|------|-----|
| Dashboard calculations | Unit | Financial metrics |
| exportUtils | Unit | CSV/XLS generation |
| formatUtils | Unit | Currency, date formatting |
| BulkUploadDialog | Integration | CSV parsing |

**Tier 3: UI Components (Week 4+)**
| Component | Type | Why |
|-----------|------|-----|
| DataTable | Integration | Complex interactions |
| CalendarView | Integration | Date handling |
| AIAssistant | Integration | API integration |

### Sample Test Structure

```typescript
// src/hooks/__tests__/useAuth.test.tsx
import { describe, it, expect, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useAuth, AuthProvider } from '@/contexts/AuthContext';

vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    auth: {
      getSession: vi.fn().mockResolvedValue({ data: { session: null } }),
      onAuthStateChange: vi.fn().mockReturnValue({ 
        data: { subscription: { unsubscribe: vi.fn() } } 
      }),
    },
  },
}));

describe('useAuth', () => {
  it('returns null user when not authenticated', async () => {
    const { result } = renderHook(() => useAuth(), {
      wrapper: AuthProvider,
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.user).toBeNull();
  });
});
```

### Coverage Targets

| Phase | Timeline | Target |
|-------|----------|--------|
| Phase 1 | Week 1-2 | 20% (critical hooks) |
| Phase 2 | Week 3-4 | 40% (business logic) |
| Phase 3 | Week 5-8 | 60% (components) |
| Phase 4 | Ongoing | 70%+ maintenance |

---

## Agent 5: DevOps & CI/CD

### Current State

- **No `.github/workflows`**: Zero automation
- **No pre-commit hooks**: No local quality gates
- **Manual deployments**: Direct to Lovable preview

### GitHub Actions Blueprint

Create `.github/workflows/ci.yml`:

```yaml
name: CI Pipeline

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

env:
  NODE_VERSION: '20'

jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'
      - run: npm ci
      - run: npm run lint

  typecheck:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'
      - run: npm ci
      - run: npx tsc --noEmit

  test:
    runs-on: ubuntu-latest
    needs: [lint, typecheck]
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'
      - run: npm ci
      - run: npm test -- --coverage
      - uses: codecov/codecov-action@v4
        if: always()

  build:
    runs-on: ubuntu-latest
    needs: [test]
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'
      - run: npm ci
      - run: npm run build
      - uses: actions/upload-artifact@v4
        with:
          name: dist
          path: dist/
```

### Environment Strategy

| Environment | Branch | Auto-Deploy | Purpose |
|-------------|--------|-------------|---------|
| Preview | All PRs | Yes (Lovable) | Feature testing |
| Staging | main | Yes | Integration testing |
| Production | Tagged releases | Manual approval | User-facing |

---

## Agent 6: Observability & Monitoring

### Current State: Blind Operations

- No error tracking
- No performance metrics
- No health endpoints
- Console.log only

### Recommended Stack

| Layer | Tool | Purpose |
|-------|------|---------|
| Error Tracking | Sentry | Exception capture, breadcrumbs |
| Performance | Sentry Performance | Web vitals, API timing |
| Uptime | Lovable (built-in) | Basic availability |
| Logs | Edge function logs | Backend debugging |

### Sentry Integration Plan

**Phase 1: Basic Error Tracking**

```typescript
// src/lib/sentry.ts
import * as Sentry from '@sentry/react';

Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN,
  environment: import.meta.env.MODE,
  tracesSampleRate: 0.1, // 10% of transactions
  replaysSessionSampleRate: 0.01, // 1% of sessions
  replaysOnErrorSampleRate: 1.0, // 100% on error
});
```

**Phase 2: Error Boundary Integration**

```typescript
// Update ErrorBoundary.tsx
componentDidCatch(error: Error, info: React.ErrorInfo) {
  Sentry.captureException(error, { extra: info });
}
```

### What to Monitor

| Metric | Threshold | Alert |
|--------|-----------|-------|
| Error rate | > 1% of requests | Slack + Email |
| API latency (p95) | > 3s | Slack |
| Edge function errors | Any 5xx | Slack |
| Auth failures | > 10/hour | Email |

### What NOT to Monitor (Noise Reduction)

- 404s on static assets
- Auth validation failures (expected)
- AI rate limit responses (expected)

---

## Agent 7: Documentation & Developer Experience

### Missing Documentation

| Document | Priority | Purpose |
|----------|----------|---------|
| `.env.example` | HIGH | Onboarding |
| `CONTRIBUTING.md` | MEDIUM | Contribution guide |
| `CHANGELOG.md` | MEDIUM | Version history |
| API docs for edge functions | HIGH | Integration reference |

### .env.example Template

```bash
# Supabase Configuration (auto-populated by Lovable)
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your-anon-key
VITE_SUPABASE_PROJECT_ID=your-project-id

# Optional: Error Tracking
VITE_SENTRY_DSN=

# Optional: Analytics
VITE_ANALYTICS_ID=
```

### Edge Function Documentation Template

```markdown
## submit-request

**Purpose**: Public endpoint for lab request submissions

**Authentication**: None (public)

**Rate Limit**: 5 requests/minute per IP

**Request Body**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| taskType | string | Yes | "Lab Request - Solutions" or "Lab Request - Delivery" |
| requesterEmail | string | Yes | Valid email address |
| potentialId | string | Yes | Unique identifier |
| startDate | string | Yes | ISO date format |
| endDate | string | Yes | ISO date format |
| subject | string | Yes | Request title |
| description | string | No | Rich text description |

**Response**: `{ success: true, data: { id: "uuid" } }`
```

---

## Agent 8: Risk, Cost & Business Impact

### Risk Matrix

| Risk | Probability | Impact | Business Cost | Remediation Priority |
|------|-------------|--------|---------------|---------------------|
| Email spam via public endpoints | HIGH | MEDIUM | Reputation, email deliverability | P1 |
| AI credit exhaustion | MEDIUM | HIGH | Service disruption, $ loss | P1 |
| Runtime crash (null errors) | HIGH | LOW | User frustration | P2 |
| Data exposure via weak RLS | LOW | HIGH | Compliance, trust | P2 |
| Deployment breaks production | MEDIUM | HIGH | Downtime | P2 |

### Cost Exposure Analysis

| Vector | Potential Cost | Likelihood | Mitigation Cost |
|--------|----------------|------------|-----------------|
| AI API abuse | $500-5000/month | Medium | 4 hours dev time |
| Email provider suspension | $0 direct, reputation damage | Low-Medium | 2 hours dev time |
| Outage from unhandled error | $X per hour downtime | Medium | 8 hours dev time |

### Engineering Effort vs Payoff

```text
HIGH PAYOFF, LOW EFFORT (DO FIRST):
├── Add auth to AI edge functions (2h)
├── Add rate limiting to submit-request (4h)
├── Create Error Boundary (2h)
└── Enable strictNullChecks (8h refactor)

HIGH PAYOFF, HIGH EFFORT (PLAN FOR):
├── Full test coverage (40h+)
├── CI/CD pipeline (8h)
└── Sentry integration (4h)

LOW PAYOFF (DEFER):
├── Full TypeScript strict mode (20h)
├── Accessibility audit (16h)
└── Documentation overhaul (12h)
```

### What NOT to Fix Immediately

1. **Full strict TypeScript**: Defer until test coverage exists
2. **Comprehensive accessibility audit**: Current state is acceptable
3. **E2E test suite**: Unit tests provide better ROI now
4. **Custom monitoring dashboard**: Sentry covers needs

---

## Agent 9: Integrated 90-Day Execution Plan

### Week 1-2: Security Sprint
- [ ] Add JWT authentication to AI edge functions
- [ ] Implement rate limiting on submit-request
- [ ] Add input validation with Zod to all endpoints
- [ ] Fix RLS policy for profiles table
- [ ] Create Error Boundary component

### Week 3-4: Quality Foundation
- [ ] Enable TypeScript flags: noFallthroughCasesInSwitch, noUnusedLocals
- [ ] Write tests for useAuth, useLabRequests hooks
- [ ] Set up GitHub Actions CI pipeline (lint + typecheck)
- [ ] Add .env.example and basic documentation

### Week 5-6: Null Safety
- [ ] Enable strictNullChecks
- [ ] Fix resulting ~300 type errors
- [ ] Add integration tests for Auth flow
- [ ] Add Sentry error tracking

### Week 7-8: Observability & Hardening
- [ ] Enable noImplicitAny
- [ ] Configure Sentry performance monitoring
- [ ] Add test coverage reporting to CI
- [ ] Document all edge functions

### Week 9-12: Stabilization
- [ ] Enable full strict mode
- [ ] Achieve 40% test coverage
- [ ] Add E2E tests for critical paths
- [ ] Create developer onboarding guide

### Success Metrics

| Metric | Current | Week 4 | Week 8 | Week 12 |
|--------|---------|--------|--------|---------|
| Test Coverage | 0% | 20% | 40% | 60% |
| TypeScript Errors | 0 (disabled) | <50 | <10 | 0 |
| Sentry Error Rate | N/A | <2% | <1% | <0.5% |
| Auth on Edge Functions | 0/8 | 4/8 | 8/8 | 8/8 |

---

## Final Verdict

**CONDITIONAL GO FOR PRODUCTION**

The application is functional and has proper RLS on core tables. However, the following MUST be addressed within 14 days:

1. **Add authentication to AI edge functions** - Currently anyone can exhaust AI credits
2. **Add rate limiting to public endpoints** - Currently vulnerable to abuse
3. **Add global Error Boundary** - Currently shows white screen on crash

With these three fixes, the application meets minimum production standards. The 90-day plan provides a path to engineering excellence.

