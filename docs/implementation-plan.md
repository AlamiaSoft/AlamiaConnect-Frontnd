# Alamia Connect Integration Implementation Plan

## Overview
This plan outlines the steps to integrate the `AlamiaConnect-Backend` (Laravel) with the `AlamiaConnectKTD-nextjs` frontend. The backend exposes JSON API standard-compliant endpoints which will be consumed by the Next.js application.

## 1. Backend Verification (Completed)
*   **Routes:** Verified presence of `login`, `leads`, `contacts`, `sales-visits` routes in `packages/Alamia/rest-api/src/Routes`.
*   **CORS:** Verified `ForceCors` middleware is registered in global `Kernel.php`.
*   **Auth:** Verified `Sanctum` auth setup for API requests.

## 2. Frontend Structure & Foundation

### 2.1 Service Layer Setup (Completed)
Created a `services` directory with domain-specific API logic:
*   **`lib/api.ts`**: Axios client with JSON:API headers, Bearer token interceptor, CSRF support
*   **`services/auth-service.ts`**: Login, logout, session management (localStorage-based)
*   **`services/leads-service.ts`**: Leads CRUD operations
*   **`services/contacts-service.ts`**: Contacts/Persons operations  
*   **`services/visits-service.ts`**: Sales visits operations

**Status**: COMPLETE - Basic services implemented

### 2.2 Authentication Flow Refinement (In Progress)
**Detailed Plan**: See `docs/auth-flow-refinement.md`

**Current Implementation**:
*   Login page uses `AuthService.login()`
*   Tokens stored in localStorage
*   Basic redirect logic on successful login

**Planned Improvements**:
1. **Security Enhancements**:
   - Token expiration handling with auto-logout
   - Global error interceptor for 401/403 responses
   - Consider HTTP-only cookies vs localStorage

2. **Global Auth State**:
   - Create AuthContext Provider
   - Implement useAuth() hook
   - Add ProtectedRoute wrapper component
   - Session validation on app mount

3. **Enhanced API Client**:
   - BaseService class for JSON:API deserialization
   - Centralized error handling
   - Response interceptors

4. **Service Improvements**:
   - Add `getCurrentUser()` method
   - Implement token refresh mechanism
   - Better error messages

**Next Steps**:
1. Review detailed plan in `docs/auth-flow-refinement.md`
2. Decide on security approach (cookies vs localStorage + refresh)
3. Implement Phase 1: Token expiration handling
4. Implement Phase 2: Auth Context Provider

## 3. Module Integration
Implement services and update UI components for each core module.

### 3.1 Leads Module (In Progress)
*   **Service:** `services/leads-service.ts` (Integrated with JSON:API types)
    *   [x] Enhance with pagination, filtering, sorting
    *   [x] Add search functionality
    *   [ ] Implement bulk operations
*   **UI Integration:** Update `app/leads/page.tsx`
    *   [x] Replace mock data with `LeadsService.getLeads()`
    *   [ ] Implement Create/Edit Lead forms
    *   [x] Add filters and search UI

### 3.2 Customers (Contacts) Module (In Progress)
*   **Service:** `services/contacts-service.ts` (Integrated with JSON:API types)
    *   [x] Enhance `getPersons(params)` with pagination/search
    *   [ ] Enhance `getOrganizations(params)` with filtering
    *   [ ] Add CRUD operations
*   **UI Integration:** Update `app/customers/page.tsx`
    *   [ ] Tabulate Persons vs Organizations
    *   [x] Implement search and filters (Partial)
    *   [x] Replace mock data with `PersonsService`

### 3.3 Field Visits (Pending)
*   **Service:** `services/visits-service.ts` (Basic exists)
    *   Map to `sales-visits` endpoints
    *   Add location tracking integration
    *   Implement visit status management
*   **UI Integration:** Update `app/field-visits/page.tsx`
    *   Display visits on map
    *   Add visit creation form

## 4. Current Focus

**Active Task**: Module Integration (Section 3)

**Priority Order**:
1. Complete Leads Module (Create/Edit Forms) (HIGH)
2. Complete Customers Module (Organizations, CRUD) (HIGH)
3. Enhance Auth Flow (MEDIUM)

## 5. Documentation

**Created**:
- `docs/implementation-plan.md` (this file)
- `docs/auth-flow-refinement.md` (detailed auth plan)

**To Create**:
- `docs/tasks/` - Individual task tracking
- `docs/api-integration-guide.md` - API usage examples
- `docs/testing-strategy.md` - Testing approach

## 6. Next Steps for Developer
1.  Review `docs/auth-flow-refinement.md` for detailed authentication plan
2.  Answer security questions (cookies vs localStorage)
3.  Approve Phase 1 & 2 tasks to begin implementation
4.  Set up task tracking system in `docs/tasks/`
