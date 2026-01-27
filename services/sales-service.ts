import { BaseService, type QueryParams } from './base-service';

export interface SalesInvoice {
    id: number | string;
    invoice_number: string;
    customer_name: string;
    machineryCategory?: string;
    total_amount: number | string;
    commissionStatus?: string;
    date?: string;
    sales_manager?: string;
}

/**
 * Service for managing sales invoices
 */
export class SalesService extends BaseService {
    private static readonly ENDPOINT = '/sales-invoices';

    /**
     * Get paginated list of sales invoices
     */
    static async getInvoices(params?: QueryParams) {
        try {
            return await this.getCollection<SalesInvoice>(this.ENDPOINT, params);
        } catch (error) {
            return this.handleError(error);
        }
    }

    /**
     * Get a single invoice by ID
     */
    static async getInvoice(id: number | string) {
        try {
            return await this.getSingle<SalesInvoice>(`${this.ENDPOINT}/${id}`);
        } catch (error) {
            return this.handleError(error);
        }
    }

    /**
     * Delete an invoice
     */
    static async deleteInvoice(id: number | string) {
        try {
            return await this.delete(`${this.ENDPOINT}/${id}`);
        } catch (error) {
            return this.handleError(error);
        }
    }
}
