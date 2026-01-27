import type { components, paths } from '@/types/api';

// Extract common entity types
export type User = components['schemas']['User'];
export type Lead = components['schemas']['Lead'];
export type Person = components['schemas']['Person'];
export type Organization = components['schemas']['Organization'];
// export type SalesVisit = components['schemas']['SalesVisit'];
export type Product = components['schemas']['Product'];
export type Quote = components['schemas']['Quote'];
export type Activity = components['schemas']['Activity'];

// Extract request/response types for Authentication
// export type LoginRequest = paths['/api/v1/login']['post']['requestBody']['content']['application/json'];
export type LoginResponse = paths['/api/v1/login']['post']['responses']['200']['content']['application/json'];

// Extract request/response types for Leads
export type LeadsListResponse = paths['/api/v1/leads']['get']['responses']['200']['content']['application/json'];
export type LeadDetailResponse = paths['/api/v1/leads/{id}']['get']['responses']['200']['content']['application/json'];
export type CreateLeadRequest = paths['/api/v1/leads']['post']['requestBody']['content']['application/json'];
export type UpdateLeadRequest = paths['/api/v1/leads/{id}']['put']['requestBody']['content']['application/json'];

// Extract request/response types for Contacts
export type PersonsListResponse = paths['/api/v1/contacts/persons']['get']['responses']['200']['content']['application/json'];
export type CreatePersonRequest = paths['/api/v1/contacts/persons']['post']['requestBody']['content']['application/json'];
export type UpdatePersonRequest = paths['/api/v1/contacts/persons/{id}']['put']['requestBody']['content']['application/json'];

export type OrganizationsListResponse = paths['/api/v1/contacts/organizations']['get']['responses']['200']['content']['application/json'];
export type CreateOrganizationRequest = paths['/api/v1/contacts/organizations']['post']['requestBody']['content']['application/json'];
export type UpdateOrganizationRequest = paths['/api/v1/contacts/organizations/{id}']['put']['requestBody']['content']['application/json'];

// Extract request/response types for Products
export type ProductsListResponse = paths['/api/v1/products']['get']['responses']['200']['content']['application/json'];
export type ProductDetailResponse = paths['/api/v1/products/{id}']['get']['responses']['200']['content']['application/json'];
export type CreateProductRequest = paths['/api/v1/products']['post']['requestBody']['content']['application/json'];
export type UpdateProductRequest = paths['/api/v1/products/{id}']['put']['requestBody']['content']['application/json'];

// Extract request/response types for Sales Visits
// export type SalesVisitsListResponse = paths['/api/v1/sales-visits']['get']['responses']['200']['content']['application/json'];
// export type CreateSalesVisitRequest = paths['/api/v1/sales-visits']['post']['requestBody']['content']['application/json'];

// JSON:API helper types for resource wrapping
export interface JsonApiResource<T> {
    data: {
        id: string;
        type: string;
        attributes: T;
        relationships?: Record<string, {
            data: { id: string; type: string } | Array<{ id: string; type: string }>;
        }>;
    };
    included?: Array<{
        id: string;
        type: string;
        attributes: any;
    }>;
}

// JSON:API helper types for collection responses
export interface JsonApiCollection<T> {
    data: Array<{
        id: string;
        type: string;
        attributes: T;
        relationships?: Record<string, {
            data: { id: string; type: string } | Array<{ id: string; type: string }>;
        }>;
    }>;
    meta?: {
        total?: number;
        page?: number;
        perPage?: number;
        lastPage?: number;
        from?: number;
        to?: number;
    };
    links?: {
        first?: string;
        last?: string;
        prev?: string | null;
        next?: string | null;
        self?: string;
    };
    included?: Array<{
        id: string;
        type: string;
        attributes: any;
    }>;
}

// JSON:API error response type
export interface JsonApiError {
    errors: Array<{
        id?: string;
        status?: string;
        code?: string;
        title?: string;
        detail?: string;
        source?: {
            pointer?: string;
            parameter?: string;
        };
        meta?: Record<string, any>;
    }>;
}

// Pagination parameters for JSON:API
export interface PaginationParams {
    page?: number;
    perPage?: number;
}

// Filter parameters (generic)
export interface FilterParams {
    search?: string;
    [key: string]: string | number | boolean | undefined;
}

// Sort parameters for JSON:API
export interface SortParams {
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}

// Combined query parameters
export interface QueryParams extends PaginationParams, FilterParams, SortParams { }
