# Type Safety Implementation Plan - OpenAPI Approach

## Why Not Laravel Wayfinder?

### Incompatibility Reasons:
1. **Inertia.js Dependency**: Wayfinder is designed for Inertia.js apps, not standalone Next.js
2. **Monolithic Architecture**: Expects frontend served by Laravel (same domain)
3. **JSON:API Mismatch**: Doesn't support JSON:API standard responses
4. **Existing Service Layer**: Would require complete rewrite of current Axios services

## Recommended Approach: OpenAPI + TypeScript Code Generation

### Advantages:
- Leverages existing Swagger/OpenAPI documentation
- Works with JSON:API standard
- Compatible with decoupled architecture
- No backend changes required
- Generates types from actual API spec

## Implementation Plan

### Phase 1: Setup OpenAPI TypeScript Generator

#### Step 1.1: Install Dependencies
```bash
cd AlamiaConnectKTD-nextjs
pnpm add -D openapi-typescript-codegen
# or
pnpm add -D openapi-typescript
```

#### Step 1.2: Generate TypeScript Types
```bash
# Option A: Full client generation (includes API functions)
npx openapi-typescript-codegen \
  --input http://localhost:8000/api/documentation/json \
  --output ./src/generated/api \
  --client axios

# Option B: Types only (lighter, more control)
npx openapi-typescript \
  http://localhost:8000/api/documentation/json \
  --output ./src/types/api.d.ts
```

#### Step 1.3: Add to package.json Scripts
```json
{
  "scripts": {
    "generate:api": "openapi-typescript http://localhost:8000/api/documentation/json -o ./src/types/api.d.ts",
    "generate:api:watch": "openapi-typescript http://localhost:8000/api/documentation/json -o ./src/types/api.d.ts --watch"
  }
}
```

### Phase 2: Update Service Layer with Generated Types

#### Step 2.1: Update AuthService
```typescript
// services/auth-service.ts
import type { components, paths } from '@/types/api';

type LoginRequest = components['schemas']['LoginRequest'];
type LoginResponse = paths['/api/v1/login']['post']['responses']['200']['content']['application/json'];
type User = components['schemas']['User'];

export class AuthService {
  static async login(credentials: LoginRequest): Promise<LoginResponse> {
    const response = await api.post<LoginResponse>('/login', credentials);
    return response.data;
  }

  static async getCurrentUser(): Promise<User> {
    const response = await api.get<User>('/user');
    return response.data;
  }
}
```

#### Step 2.2: Update LeadsService
```typescript
// services/leads-service.ts
import type { components, paths } from '@/types/api';

type Lead = components['schemas']['Lead'];
type LeadsResponse = paths['/api/v1/leads']['get']['responses']['200']['content']['application/json'];
type CreateLeadRequest = components['schemas']['CreateLeadRequest'];

export class LeadsService {
  static async getLeads(params?: LeadsQueryParams): Promise<LeadsResponse> {
    const response = await api.get<LeadsResponse>('/leads', { params });
    return response.data;
  }

  static async createLead(data: CreateLeadRequest): Promise<Lead> {
    const response = await api.post<Lead>('/leads', data);
    return response.data;
  }
}
```

### Phase 3: Enhance Backend OpenAPI Documentation

#### Step 3.1: Ensure Complete Swagger Annotations

**File**: `packages/Alamia/rest-api/src/Docs/Controllers/V1/AuthController.php`

```php
/**
 * @OA\Post(
 *     path="/api/v1/login",
 *     tags={"Authentication"},
 *     summary="User login",
 *     @OA\RequestBody(
 *         required=true,
 *         @OA\JsonContent(
 *             required={"email","password"},
 *             @OA\Property(property="email", type="string", format="email", example="admin@example.com"),
 *             @OA\Property(property="password", type="string", format="password", example="admin123"),
 *             @OA\Property(property="device_name", type="string", example="web-app")
 *         )
 *     ),
 *     @OA\Response(
 *         response=200,
 *         description="Successful login",
 *         @OA\JsonContent(
 *             @OA\Property(property="token", type="string"),
 *             @OA\Property(property="data", ref="#/components/schemas/User"),
 *             @OA\Property(property="message", type="string")
 *         )
 *     )
 * )
 */
public function login(Request $request) { }
```

#### Step 3.2: Define Reusable Schemas

```php
/**
 * @OA\Schema(
 *     schema="User",
 *     type="object",
 *     @OA\Property(property="id", type="integer"),
 *     @OA\Property(property="name", type="string"),
 *     @OA\Property(property="email", type="string", format="email"),
 *     @OA\Property(property="role", ref="#/components/schemas/Role")
 * )
 */

/**
 * @OA\Schema(
 *     schema="Lead",
 *     type="object",
 *     @OA\Property(property="id", type="integer"),
 *     @OA\Property(property="title", type="string"),
 *     @OA\Property(property="status", type="string"),
 *     @OA\Property(property="person", ref="#/components/schemas/Person")
 * )
 */
```

### Phase 4: Automated Type Generation Workflow

#### Step 4.1: Create Watch Script

**File**: `scripts/generate-types.sh`

```bash
#!/bin/bash
# Wait for backend to be ready
while ! curl -s http://localhost:8000/api/documentation/json > /dev/null; do
  echo "Waiting for backend..."
  sleep 2
done

# Generate types
pnpm generate:api
echo "API types generated successfully!"
```

#### Step 4.2: Integrate with Development Workflow

```json
// package.json
{
  "scripts": {
    "dev": "concurrently \"pnpm:dev:next\" \"pnpm:generate:api:watch\"",
    "dev:next": "next dev",
    "generate:api:watch": "nodemon --watch ../AlamiaConnect-Backend/storage/api-docs --exec pnpm generate:api"
  }
}
```

## Comparison: Wayfinder vs OpenAPI

| Feature | Wayfinder | OpenAPI + Codegen |
|---------|-----------|-------------------|
| Architecture | Inertia.js monolith | Any REST API |
| Setup Complexity | Low (if using Inertia) | Medium |
| Type Safety | Excellent | Excellent |
| JSON:API Support | No | Yes |
| Existing Integration | None | Already have Swagger |
| Learning Curve | Low | Low |
| Maintenance | Automatic | Semi-automatic |
| Decoupled Apps | No | Yes |

## Alternative: Manual Type Definitions (Current Approach)

If code generation seems too complex, continue with manual types but enhance them:

```typescript
// types/api.ts
export namespace API {
  export interface User {
    id: string;
    name: string;
    email: string;
    role?: Role;
  }

  export interface LoginRequest {
    email: string;
    password: string;
    device_name?: string;
  }

  export interface LoginResponse {
    token: string;
    data: User;
    message: string;
  }

  export interface Lead {
    id: string;
    title: string;
    status: LeadStatus;
    person?: Person;
  }

  export type LeadStatus = 'new' | 'contacted' | 'qualified' | 'lost' | 'won';
}
```

## Recommendation

**For Alamia Connect, use OpenAPI + TypeScript Code Generation**

### Reasons:
1. You already have Swagger documentation
2. Works with your JSON:API standard
3. Compatible with decoupled architecture
4. No backend refactoring required
5. Industry-standard approach

### Implementation Priority:
1. **Week 1**: Set up openapi-typescript, generate initial types
2. **Week 2**: Update auth-service and leads-service with types
3. **Week 3**: Add automated regeneration to dev workflow
4. **Week 4**: Complete all services with type safety

## Next Steps

1. Review this plan
2. Decide: Code generation vs manual types
3. If code generation: Start with Phase 1
4. If manual: Enhance current type definitions
5. Document chosen approach in README

## Questions

1. Do you want full client generation or types only?
2. Should we automate type regeneration in dev workflow?
3. Any specific OpenAPI features you want to leverage?
