# Temporary Type Overrides for JSON:API Responses

## Purpose
This file contains temporary type overrides to handle the mismatch between:
- **Actual API responses**: JSON:API compliant with proper structure
- **OpenAPI spec**: Not yet updated to reflect JSON:API format

## Status
**TEMPORARY** - Remove this file after backend Swagger annotations are updated.

See: `AlamiaConnect-Backend/docs/TODO-swagger-jsonapi-update.md`

---

## Actual Response Structures

### Login Response (Actual)
```typescript
export interface ActualLoginResponse {
  data: {
    data: {
      type: 'users';
      id: string;
      attributes: {
        name: string;
        email: string;
        status: number;
        view_permission: string;
        role_id: number;
        created_at: string;
        updated_at: string;
        image: string | null;
        image_url: string | null;
      };
      links: {
        self: string;
      };
    };
  };
  message: string;
  token: string;
}
```

### Get Current User Response (Actual)
```typescript
export interface ActualGetUserResponse {
  data: {
    type: 'users';
    id: string;
    attributes: {
      name: string;
      email: string;
      status: number;
      view_permission: string;
      role_id: number;
      created_at: string;
      updated_at: string;
      image: string | null;
      image_url: string | null;
    };
    links: {
      self: string;
    };
  };
}
```

### Leads List Response (Actual)
```typescript
export interface ActualLeadsListResponse {
  data: Array<{
    type: 'leads';
    id: string;
    attributes: {
      title: string;
      status: string;
      lead_value: number;
      // ... other lead attributes
    };
    relationships?: {
      person?: {
        data: { type: 'persons'; id: string };
      };
      // ... other relationships
    };
    links: {
      self: string;
    };
  }>;
  meta?: {
    total: number;
    page: number;
    perPage: number;
  };
  links?: {
    first: string;
    last: string;
    prev: string | null;
    next: string | null;
  };
}
```

---

## Usage in Services

### AuthService Example

```typescript
import type { ActualLoginResponse, ActualGetUserResponse } from '@/lib/api-types-actual';

export class AuthService {
  static async login(credentials: LoginCredentials): Promise<ActualLoginResponse> {
    const response = await api.post<ActualLoginResponse>('/login', credentials);
    return response.data;
  }

  static async getCurrentUser(): Promise<User> {
    const response = await api.get<ActualGetUserResponse>('/get');
    // Extract user from JSON:API structure
    return {
      id: response.data.data.id,
      ...response.data.data.attributes,
    };
  }
}
```

---

## Migration Plan

### When Backend is Updated:
1. Backend team updates Swagger annotations
2. Run `php artisan l5-swagger:generate`
3. Run `pnpm generate:api` in frontend
4. Remove this file (`lib/api-types-actual.ts`)
5. Update services to use generated types from `@/types/api`
6. Remove manual type overrides

---

## Notes

- These types are based on actual API responses as of 2026-01-12
- Keep this file in sync with actual responses if they change
- This is technical debt - prioritize backend Swagger update
