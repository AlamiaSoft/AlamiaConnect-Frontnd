import { BaseService, type QueryParams } from './base-service';
import type { Lead, CreateLeadRequest, UpdateLeadRequest } from '@/lib/api-types';

/**
 * Lead-specific query parameters
 */
export interface LeadQueryParams extends QueryParams {
    status?: string;
    source?: string;
    type?: string;
    user_id?: number;
}

/**
 * Service for managing leads
 */
export class LeadsService extends BaseService {
    private static readonly ENDPOINT = '/leads';

    /**
     * Get paginated list of leads
     */
    static async getLeads(params?: LeadQueryParams) {
        try {
            return await this.getCollection<Lead>(this.ENDPOINT, params);
        } catch (error) {
            return this.handleError(error);
        }
    }

    /**
     * Get a single lead by ID
     */
    static async getLead(id: number | string) {
        try {
            return await this.getSingle<Lead>(`${this.ENDPOINT}/${id}`);
        } catch (error) {
            return this.handleError(error);
        }
    }

    /**
     * Create a new lead
     */
    static async createLead(data: CreateLeadRequest) {
        try {
            return await this.post<Lead, CreateLeadRequest>(this.ENDPOINT, data);
        } catch (error) {
            return this.handleError(error);
        }
    }

    /**
     * Update an existing lead
     */
    static async updateLead(id: number | string, data: UpdateLeadRequest) {
        try {
            return await this.put<Lead, UpdateLeadRequest>(`${this.ENDPOINT}/${id}`, data);
        } catch (error) {
            return this.handleError(error);
        }
    }

    /**
     * Delete a lead
     */
    static async deleteLead(id: number | string) {
        try {
            return await this.delete(`${this.ENDPOINT}/${id}`);
        } catch (error) {
            return this.handleError(error);
        }
    }

    /**
     * Search leads by query
     */
    static async searchLeads(query: string, params?: QueryParams) {
        try {
            return await this.getCollection<Lead>(
                `${this.ENDPOINT}/search`,
                { ...params, search: query }
            );
        } catch (error) {
            return this.handleError(error);
        }
    }

    /**
     * Get leads by status
     */
    static async getLeadsByStatus(status: string, params?: QueryParams) {
        try {
            return await this.getCollection<Lead>(
                this.ENDPOINT,
                { ...params, status }
            );
        } catch (error) {
            return this.handleError(error);
        }
    }

    /**
     * Get leads assigned to a specific user
     */
    static async getLeadsByUser(userId: number, params?: QueryParams) {
        try {
            return await this.getCollection<Lead>(
                this.ENDPOINT,
                { ...params, user_id: userId }
            );
        } catch (error) {
            return this.handleError(error);
        }
    }

    /**
     * Get activities for a specific lead
     */
    static async getActivities(leadId: number | string) {
        try {
            return await this.getCollection<any>(
                `${this.ENDPOINT}/${leadId}/activities`
            );
        } catch (error) {
            return this.handleError(error);
        }
    }

    /**
     * Get leads grouped by stages for Kanban view
     */
    static async getLeadsGroups(pipelineId?: number | string) {
        try {
            const url = pipelineId ? `${this.ENDPOINT}/get/${pipelineId}` : `${this.ENDPOINT}/get`;
            // This endpoint returns a custom structure, not standard JSON:API
            return await this.getSingle<any>(url);
        } catch (error) {
            return this.handleError(error);
        }
    }
}
