import { BaseService, type QueryParams } from './base-service';
import type { Product, CreateProductRequest, UpdateProductRequest } from '@/lib/api-types';

/**
 * Service for managing products
 */
export class ProductsService extends BaseService {
    private static readonly ENDPOINT = '/products';

    /**
     * Get paginated list of products
     */
    static async getProducts(params?: QueryParams) {
        try {
            return await this.getCollection<Product>(this.ENDPOINT, params);
        } catch (error) {
            return this.handleError(error);
        }
    }

    /**
     * Get a single product by ID
     */
    static async getProduct(id: number | string) {
        try {
            return await this.getSingle<Product>(`${this.ENDPOINT}/${id}`);
        } catch (error) {
            return this.handleError(error);
        }
    }

    /**
     * Create a new product
     */
    static async createProduct(data: CreateProductRequest) {
        try {
            return await this.post<Product, CreateProductRequest>(this.ENDPOINT, data);
        } catch (error) {
            return this.handleError(error);
        }
    }

    /**
     * Update an existing product
     */
    static async updateProduct(id: number | string, data: UpdateProductRequest) {
        try {
            return await this.put<Product, UpdateProductRequest>(`${this.ENDPOINT}/${id}`, data);
        } catch (error) {
            return this.handleError(error);
        }
    }

    /**
     * Delete a product
     */
    static async deleteProduct(id: number | string) {
        try {
            return await this.delete(`${this.ENDPOINT}/${id}`);
        } catch (error) {
            return this.handleError(error);
        }
    }

    /**
     * Search products by query
     */
    static async searchProducts(query: string, params?: QueryParams) {
        try {
            return await this.getCollection<Product>(
                `${this.ENDPOINT}/search`,
                { ...params, search: query }
            );
        } catch (error) {
            return this.handleError(error);
        }
    }
}
