'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { quoteService } from '@/services/quote-service';
import { ProductSelector } from '@/components/shared/product-selector';
import type { Quote, QuoteFormData, QuoteItem } from '@/types/quote';
import type { Product } from '@/lib/api-types';
import { Plus, Trash2, Calculator } from 'lucide-react';

interface QuoteFormProps {
    initialData?: Quote;
    onSuccess?: () => void;
    onCancel?: () => void;
}

/**
 * QuoteForm Component
 * 
 * Comprehensive form for creating and editing quotes with:
 * - Dynamic line items
 * - Real-time calculation
 * - Product selector
 * - Address management
 */
export function QuoteForm({ initialData, onSuccess, onCancel }: QuoteFormProps) {
    const [loading, setLoading] = useState(false);

    // Form state
    const [subject, setSubject] = useState(initialData?.subject || '');
    const [description, setDescription] = useState(initialData?.description || '');
    const [personId, setPersonId] = useState<number | undefined>(initialData?.person_id);
    const [leadId, setLeadId] = useState<number | undefined>(initialData?.lead_id);
    const [expiredAt, setExpiredAt] = useState(
        initialData?.expired_at ? initialData.expired_at.split('T')[0] : ''
    );

    // Line items state
    const [items, setItems] = useState<QuoteItem[]>(
        initialData?.items || [createEmptyLineItem()]
    );

    // Financial state
    const [discountPercent, setDiscountPercent] = useState<number>(
        initialData?.discount_percent || 0
    );
    const [discountAmount, setDiscountAmount] = useState<number>(
        initialData?.discount_amount || 0
    );
    const [taxPercent, setTaxPercent] = useState<number>(0);
    const [adjustmentAmount, setAdjustmentAmount] = useState<number>(
        initialData?.adjustment_amount || 0
    );

    // Address state
    const [billingAddress, setBillingAddress] = useState(
        initialData?.billing_address || null
    );
    const [shippingAddress, setShippingAddress] = useState(
        initialData?.shipping_address || null
    );

    // Calculations
    const calculations = quoteService.getQuoteCalculation({
        items,
        discount_percent: discountPercent,
        discount_amount: discountAmount,
        tax_percent: taxPercent,
        adjustment_amount: adjustmentAmount,
    });

    // Product loading is now handled by ProductSelector component

    function createEmptyLineItem(): QuoteItem {
        return {
            product_id: 0,
            quantity: 1,
            price: 0,
            discount_percent: 0,
        };
    }

    const handleAddLineItem = () => {
        setItems([...items, createEmptyLineItem()]);
    };

    const handleRemoveLineItem = (index: number) => {
        if (items.length > 1) {
            setItems(items.filter((_, i) => i !== index));
        }
    };

    const handleLineItemChange = (index: number, field: keyof QuoteItem, value: any) => {
        const newItems = [...items];
        newItems[index] = { ...newItems[index], [field]: value };

        // Auto-fill price when product is selected
        if (field === 'product_id') {
            const product = products.find((p) => p.id === Number(value));
            if (product) {
                newItems[index].price = product.price;
                newItems[index].name = product.name;
                newItems[index].sku = product.sku;
            }
        }

        setItems(newItems);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validation
        if (!subject.trim()) {
            alert('Quote subject is required');
            return;
        }

        if (!personId) {
            alert('Customer is required');
            return;
        }

        if (items.length === 0 || items.every((item) => item.product_id === 0)) {
            alert('At least one product is required');
            return;
        }

        setLoading(true);

        try {
            const formData: QuoteFormData = {
                subject,
                description,
                person_id: personId,
                lead_id: leadId,
                expired_at: expiredAt || undefined,
                billing_address: billingAddress || undefined,
                shipping_address: shippingAddress || undefined,
                discount_percent: discountPercent,
                discount_amount: discountAmount,
                tax_percent: taxPercent,
                adjustment_amount: adjustmentAmount,
                items: items.filter((item) => item.product_id > 0),
            };

            if (initialData) {
                await quoteService.updateQuote(initialData.id, formData);
            } else {
                await quoteService.createQuote(formData);
            }

            onSuccess?.();
        } catch (error: any) {
            console.error('Failed to save quote:', error);
            alert(error.message || 'Failed to save quote');
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {/* Header Section */}
            <div className="space-y-4">
                <h3 className="text-lg font-semibold">Quote Information</h3>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="subject">Subject *</Label>
                        <Input
                            id="subject"
                            value={subject}
                            onChange={(e) => setSubject(e.target.value)}
                            required
                            placeholder="e.g., Q4 Equipment Quote"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="expired_at">Valid Until</Label>
                        <Input
                            id="expired_at"
                            type="date"
                            value={expiredAt}
                            onChange={(e) => setExpiredAt(e.target.value)}
                            min={new Date().toISOString().split('T')[0]}
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                        id="description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        rows={3}
                        placeholder="Additional notes or terms..."
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="person_id">Customer * (Person ID)</Label>
                        <Input
                            id="person_id"
                            type="number"
                            value={personId || ''}
                            onChange={(e) => setPersonId(Number(e.target.value))}
                            required
                            placeholder="Enter Person ID"
                        />
                        <p className="text-xs text-muted-foreground">
                            TODO: Replace with Person selector component
                        </p>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="lead_id">Lead ID (Optional)</Label>
                        <Input
                            id="lead_id"
                            type="number"
                            value={leadId || ''}
                            onChange={(e) => setLeadId(Number(e.target.value) || undefined)}
                            placeholder="Link to Lead"
                        />
                    </div>
                </div>
            </div>

            {/* Line Items Section */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">Products</h3>
                    <Button
                        type="button"
                        onClick={handleAddLineItem}
                        size="sm"
                        variant="outline"
                    >
                        <Plus className="w-4 h-4 mr-1" />
                        Add Product
                    </Button>
                </div>

                <div className="border rounded-lg overflow-hidden">
                    <table className="w-full">
                        <thead className="bg-muted">
                            <tr>
                                <th className="text-left p-2 text-sm font-medium">Product</th>
                                <th className="text-right p-2 text-sm font-medium w-24">Qty</th>
                                <th className="text-right p-2 text-sm font-medium w-32">Price</th>
                                <th className="text-right p-2 text-sm font-medium w-24">Disc %</th>
                                <th className="text-right p-2 text-sm font-medium w-32">Total</th>
                                <th className="w-12"></th>
                            </tr>
                        </thead>
                        <tbody>
                            {items.map((item, index) => (
                                <tr key={index} className="border-t">
                                    <td className="p-2">
                                        <ProductSelector
                                            value={item.product_id || null}
                                            onChange={(product) => {
                                                if (product) {
                                                    handleLineItemChange(index, 'product_id', product.id);
                                                } else {
                                                    handleLineItemChange(index, 'product_id', 0);
                                                }
                                            }}
                                            placeholder="Search products..."
                                        />
                                    </td>
                                    <td className="p-2">
                                        <Input
                                            type="number"
                                            value={item.quantity}
                                            onChange={(e) =>
                                                handleLineItemChange(index, 'quantity', Number(e.target.value))
                                            }
                                            min="1"
                                            className="text-right text-sm"
                                            required
                                        />
                                    </td>
                                    <td className="p-2">
                                        <Input
                                            type="number"
                                            value={item.price}
                                            onChange={(e) =>
                                                handleLineItemChange(index, 'price', Number(e.target.value))
                                            }
                                            step="0.01"
                                            min="0"
                                            className="text-right text-sm"
                                            required
                                        />
                                    </td>
                                    <td className="p-2">
                                        <Input
                                            type="number"
                                            value={item.discount_percent || 0}
                                            onChange={(e) =>
                                                handleLineItemChange(index, 'discount_percent', Number(e.target.value))
                                            }
                                            step="0.01"
                                            min="0"
                                            max="100"
                                            className="text-right text-sm"
                                        />
                                    </td>
                                    <td className="p-2 text-right text-sm font-medium">
                                        ${quoteService.calculateLineTotal(item).toFixed(2)}
                                    </td>
                                    <td className="p-2">
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleRemoveLineItem(index)}
                                            disabled={items.length === 1}
                                        >
                                            <Trash2 className="w-4 h-4 text-destructive" />
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Summary Section */}
            <div className="border rounded-lg p-4 bg-muted/50 space-y-3">
                <div className="flex items-center gap-2 mb-3">
                    <Calculator className="w-5 h-5" />
                    <h3 className="text-lg font-semibold">Summary</h3>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="discount_percent">Discount (%)</Label>
                        <Input
                            id="discount_percent"
                            type="number"
                            value={discountPercent}
                            onChange={(e) => setDiscountPercent(Number(e.target.value))}
                            step="0.01"
                            min="0"
                            max="100"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="tax_percent">Tax (%)</Label>
                        <Input
                            id="tax_percent"
                            type="number"
                            value={taxPercent}
                            onChange={(e) => setTaxPercent(Number(e.target.value))}
                            step="0.01"
                            min="0"
                        />
                    </div>

                    <div className="col-span-2 space-y-2">
                        <Label htmlFor="adjustment_amount">Adjustment (+/-)</Label>
                        <Input
                            id="adjustment_amount"
                            type="number"
                            value={adjustmentAmount}
                            onChange={(e) => setAdjustmentAmount(Number(e.target.value))}
                            step="0.01"
                            placeholder="0.00"
                        />
                    </div>
                </div>

                <div className="border-t pt-3 space-y-2">
                    <div className="flex justify-between text-sm">
                        <span>Subtotal:</span>
                        <span className="font-medium">${calculations.sub_total.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm text-destructive">
                        <span>Discount:</span>
                        <span className="font-medium">-${calculations.discount_amount.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span>Tax:</span>
                        <span className="font-medium">${calculations.tax_amount.toFixed(2)}</span>
                    </div>
                    {adjustmentAmount !== 0 && (
                        <div className="flex justify-between text-sm">
                            <span>Adjustment:</span>
                            <span className="font-medium">
                                {adjustmentAmount > 0 ? '+' : ''}${adjustmentAmount.toFixed(2)}
                            </span>
                        </div>
                    )}
                    <div className="flex justify-between text-lg font-bold border-t pt-2">
                        <span>Grand Total:</span>
                        <span>${calculations.grand_total.toFixed(2)}</span>
                    </div>
                </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-2">
                {onCancel && (
                    <Button type="button" variant="outline" onClick={onCancel}>
                        Cancel
                    </Button>
                )}
                <Button type="submit" disabled={loading}>
                    {loading ? 'Saving...' : initialData ? 'Update Quote' : 'Create Quote'}
                </Button>
            </div>
        </form>
    );
}
