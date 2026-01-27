import api from '@/lib/api';
import { deserialize } from '@/lib/json-api';

export interface SalesVisit {
    id: string;
    type: string;
    [key: string]: any;
}

export class VisitsService {
    static async getVisits(params: { page?: number; sort?: string; filter?: any } = {}) {
        // URL based on sales-visit-routes.php prefix 'sales-visits'
        const query = new URLSearchParams();
        if (params.page) query.append('page', params.page.toString());

        // Example: include relations if backend supports it
        // query.append('include', 'user,customer');

        const response = await api.get(`/sales-visits?${query.toString()}`);
        return deserialize<SalesVisit[]>(response.data);
    }

    static async getVisit(id: string) {
        const response = await api.get(`/sales-visits/${id}`);
        return deserialize<SalesVisit>(response.data);
    }

    static async createVisit(data: any) {
        const response = await api.post('/sales-visits', data);
        return deserialize<SalesVisit>(response.data);
    }

    static async updateVisit(id: string, data: any) {
        const response = await api.put(`/sales-visits/${id}`, data);
        return deserialize<SalesVisit>(response.data);
    }
}
