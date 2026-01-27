import { BaseService, type QueryParams } from './base-service';
import type {
    Person,
    Organization,
    CreatePersonRequest,
    UpdatePersonRequest,
    CreateOrganizationRequest,
    UpdateOrganizationRequest
} from '@/lib/api-types';

/**
 * Service for managing contact persons
 */
export class PersonsService extends BaseService {
    private static readonly ENDPOINT = '/contacts/persons';

    /**
     * Get paginated list of persons
     */
    static async getPersons(params?: QueryParams) {
        try {
            return await this.getCollection<Person>(this.ENDPOINT, params);
        } catch (error) {
            return this.handleError(error);
        }
    }

    /**
     * Get a single person by ID
     */
    static async getPerson(id: number | string) {
        try {
            return await this.getSingle<Person>(`${this.ENDPOINT}/${id}`);
        } catch (error) {
            return this.handleError(error);
        }
    }

    /**
     * Create a new person
     */
    static async createPerson(data: CreatePersonRequest) {
        try {
            return await this.post<Person, CreatePersonRequest>(this.ENDPOINT, data);
        } catch (error) {
            return this.handleError(error);
        }
    }

    /**
     * Update an existing person
     */
    static async updatePerson(id: number | string, data: UpdatePersonRequest) {
        try {
            return await this.put<Person, UpdatePersonRequest>(`${this.ENDPOINT}/${id}`, data);
        } catch (error) {
            return this.handleError(error);
        }
    }

    /**
     * Delete a person
     */
    static async deletePerson(id: number | string) {
        try {
            return await this.delete(`${this.ENDPOINT}/${id}`);
        } catch (error) {
            return this.handleError(error);
        }
    }

    /**
     * Search persons by query
     */
    static async searchPersons(query: string, params?: QueryParams) {
        try {
            return await this.getCollection<Person>(
                `${this.ENDPOINT}/search`,
                { ...params, search: query }
            );
        } catch (error) {
            return this.handleError(error);
        }
    }
}

/**
 * Service for managing organizations
 */
export class OrganizationsService extends BaseService {
    private static readonly ENDPOINT = '/contacts/organizations';

    /**
     * Get paginated list of organizations
     */
    static async getOrganizations(params?: QueryParams) {
        try {
            return await this.getCollection<Organization>(this.ENDPOINT, params);
        } catch (error) {
            return this.handleError(error);
        }
    }

    /**
     * Get a single organization by ID
     */
    static async getOrganization(id: number | string) {
        try {
            return await this.getSingle<Organization>(`${this.ENDPOINT}/${id}`);
        } catch (error) {
            return this.handleError(error);
        }
    }

    /**
     * Create a new organization
     */
    static async createOrganization(data: CreateOrganizationRequest) {
        try {
            return await this.post<Organization, CreateOrganizationRequest>(this.ENDPOINT, data);
        } catch (error) {
            return this.handleError(error);
        }
    }

    /**
     * Update an existing organization
     */
    static async updateOrganization(id: number | string, data: UpdateOrganizationRequest) {
        try {
            return await this.put<Organization, UpdateOrganizationRequest>(`${this.ENDPOINT}/${id}`, data);
        } catch (error) {
            return this.handleError(error);
        }
    }

    /**
     * Delete an organization
     */
    static async deleteOrganization(id: number | string) {
        try {
            return await this.delete(`${this.ENDPOINT}/${id}`);
        } catch (error) {
            return this.handleError(error);
        }
    }

    /**
     * Search organizations by query
     */
    static async searchOrganizations(query: string, params?: QueryParams) {
        try {
            return await this.getCollection<Organization>(
                `${this.ENDPOINT}/search`,
                { ...params, search: query }
            );
        } catch (error) {
            return this.handleError(error);
        }
    }
}

// Export both services
export const ContactsService = {
    Persons: PersonsService,
    Organizations: OrganizationsService,
};
