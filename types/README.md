# Auto-generated API Types

This directory contains TypeScript type definitions automatically generated from the backend OpenAPI specification.

## Setup

Before using the types, you need to:

1. Install the dependency:
```bash
pnpm install
```

2. Generate the types:
```bash
pnpm generate:api
```

This will create `api.d.ts` in this directory.

## Usage

Import types in your code:

```typescript
import type { components, paths } from '@/types/api';
// Or use the helper exports
import type { User, Lead, LoginRequest } from '@/lib/api-types';
```

## Regeneration

Types are automatically regenerated when:
- Backend API changes
- You run `pnpm generate:api` manually
- Development server is running with watch mode

## Files

- `api.d.ts` - Auto-generated (do not edit manually)
- `.gitignore` - Excludes generated files from git (optional)
