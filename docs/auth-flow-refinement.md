# Authentication Flow Refinement - Implementation Plan

## Current State Analysis

### What's Already Done
1. **Service Layer** - Basic services created:
   - `auth-service.ts` - Login, logout, session management
   - `leads-service.ts` - Leads CRUD operations
   - `contacts-service.ts` - Contacts/Persons operations
   - `visits-service.ts` - Sales visits operations

2. **API Client** (`lib/api.ts`):
   - Axios instance configured
   - JSON:API headers set
   - Bearer token interceptor
   - CSRF cookie support

3. **Login Page** (`app/login/page.tsx`):
   - Uses AuthService.login()
   - Stores token in localStorage
   - Basic error handling
   - Redirects to home on success

4. **Backend API Documentation**:
   - Swagger UI available at `http://localhost:8000/api/documentation`
   - OpenAPI spec at `http://localhost:8000/api/documentation/json`

### Issues to Address

#### 1. Type Safety
- **No TypeScript types for API**: Manual type definitions prone to drift
- **No compile-time validation**: API changes break at runtime
- **Inconsistent type definitions**: Each service defines its own types

#### 2. Security Concerns
- **LocalStorage for tokens**: Vulnerable to XSS attacks
- **No token expiration handling**: Tokens may expire without user notification
- **No refresh token mechanism**: User must re-login when token expires

#### 3. Session Management
- **No global auth state**: Each component checks localStorage independently
- **No automatic logout on token expiration**: User may see errors instead of being redirected to login
- **No loading state during auth check**: App may flash unauthenticated content

#### 4. API Response Handling
- **Inconsistent JSON:API parsing**: Login response structure unclear
- **No global error interceptor**: Each service handles errors independently
- **No retry logic**: Network failures require manual retry

## Implementation Tasks

### Phase 0: OpenAPI Type Generation Setup (NEW)

#### Task 0.1: Install OpenAPI TypeScript Generator
**Priority**: CRITICAL  
**Estimated Time**: 30 minutes

**Installation**:
```bash
cd AlamiaConnectKTD-nextjs
pnpm add -D openapi-typescript
```

**Add Scripts to package.json**:
```json
{
  "scripts": {
    "generate:api": "openapi-typescript http://localhost:8000/api/documentation/json -o ./types/api.d.ts",
    "generate:api:watch": "openapi-typescript http://localhost:8000/api/documentation/json -o ./types/api.d.ts --watch",
    "dev": "concurrently \"next dev\" \"pnpm generate:api:watch\""
  }
}
```

**Files to Create**:
- `types/api.d.ts` (auto-generated)
- `.gitignore` entry for generated files (optional)

#### Task 0.2: Generate Initial Types
**Priority**: CRITICAL  
**Estimated Time**: 15 minutes

**Steps**:
1. Ensure backend is running: `php artisan serve`
2. Generate types: `pnpm generate:api`
3. Verify types file created: `types/api.d.ts`

**Validation**:
```typescript
// Test import in any file
import type { components, paths } from '@/types/api';

type User = components['schemas']['User'];
type LoginResponse = paths['/api/v1/login']['post']['responses']['200']['content']['application/json'];
```

#### Task 0.3: Create Type Helper Utilities
**Priority**: HIGH  
**Estimated Time**: 1 hour

**New File**: `lib/api-types.ts`

```typescript
import type { components, paths } from '@/types/api';

// Extract common types
export type User = components['schemas']['User'];
export type Lead = components['schemas']['Lead'];
export type Person = components['schemas']['Person'];
export type Organization = components['schemas']['Organization'];
export type SalesVisit = components['schemas']['SalesVisit'];

// Extract request/response types
export type LoginRequest = paths['/api/v1/login']['post']['requestBody']['content']['application/json'];
export type LoginResponse = paths['/api/v1/login']['post']['responses']['200']['content']['application/json'];

export type LeadsListResponse = paths['/api/v1/leads']['get']['responses']['200']['content']['application/json'];
export type CreateLeadRequest = paths['/api/v1/leads']['post']['requestBody']['content']['application/json'];

// JSON:API helper types
export interface JsonApiResource<T> {
  data: {
    id: string;
    type: string;
    attributes: T;
    relationships?: Record<string, any>;
  };
}

export interface JsonApiCollection<T> {
  data: Array<{
    id: string;
    type: string;
    attributes: T;
  }>;
  meta?: {
    total: number;
    page: number;
    perPage: number;
  };
  links?: {
    first?: string;
    last?: string;
    prev?: string;
    next?: string;
  };
}
```

### Phase 1: Enhanced Security & Token Management

#### Task 1.1: Update AuthService with Generated Types
**Priority**: HIGH  
**Estimated Time**: 1 hour

**File**: `services/auth-service.ts`

```typescript
import api from '@/lib/api';
import type { User, LoginRequest, LoginResponse } from '@/lib/api-types';

export class AuthService {
  static async login(credentials: LoginRequest): Promise<LoginResponse> {
    await this.csrf();
    const response = await api.post<LoginResponse>('/login', credentials);
    return response.data;
  }

  static async getCurrentUser(): Promise<User> {
    const response = await api.get<{ data: User }>('/user');
    return response.data.data;
  }

  // ... rest of methods with proper types
}
```

#### Task 1.2: Add Token Expiration Handling
**Priority**: HIGH  
**Estimated Time**: 1-2 hours

**File**: `lib/api.ts`

```typescript
import { AuthService } from '@/services/auth-service';

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      AuthService.clearSession();
      
      // Only redirect if not already on login page
      if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);
```

### Phase 2: Global Authentication State Management

#### Task 2.1: Create Auth Context Provider with Types
**Priority**: HIGH  
**Estimated Time**: 2-3 hours

**New Files**:
- `contexts/auth-context.tsx`
- `hooks/use-auth.ts`

**Implementation**:
```typescript
// contexts/auth-context.tsx
'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { AuthService } from '@/services/auth-service';
import type { User, LoginRequest } from '@/lib/api-types';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (credentials: LoginRequest) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const initAuth = async () => {
      const token = AuthService.getToken();
      if (token) {
        try {
          const userData = await AuthService.getCurrentUser();
          setUser(userData);
        } catch (error) {
          console.error('Session validation failed:', error);
          AuthService.clearSession();
        }
      }
      setLoading(false);
    };
    initAuth();
  }, []);

  const login = async (credentials: LoginRequest) => {
    const response = await AuthService.login(credentials);
    if (response.token && response.data) {
      AuthService.setSession(response.token, response.data);
      setUser(response.data);
      router.push('/');
    }
  };

  const logout = async () => {
    await AuthService.logout();
    setUser(null);
    router.push('/login');
  };

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      login,
      logout,
      isAuthenticated: !!user,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
```

**File**: `hooks/use-auth.ts`
```typescript
export { useAuth } from '@/contexts/auth-context';
```

#### Task 2.2: Implement Protected Route Wrapper
**Priority**: HIGH  
**Estimated Time**: 1 hour

**New File**: `components/auth/protected-route.tsx`

```typescript
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, loading, router]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          <p className="mt-2 text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}
```

#### Task 2.3: Update Root Layout
**Priority**: HIGH  
**Estimated Time**: 30 minutes

**File**: `app/layout.tsx`

```typescript
import { AuthProvider } from '@/contexts/auth-context';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
```

#### Task 2.4: Update Login Page to Use Context
**Priority**: HIGH  
**Estimated Time**: 30 minutes

**File**: `app/login/page.tsx`

```typescript
'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import type { LoginRequest } from '@/lib/api-types';

export default function LoginPage() {
  const { login } = useAuth();
  const [credentials, setCredentials] = useState<LoginRequest>({
    email: '',
    password: '',
    device_name: 'web-app',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(credentials);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  // ... rest of component
}
```

### Phase 3: Enhanced API Client & Error Handling

#### Task 3.1: Create Base Service Class with Type Support
**Priority**: MEDIUM  
**Estimated Time**: 2 hours

**New File**: `services/base-service.ts`

```typescript
import type { AxiosResponse } from 'axios';
import type { JsonApiResource, JsonApiCollection } from '@/lib/api-types';

export abstract class BaseService {
  protected static deserializeResource<T>(response: AxiosResponse<JsonApiResource<T>>): T {
    const { data } = response.data;
    return {
      id: data.id,
      ...data.attributes,
    } as T;
  }

  protected static deserializeCollection<T>(response: AxiosResponse<JsonApiCollection<T>>): {
    items: T[];
    meta?: JsonApiCollection<T>['meta'];
    links?: JsonApiCollection<T>['links'];
  } {
    const { data, meta, links } = response.data;
    return {
      items: data.map(item => ({
        id: item.id,
        ...item.attributes,
      } as T)),
      meta,
      links,
    };
  }

  protected static handleError(error: any): never {
    // Enhanced error handling
    if (error.response?.data?.errors) {
      // JSON:API error format
      const firstError = error.response.data.errors[0];
      throw new Error(firstError.detail || firstError.title || 'An error occurred');
    }
    throw error;
  }
}
```

#### Task 3.2: Update Services to Extend BaseService
**Priority**: MEDIUM  
**Estimated Time**: 2 hours

**File**: `services/leads-service.ts`

```typescript
import api from '@/lib/api';
import { BaseService } from './base-service';
import type { Lead, LeadsListResponse, CreateLeadRequest } from '@/lib/api-types';

export interface LeadsQueryParams {
  page?: number;
  perPage?: number;
  search?: string;
  status?: string;
}

export class LeadsService extends BaseService {
  static async getLeads(params?: LeadsQueryParams) {
    try {
      const queryString = new URLSearchParams({
        'page[number]': params?.page?.toString() || '1',
        'page[size]': params?.perPage?.toString() || '10',
        ...(params?.search && { 'filter[search]': params.search }),
        ...(params?.status && { 'filter[status]': params.status }),
      }).toString();

      const response = await api.get<LeadsListResponse>(`/leads?${queryString}`);
      return this.deserializeCollection<Lead>(response);
    } catch (error) {
      return this.handleError(error);
    }
  }

  static async createLead(data: CreateLeadRequest) {
    try {
      const response = await api.post<JsonApiResource<Lead>>('/leads', data);
      return this.deserializeResource<Lead>(response);
    } catch (error) {
      return this.handleError(error);
    }
  }
}
```

### Phase 4: Backend OpenAPI Documentation Enhancement

#### Task 4.1: Verify and Enhance Swagger Annotations
**Priority**: MEDIUM  
**Estimated Time**: 2-3 hours

**Backend Files to Review**:
- `packages/Alamia/rest-api/src/Docs/Controllers/V1/AuthController.php`
- `packages/Alamia/rest-api/src/Docs/Controllers/V1/LeadController.php`
- `packages/Alamia/rest-api/src/Docs/Controllers/V1/ContactController.php`

**Ensure Complete Annotations**:
```php
/**
 * @OA\Post(
 *     path="/api/v1/login",
 *     tags={"Authentication"},
 *     summary="User login",
 *     @OA\RequestBody(
 *         required=true,
 *         @OA\JsonContent(ref="#/components/schemas/LoginRequest")
 *     ),
 *     @OA\Response(
 *         response=200,
 *         description="Successful login",
 *         @OA\JsonContent(ref="#/components/schemas/LoginResponse")
 *     ),
 *     @OA\Response(
 *         response=401,
 *         description="Invalid credentials"
 *     )
 * )
 */
```

#### Task 4.2: Add Missing Schema Definitions
**Priority**: MEDIUM  
**Estimated Time**: 2 hours

**Backend File**: Create `packages/Alamia/rest-api/src/Docs/Schemas/`

```php
/**
 * @OA\Schema(
 *     schema="LoginRequest",
 *     required={"email", "password"},
 *     @OA\Property(property="email", type="string", format="email"),
 *     @OA\Property(property="password", type="string", format="password"),
 *     @OA\Property(property="device_name", type="string")
 * )
 */

/**
 * @OA\Schema(
 *     schema="LoginResponse",
 *     @OA\Property(property="token", type="string"),
 *     @OA\Property(property="data", ref="#/components/schemas/User"),
 *     @OA\Property(property="message", type="string")
 * )
 */

/**
 * @OA\Schema(
 *     schema="User",
 *     @OA\Property(property="id", type="integer"),
 *     @OA\Property(property="name", type="string"),
 *     @OA\Property(property="email", type="string", format="email"),
 *     @OA\Property(property="role", ref="#/components/schemas/Role")
 * )
 */
```

#### Task 4.3: Regenerate Swagger Documentation
**Priority**: MEDIUM  
**Estimated Time**: 15 minutes

```bash
cd AlamiaConnect-Backend
php artisan l5-swagger:generate
```

Then regenerate frontend types:
```bash
cd ../AlamiaConnectKTD-nextjs
pnpm generate:api
```

## Testing Plan

### Unit Tests
1. AuthService methods with type validation
2. BaseService deserialization
3. API interceptors
4. Type helper utilities

### Integration Tests
1. Login flow end-to-end with types
2. Protected route access
3. Token expiration handling
4. Type generation from OpenAPI spec

### Manual Testing Checklist
- [ ] Generate types from Swagger
- [ ] Verify type imports work
- [ ] Login with valid credentials
- [ ] Login with invalid credentials
- [ ] Access protected route without auth
- [ ] Token expiration handling
- [ ] Logout functionality
- [ ] Page refresh maintains session
- [ ] Type safety in IDE (autocomplete)

## Implementation Order

### Week 1: Type Safety Foundation + Core Auth
**Day 1**:
- Task 0.1: Install OpenAPI generator (30min)
- Task 0.2: Generate initial types (15min)
- Task 0.3: Create type helpers (1hr)
- Task 1.1: Update AuthService with types (1hr)

**Day 2-3**:
- Task 1.2: Token expiration handling (2hrs)
- Task 2.1: Auth Context Provider (3hrs)

**Day 3**:
- Task 2.2: Protected Route Wrapper (1hr)
- Task 2.3: Update Root Layout (30min)
- Task 2.4: Update Login Page (30min)

**Day 4**:
- Testing & bug fixes
- Documentation

### Week 2: Enhanced Features
**Day 1-2**:
- Task 3.1: Base Service Class (2hrs)
- Task 3.2: Update all services (2hrs)

**Day 3-4**:
- Task 4.1: Review Swagger annotations (3hrs)
- Task 4.2: Add missing schemas (2hrs)
- Task 4.3: Regenerate docs (15min)

**Day 5**:
- Integration testing
- Performance optimization
- Documentation updates

## Success Criteria

1. **Type Safety**: All API calls have compile-time type checking
2. **Security**: Tokens stored securely with expiration handling
3. **UX**: Smooth authentication flow with loading states
4. **Reliability**: Automatic type regeneration from OpenAPI spec
5. **Maintainability**: Centralized auth logic, easy to test
6. **Performance**: Fast initial auth check, no unnecessary API calls
7. **Developer Experience**: IDE autocomplete for all API types

## Documentation Updates

### Files to Create/Update:
- `docs/type-generation.md` - Guide for regenerating types
- `docs/api-integration-guide.md` - How to use typed services
- `README.md` - Add type generation to setup instructions

### README Addition:
```markdown
## Type Safety

This project uses OpenAPI-generated TypeScript types for full type safety.

### Regenerate Types
```bash
# Ensure backend is running
cd AlamiaConnect-Backend && php artisan serve

# Generate types
cd ../AlamiaConnectKTD-nextjs
pnpm generate:api
```

Types are automatically regenerated during development with `pnpm dev`.
```

## Next Steps

1. Review this updated plan
2. Start with Phase 0 (OpenAPI setup)
3. Proceed to Phase 1 & 2 (Auth with types)
4. Enhance backend Swagger docs (Phase 4)
5. Complete all services with type safety

## Questions for Review

1. Should we commit generated `types/api.d.ts` to git or regenerate on each dev setup?
2. Do you want automatic type regeneration in watch mode during development?
3. Should we add type validation tests (e.g., with ts-expect-error)?
4. Any specific OpenAPI schemas that need immediate attention?
