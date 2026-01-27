# Implementation Roadmap - Quick Reference

## Current Status: Ready to Begin Phase 0

### Phase 0: OpenAPI Type Generation (CRITICAL - Start Here)
**Estimated Time**: 2 hours  
**Priority**: CRITICAL

**Tasks**:
1. Install `openapi-typescript` package (30 min)
2. Generate initial types from Swagger (15 min)
3. Create type helper utilities (1 hour)

**Deliverables**:
- `types/api.d.ts` - Auto-generated TypeScript definitions
- `lib/api-types.ts` - Helper type exports
- npm scripts for type generation

---

### Phase 1: Enhanced Security & Token Management
**Estimated Time**: 3 hours  
**Priority**: HIGH

**Tasks**:
1. Update AuthService with generated types (1 hour)
2. Add token expiration handling (2 hours)

**Deliverables**:
- Fully typed AuthService
- 401 error interceptor with auto-logout

---

### Phase 2: Global Authentication State
**Estimated Time**: 6 hours  
**Priority**: HIGH

**Tasks**:
1. Create Auth Context Provider with types (3 hours)
2. Implement Protected Route wrapper (1 hour)
3. Update root layout (30 min)
4. Update login page to use context (30 min)

**Deliverables**:
- `contexts/auth-context.tsx`
- `hooks/use-auth.ts`
- `components/auth/protected-route.tsx`
- Updated login flow

---

### Phase 3: Enhanced API Client
**Estimated Time**: 4 hours  
**Priority**: MEDIUM

**Tasks**:
1. Create BaseService class with type support (2 hours)
2. Update all services to extend BaseService (2 hours)

**Deliverables**:
- `services/base-service.ts`
- Updated LeadsService, ContactsService, VisitsService

---

### Phase 4: Backend OpenAPI Enhancement
**Estimated Time**: 5 hours  
**Priority**: MEDIUM

**Tasks**:
1. Review and enhance Swagger annotations (3 hours)
2. Add missing schema definitions (2 hours)
3. Regenerate documentation (15 min)

**Deliverables**:
- Complete OpenAPI schemas
- Updated Swagger documentation
- Regenerated frontend types

---

## Total Estimated Time: 20 hours (2.5 weeks at 8 hours/week)

## Week 1 Schedule

### Day 1 (Monday) - Type Foundation
- [ ] Task 0.1: Install openapi-typescript
- [ ] Task 0.2: Generate initial types
- [ ] Task 0.3: Create type helpers
- [ ] Task 1.1: Update AuthService with types

**Expected Output**: Working type generation, typed AuthService

### Day 2 (Tuesday) - Token Management
- [ ] Task 1.2: Token expiration handling
- [ ] Start Task 2.1: Auth Context Provider

**Expected Output**: Auto-logout on 401, partial AuthProvider

### Day 3 (Wednesday) - Auth Context Complete
- [ ] Complete Task 2.1: Auth Context Provider
- [ ] Task 2.2: Protected Route wrapper
- [ ] Task 2.3: Update root layout
- [ ] Task 2.4: Update login page

**Expected Output**: Full auth context, protected routes working

### Day 4 (Thursday) - Testing & Fixes
- [ ] Test login flow
- [ ] Test protected routes
- [ ] Test token expiration
- [ ] Fix any bugs
- [ ] Update documentation

**Expected Output**: Stable Phase 0-2 implementation

## Week 2 Schedule

### Day 1-2 (Monday-Tuesday) - Service Layer
- [ ] Task 3.1: BaseService class
- [ ] Task 3.2: Update all services

**Expected Output**: All services using BaseService with types

### Day 3-4 (Wednesday-Thursday) - Backend Docs
- [ ] Task 4.1: Review Swagger annotations
- [ ] Task 4.2: Add missing schemas
- [ ] Task 4.3: Regenerate docs

**Expected Output**: Complete OpenAPI documentation

### Day 5 (Friday) - Polish & Deploy
- [ ] Integration testing
- [ ] Performance optimization
- [ ] Documentation updates
- [ ] Code review

**Expected Output**: Production-ready implementation

---

## Quick Start Commands

### Setup (First Time)
```bash
# Frontend
cd AlamiaConnectKTD-nextjs
pnpm add -D openapi-typescript
pnpm generate:api

# Backend (ensure running)
cd ../AlamiaConnect-Backend
php artisan serve
```

### Development Workflow
```bash
# Terminal 1: Backend
cd AlamiaConnect-Backend
php artisan serve

# Terminal 2: Frontend with auto type generation
cd AlamiaConnectKTD-nextjs
pnpm dev  # Runs Next.js + type generation in watch mode
```

### Manual Type Regeneration
```bash
cd AlamiaConnectKTD-nextjs
pnpm generate:api
```

---

## Success Metrics

### Phase 0 Complete When:
- [ ] `types/api.d.ts` generated successfully
- [ ] Can import types: `import type { components } from '@/types/api'`
- [ ] IDE autocomplete works for API types

### Phase 1 Complete When:
- [ ] AuthService uses generated types
- [ ] 401 errors trigger automatic logout
- [ ] No TypeScript errors in auth-service.ts

### Phase 2 Complete When:
- [ ] Login redirects to dashboard
- [ ] Protected routes redirect to login when not authenticated
- [ ] Page refresh maintains session
- [ ] Loading states display correctly

### Phase 3 Complete When:
- [ ] All services extend BaseService
- [ ] JSON:API responses properly deserialized
- [ ] Type safety across all API calls

### Phase 4 Complete When:
- [ ] All endpoints have OpenAPI annotations
- [ ] Swagger UI shows complete documentation
- [ ] Generated types include all models

---

## Troubleshooting

### Types Not Generating
```bash
# Check backend is running
curl http://localhost:8000/api/documentation/json

# Regenerate manually
pnpm generate:api

# Check for errors
pnpm generate:api --verbose
```

### Type Errors After Generation
```bash
# Clear Next.js cache
rm -rf .next

# Restart TypeScript server in VS Code
Cmd/Ctrl + Shift + P -> "TypeScript: Restart TS Server"
```

### Backend Swagger Not Updating
```bash
cd AlamiaConnect-Backend
php artisan l5-swagger:generate
php artisan config:clear
```

---

## Next Immediate Action

**START HERE**: Begin with Phase 0, Task 0.1

```bash
cd AlamiaConnectKTD-nextjs
pnpm add -D openapi-typescript
```

Then proceed through tasks in order.
