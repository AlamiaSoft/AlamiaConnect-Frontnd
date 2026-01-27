import type { Person } from './person';
import type { User } from './user';
import type { Product } from './product';

/**
 * Quote Item (Line Item)
 */
export interface QuoteItem {
    id?: number;
    quote_id?: number;
    product_id: number;
    product?: Product;
    quantity: number;
    price: number;
    discount_percent?: number;
    tax_percent?: number;
    total?: number;
    name?: string; // Product name snapshot
    sku?: string; // Product SKU snapshot
}

/**
 * Address structure for billing/shipping
 */
export interface QuoteAddress {
    address: string;
    city: string;
    state: string;
    country: string;
    postcode: string;
}

/**
 * Quote Status
 */
export type QuoteStatus = 'draft' | 'sent' | 'viewed' | 'accepted' | 'rejected' | 'expired';

/**
 * Main Quote entity
 */
export interface Quote {
    id: number;
    subject: string;
    description?: string;
    person_id: number;
    person?: Person;
    user_id: number;
    user?: User;
    lead_id?: number;
    expired_at?: string;
    billing_address?: QuoteAddress;
    shipping_address?: QuoteAddress;
    discount_percent?: number;
    discount_amount: number;
    tax_amount: number;
    adjustment_amount: number;
    sub_total: number;
    grand_total: number;
    items?: QuoteItem[];
    status?: QuoteStatus;
    created_at: string;
    updated_at: string;
}

/**
 * Form data for creating/editing quotes
 */
export interface QuoteFormData {
    subject: string;
    description?: string;
    person_id: number;
    lead_id?: number;
    expired_at?: string;
    billing_address?: QuoteAddress;
    shipping_address?: QuoteAddress;
    discount_percent?: number;
    discount_amount?: number;
    tax_percent?: number;
    adjustment_amount?: number;
    items?: QuoteItem[];
}

/**
 * List query parameters
 */
export interface QuoteListParams {
    page?: number;
    limit?: number;
    search?: string;
    status?: QuoteStatus;
    person_id?: number;
    user_id?: number;
    date_from?: string;
    date_to?: string;
    min_amount?: number;
    max_amount?: number;
    include?: string;
    sort?: string;
    order?: 'asc' | 'desc';
}

/**
 * Quote calculation result
 */
export interface QuoteCalculation {
    sub_total: number;
    discount_amount: number;
    tax_amount: number;
    adjustment_amount: number;
    grand_total: number;
}

/**
 * Quote summary statistics
 */
export interface QuoteSummary {
    total_quotes: number;
    total_value: number;
    draft_count: number;
    sent_count: number;
    accepted_count: number;
    expired_count: number;
    conversion_rate: number; // Accepted / Sent
}
