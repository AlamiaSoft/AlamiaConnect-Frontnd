import { BaseService } from './base-service';
import type {
    Quote,
    QuoteFormData,
    QuoteListParams,
    QuoteCalculation,
    QuoteItem,
} from '@/types/quote';

/**
 * QuoteService
 * 
 * Handles all Quote-related API operations including CRUD,
 * financial calculations, and business logic.
 */
class QuoteService extends BaseService {
    /**
     * Get paginated list of quotes with optional filtering
     */
    async getQuotes(params?: QuoteListParams) {
        const response = await this.get<Quote[]>('/quotes', { params });
        return this.deserializeList(response.data);
    }

    /**
     * Get a single quote by ID with all relationships
     */
    async getQuote(id: number, include?: string[]) {
        const params = include ? { include: include.join(',') } : undefined;
        const response = await this.get<Quote>(`/quotes/${id}`, { params });
        return this.deserializeSingle(response.data);
    }

    /**
     * Create a new quote
     */
    async createQuote(data: QuoteFormData) {
        const payload = this.prepareQuotePayload(data);
        const response = await this.post<Quote>('/quotes', payload);
        return this.deserializeSingle(response.data);
    }

    /**
     * Update an existing quote
     */
    async updateQuote(id: number, data: QuoteFormData) {
        const payload = this.prepareQuotePayload(data);
        const response = await this.put<Quote>(`/quotes/${id}`, payload);
        return this.deserializeSingle(response.data);
    }

    /**
     * Delete a quote
     */
    async deleteQuote(id: number) {
        await this.delete(`/quotes/${id}`);
    }

    /**
     * Mass delete quotes
     */
    async massDeleteQuotes(ids: number[]) {
        await this.post('/quotes/mass-destroy', { indices: ids });
    }

    /**
     * Search quotes by keyword
     */
    async searchQuotes(query: string, limit = 10) {
        const response = await this.get<Quote[]>('/quotes/search', {
            params: { search: query, limit },
        });
        return this.deserializeList(response.data);
    }

    /**
     * Download quote as PDF
     */
    async downloadQuotePdf(id: number): Promise<Blob> {
        const response = await this.get(`/quotes/${id}/pdf`, {
            responseType: 'blob',
        });
        return response.data;
    }

    /**
     * Convert quote to invoice
     */
    async convertToInvoice(id: number) {
        const response = await this.post(`/quotes/${id}/convert-to-invoice`);
        return this.deserializeSingle(response.data);
    }

    /**
     * Send quote to customer via email
     */
    async sendQuote(id: number, emailData?: { to?: string; cc?: string; message?: string }) {
        const response = await this.post(`/quotes/${id}/send`, emailData);
        return response.data;
    }

    // ============================================================
    // CALCULATION HELPERS
    // ============================================================

    /**
     * Calculate line item total
     */
    calculateLineTotal(item: QuoteItem): number {
        const baseTotal = item.quantity * item.price;
        const discount = item.discount_percent
            ? (baseTotal * item.discount_percent) / 100
            : 0;
        return baseTotal - discount;
    }

    /**
     * Calculate subtotal from all line items
     */
    calculateSubtotal(items: QuoteItem[]): number {
        return items.reduce((sum, item) => sum + this.calculateLineTotal(item), 0);
    }

    /**
     * Apply discount to subtotal
     */
    applyDiscount(subtotal: number, discountPercent?: number, discountAmount?: number): number {
        if (discountAmount) {
            return discountAmount;
        }
        if (discountPercent) {
            return (subtotal * discountPercent) / 100;
        }
        return 0;
    }

    /**
     * Calculate tax amount
     */
    calculateTax(subtotal: number, discountAmount: number, taxPercent?: number): number {
        if (!taxPercent) return 0;
        const taxableAmount = subtotal - discountAmount;
        return (taxableAmount * taxPercent) / 100;
    }

    /**
     * Calculate grand total with all adjustments
     */
    calculateGrandTotal(
        subtotal: number,
        discountAmount: number,
        taxAmount: number,
        adjustmentAmount: number = 0
    ): number {
        return subtotal - discountAmount + taxAmount + adjustmentAmount;
    }

    /**
     * Get complete calculations for a quote
     */
    getQuoteCalculation(data: {
        items: QuoteItem[];
        discount_percent?: number;
        discount_amount?: number;
        tax_percent?: number;
        adjustment_amount?: number;
    }): QuoteCalculation {
        const sub_total = this.calculateSubtotal(data.items);
        const discount_amount = this.applyDiscount(
            sub_total,
            data.discount_percent,
            data.discount_amount
        );
        const tax_amount = this.calculateTax(sub_total, discount_amount, data.tax_percent);
        const grand_total = this.calculateGrandTotal(
            sub_total,
            discount_amount,
            tax_amount,
            data.adjustment_amount
        );

        return {
            sub_total,
            discount_amount,
            tax_amount,
            adjustment_amount: data.adjustment_amount || 0,
            grand_total,
        };
    }

    // ============================================================
    // PRIVATE HELPERS
    // ============================================================

    /**
     * Prepare quote data for API submission
     */
    private prepareQuotePayload(data: QuoteFormData) {
        const calculation = this.getQuoteCalculation({
            items: data.items || [],
            discount_percent: data.discount_percent,
            discount_amount: data.discount_amount,
            tax_percent: data.tax_percent,
            adjustment_amount: data.adjustment_amount,
        });

        return {
            subject: data.subject,
            description: data.description,
            person_id: data.person_id,
            lead_id: data.lead_id,
            expired_at: data.expired_at,
            billing_address: data.billing_address,
            shipping_address: data.shipping_address,
            discount_percent: data.discount_percent,
            discount_amount: calculation.discount_amount,
            tax_amount: calculation.tax_amount,
            adjustment_amount: calculation.adjustment_amount,
            sub_total: calculation.sub_total,
            grand_total: calculation.grand_total,
            items: data.items?.map((item) => ({
                product_id: item.product_id,
                quantity: item.quantity,
                price: item.price,
                discount_percent: item.discount_percent,
                total: this.calculateLineTotal(item),
            })),
        };
    }
}

export const quoteService = new QuoteService();
