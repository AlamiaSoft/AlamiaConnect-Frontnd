"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
    DollarSign,
    User,
    Calendar,
    FileText,
    MapPin,
    Layers
} from "lucide-react"
import { SalesService } from "@/services/sales-service"
import { UniversalTable, ColumnDef } from "@/components/shared/universal-table"

// Adapter to match ServiceInterface
const salesServiceAdapter = {
    getCollection: (params: any) => SalesService.getInvoices(params),
    search: (query: string, params: any) => SalesService.getInvoices({ ...params, search: query }), // Fallback if no specific search endpoint
    delete: (id: string | number) => SalesService.deleteInvoice(id),
}

const statusColors: Record<string, string> = {
    closed: "bg-emerald-100 text-emerald-700 border-emerald-200",
    released: "bg-emerald-100 text-emerald-700 border-emerald-200",
    pending: "bg-amber-100 text-amber-700 border-amber-200",
    negotiation: "bg-blue-100 text-blue-700 border-blue-200",
    partial: "bg-blue-100 text-blue-700 border-blue-200",
}

export function SalesTable() {

    const columns: ColumnDef<any>[] = [
        {
            key: "invoice_number",
            header: "Invoice #",
            className: "font-medium",
            render: (sale) => (
                <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <span>{sale.invoice_number}</span>
                </div>
            )
        },
        {
            key: "customer_name",
            header: "Customer",
            render: (sale) => (
                <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span>{sale.customer_name}</span>
                </div>
            )
        },
        {
            key: "machineryCategory",
            header: "Machinery",
            render: (sale) => (
                <div className="flex items-center gap-2 max-w-[200px]" title={sale.machineryCategory}>
                    <Layers className="h-4 w-4 text-muted-foreground" />
                    <span className="truncate">{sale.machineryCategory || '-'}</span>
                </div>
            )
        },
        {
            key: "total_amount",
            header: "Amount",
            render: (sale) => (
                <div className="font-medium text-emerald-700 flex items-center gap-1">
                    <DollarSign className="h-3.5 w-3.5" />
                    {Number(sale.total_amount).toLocaleString()}
                </div>
            )
        },
        {
            key: "commissionStatus",
            header: "Status",
            render: (sale) => {
                const statusKey = sale.commissionStatus?.toLowerCase() || 'pending';
                // Map API status to color keys if needed, or use directly if they match
                let colorKey = 'pending';
                if (statusKey === 'released') colorKey = 'closed';
                else if (statusKey === 'partial') colorKey = 'partial';
                else if (statusKey === 'pending') colorKey = 'pending';

                return (
                    <Badge variant="outline" className={statusColors[colorKey]}>
                        {sale.commissionStatus || 'Pending'}
                    </Badge>
                )
            }
        },
        {
            key: "date",
            header: "Date",
            render: (sale) => (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-3.5 w-3.5" />
                    <span>{sale.date ? new Date(sale.date).toLocaleDateString() : '-'}</span>
                </div>
            )
        },
        {
            key: "sales_manager",
            header: "Executive",
            render: (sale) => sale.sales_manager || '-'
        },
        {
            key: "region",
            header: "Region",
            render: (sale) => (
                <Badge variant="secondary" className="flex items-center gap-1 w-fit">
                    <MapPin className="h-3 w-3" />
                    {sale.region || 'Karachi'}
                </Badge>
            )
        }
    ]

    const dataMapper = (sale: any) => ({
        ...sale,
        // Ensure fields exist
        customer_name: sale.customer_name || 'Unknown',
        total_amount: sale.total_amount || 0,
        region: 'Karachi' // Mock region if missing in API
    })

    const clientFilter = (sale: any, query: string, filters: any) => {
        const lowerQuery = query.toLowerCase()
        return (
            (sale.invoice_number && sale.invoice_number.toLowerCase().includes(lowerQuery)) ||
            (sale.customer_name && sale.customer_name.toLowerCase().includes(lowerQuery)) ||
            (sale.machineryCategory && sale.machineryCategory.toLowerCase().includes(lowerQuery))
        )
    }

    const renderCard = (sale: any, actions: React.ReactNode) => {
        const statusKey = sale.commissionStatus?.toLowerCase() || 'pending';
        let colorKey = 'pending';
        if (statusKey === 'released') colorKey = 'closed';
        else if (statusKey === 'partial') colorKey = 'partial';

        return (
            <Card className="hover:shadow-md transition-shadow h-full">
                <CardContent className="p-4 flex flex-col h-full justify-between">
                    <div className="space-y-3">
                        <div className="flex items-start justify-between">
                            <div className="space-y-1">
                                <h3 className="font-semibold text-base flex items-center gap-2">
                                    <FileText className="h-4 w-4 text-muted-foreground" />
                                    {sale.invoice_number}
                                </h3>
                                <div className="text-sm text-muted-foreground flex items-center gap-1">
                                    <User className="h-3.5 w-3.5" />
                                    {sale.customer_name}
                                </div>
                            </div>
                            <Badge variant="outline" className={statusColors[colorKey]}>
                                {sale.commissionStatus || 'Pending'}
                            </Badge>
                        </div>

                        <div className="text-sm border-t pt-2 mt-2">
                            <div className="flex justify-between items-center mb-1">
                                <span className="text-muted-foreground">Machinery:</span>
                                <span className="max-w-[150px] truncate" title={sale.machineryCategory}>{sale.machineryCategory}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-muted-foreground">Amount:</span>
                                <span className="font-bold text-lg">PKR {Number(sale.total_amount / 1000000).toFixed(1)}M</span>
                            </div>
                        </div>

                        <div className="flex justify-between items-center text-xs text-muted-foreground pt-2">
                            <span>{sale.sales_manager}</span>
                            <span className="flex items-center gap-1">
                                <MapPin className="h-3 w-3" />
                                {sale.region || 'Karachi'}
                            </span>
                        </div>
                    </div>
                    <div className="mt-4 pt-2 border-t">
                        {actions}
                    </div>
                </CardContent>
            </Card>
        )
    }

    // Server-side filters can be passed if API supports them
    const filters = [
        {
            key: "commissionStatus",
            label: "Status",
            options: [
                { label: "Released", value: "Released" },
                { label: "Partial", value: "Partial" },
                { label: "Pending", value: "Pending" },
            ]
        }
    ]

    return (
        <UniversalTable
            title="Sales Invoices"
            description="Manage invoices and track revenue"
            endpoint="/sales-invoices"
            service={salesServiceAdapter}
            columns={columns}
            // FormComponent={SalesFormWrapper} // TODO
            dataMapper={dataMapper}
            clientFilter={clientFilter}
            renderCard={renderCard}
            searchPlaceholder="Search invoices..."
            filters={filters}
        />
    )
}
