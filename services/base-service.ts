import api from '@/lib/api';
import axios from 'axios';
import { deserialize, type JsonApiResponse } from '@/lib/json-api';
// Remove local interfaces that are redundant if we use lib/json-api or just keep them for type safety? 
// Actually, keep local interfaces for explicit exports if needed, or better, re-export or use generics.

/**
 * JSON:API Resource structure
 */
export interface JsonApiResource<T> {
    type: string;
    id: string;
    attributes: T;
    relationships?: Record<string, {
        data: { type: string; id: string } | Array<{ type: string; id: string }>;
    }>;
    links?: {
        self: string;
    };
}

/**
 * JSON:API Collection response
 */
export interface JsonApiCollectionResponse<T> {
    data: Array<JsonApiResource<T>>;
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
    included?: Array<JsonApiResource<any>>;
}

/**
 * JSON:API Single resource response
 */
export interface JsonApiSingleResponse<T> {
    data: JsonApiResource<T>;
    included?: Array<JsonApiResource<any>>;
}

/**
 * Pagination parameters
 */
export interface PaginationParams {
    page?: number;
    perPage?: number;
}

/**
 * Filter parameters
 */
export interface FilterParams {
    search?: string;
    [key: string]: string | number | boolean | undefined;
}

/**
 * Sort parameters
 */
export interface SortParams {
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}

/**
 * Combined query parameters
 */
export interface QueryParams extends PaginationParams, FilterParams, SortParams { }

/**
 * Base Service class for API interactions
 * Provides JSON:API deserialization and common CRUD operations
 */
export class BaseService {
    /**
     * Build query string from parameters
     */
    protected static buildQueryString(params?: QueryParams): string {
        if (!params) return '';

        const queryParams = new URLSearchParams();

        if (params.page) queryParams.append('page', params.page.toString());
        if (params.perPage) queryParams.append('limit', params.perPage.toString()); // Map perPage to limit for backend
        if (params.sortBy) queryParams.append('sortBy', params.sortBy);
        if (params.sortOrder) queryParams.append('sortOrder', params.sortOrder);
        if (params.search) queryParams.append('search', params.search);

        // Add any additional filter parameters
        Object.entries(params).forEach(([key, value]) => {
            if (
                value !== undefined &&
                !['page', 'perPage', 'sortBy', 'sortOrder', 'search'].includes(key)
            ) {
                queryParams.append(key, String(value));
            }
        });

        const queryString = queryParams.toString();
        return queryString ? `?${queryString}` : '';
    }

    /**
     * Generic GET request for collections
     */
    protected static async getCollection<T>(
        endpoint: string,
        params?: QueryParams
    ): Promise<{
        data: Array<T & { id: string }>; // deserialize returns id as string usually, or whatever is in resource.id
        meta?: JsonApiCollectionResponse<T>['meta'];
        links?: JsonApiCollectionResponse<T>['links'];
    }> {
        const queryString = this.buildQueryString(params);
        const response = await api.get<JsonApiResponse>(`${endpoint}${queryString}`);

        // Use the robust deserializer that handles included relationships
        const data = deserialize<Array<T & { id: string }>>(response.data);

        return {
            data,
            meta: response.data.meta,
            links: response.data.links,
        };
    }

    /**
     * Generic GET request for single resource
     */
    protected static async getSingle<T>(endpoint: string, params?: QueryParams): Promise<T & { id: string }> {
        const queryString = this.buildQueryString(params);
        const response = await api.get<JsonApiResponse>(`${endpoint}${queryString}`);
        return deserialize<T & { id: string }>(response.data);
    }

    /**
     * Generic POST request
     */
    protected static async post<T, D = any>(
        endpoint: string,
        data: D
    ): Promise<T & { id: string }> {
        const response = await api.post<JsonApiResponse>(endpoint, data);
        return deserialize<T & { id: string }>(response.data);
    }

    /**
     * Generic PUT request
     */
    protected static async put<T, D = any>(
        endpoint: string,
        data: D
    ): Promise<T & { id: string }> {
        const response = await api.put<JsonApiResponse>(endpoint, data);
        return deserialize<T & { id: string }>(response.data);
    }

    /**
     * Generic DELETE request
     */
    protected static async delete(endpoint: string): Promise<void> {
        await api.delete(endpoint);
    }

    /**
     * Handle API errors consistently
     */
    public static handleError(error: any): never {
        if (axios.isAxiosError(error)) {
            if (error.code === 'ERR_NETWORK' || error.code === 'ERR_CONNECTION_REFUSED') {
                throw new Error('Unable to connect to the server. Please ensure the backend is running and you are connected to the network.');
            }
            if (error.response) {
                // Server responded with error
                const message = error.response.data?.message || error.response.data?.errors?.[0]?.detail || 'An error occurred';
                throw new Error(message);
            } else if (error.request) {
                // Request made but no response
                throw new Error('No response from server. Please check your connection.');
            }
        }

        // Fallback for non-axios errors or unhandled cases
        throw new Error(error.message || 'An unexpected error occurred');
    }
}
