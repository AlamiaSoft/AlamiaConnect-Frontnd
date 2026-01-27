'use client';

import React, { useState } from 'react';
import { UniversalTable } from '@/components/shared/universal-table';
import { QuoteForm } from './quote-form';
import { quoteService } from '@/services/quote-service';
import type { Quote, QuoteListParams } from '@/types/quote';
import type { Column } from '@/components/shared/universal-table';
import { Download, FileText } from 'lucide-react';

/**
 * QuotesTable Component
 * 
 * Displays a paginated, searchable, and filterable table of quotes
 * using the UniversalTable component.
 */
export function QuotesTable() {
    const [refreshKey, setRefreshKey] = useState(0);

    const columns: Column<Quote>[] = [
        {
            key: 'id',
            label: 'Quote #',
            sortable: true,
            render: (quote) => `QT-${String(quote.id).padStart(5, '0')}`,
        },
        {
            key: 'subject',
            label: 'Subject',
            sortable: true,
            searchable: true,
        },
        {
            key: 'person.name',
            label: 'Customer',
            sortable: true,
            render: (quote) => quote.person?.name || 'N/A',
        },
        {
            key: 'grand_total',
            label: 'Total Amount',
            sortable: true,
            align: 'right',
            render: (quote) => formatCurrency(quote.grand_total),
        },
        {
            key: 'status',
            label: 'Status',
            sortable: true,
            render: (quote) => <StatusBadge status={quote.status || 'draft'} />,
        },
        {
            key: 'expired_at',
            label: 'Valid Until',
            sortable: true,
            render: (quote) =>
                quote.expired_at
                    ? new Date(quote.expired_at).toLocaleDateString()
                    : 'No expiry',
        },
        {
            key: 'created_at',
            label: 'Created',
            sortable: true,
            render: (quote) => new Date(quote.created_at).toLocaleDateString(),
        },
    ];

    const handleFetch = async (params: QuoteListParams) => {
        const quotes = await quoteService.getQuotes(params);
        return quotes;
    };

    const handleDelete = async (id: number) => {
        await quoteService.deleteQuote(id);
        setRefreshKey((prev) => prev + 1);
    };

    const handleBulkDelete = async (ids: number[]) => {
        await quoteService.massDeleteQuotes(ids);
        setRefreshKey((prev) => prev + 1);
    };

    const handleDownloadPdf = async (quote: Quote) => {
        try {
            const blob = await quoteService.downloadQuotePdf(quote.id);
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `Quote-${quote.id}.pdf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Failed to download PDF:', error);
            alert('Failed to download PDF');
        }
    };

    const bulkActions = [
        {
            label: 'Download PDFs',
            icon: <Download className="w-4 h-4" />,
            onClick: async (selectedQuotes: Quote[]) => {
                for (const quote of selectedQuotes) {
                    await handleDownloadPdf(quote);
                }
            },
        },
        {
            label: 'Delete Selected',
            icon: <FileText className="w-4 h-4" />,
            onClick: async (selectedQuotes: Quote[]) => {
                if (confirm(`Delete ${selectedQuotes.length} quotes?`)) {
                    await handleBulkDelete(selectedQuotes.map((q) => q.id));
                }
            },
            variant: 'destructive' as const,
        },
    ];

    const rowActions = [
        {
            label: 'Download PDF',
            icon: <Download className="w-4 h-4" />,
            onClick: handleDownloadPdf,
        },
        {
            label: 'View Details',
            icon: <FileText className="w-4 h-4" />,
            onClick: (quote: Quote) => {
                window.location.href = `/quotes/${quote.id}`;
            },
        },
    ];

    return (
        <UniversalTable<Quote, QuoteListParams>
            title="Quotes"
            columns={columns}
            fetchData={handleFetch}
            onDelete={handleDelete}
            deleteConfirmMessage="Are you sure you want to delete this quote?"
            FormComponent={QuoteForm}
            refreshKey={refreshKey}
            searchPlaceholder="Search quotes by subject or customer..."
            bulkActions={bulkActions}
            rowActions={rowActions}
            filters={[
                {
                    key: 'status',
                    label: 'Status',
                    type: 'select',
                    options: [
                        { value: 'draft', label: 'Draft' },
                        { value: 'sent', label: 'Sent' },
                        { value: 'viewed', label: 'Viewed' },
                        { value: 'accepted', label: 'Accepted' },
                        { value: 'rejected', label: 'Rejected' },
                        { value: 'expired', label: 'Expired' },
                    ],
                },
            ]}
        />
    );
}

/**
 * Status Badge Component
 */
function StatusBadge({ status }: { status: string }) {
    const statusColors: Record<string, string> = {
        draft: 'bg-gray-100 text-gray-800',
        sent: 'bg-blue-100 text-blue-800',
        viewed: 'bg-purple-100 text-purple-800',
        accepted: 'bg-green-100 text-green-800',
        rejected: 'bg-red-100 text-red-800',
        expired: 'bg-orange-100 text-orange-800',
    };

    const color = statusColors[status] || statusColors.draft;

    return (
        <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${color}`}
        >
            {status.charAt(0).toUpperCase() + status.slice(1)}
        </span>
    );
}

/**
 * Currency formatter helper
 */
function formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
    }).format(amount);
}
