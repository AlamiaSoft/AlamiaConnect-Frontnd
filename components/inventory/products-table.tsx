"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
    Package,
    Tag,
    DollarSign,
    Box,
    FileText,
} from "lucide-react"
import { ProductsService } from "@/services/products-service"
import { ProductForm } from "./product-form"
import { UniversalTable, ColumnDef } from "@/components/shared/universal-table"

// Adapter to match ServiceInterface
const productsServiceAdapter = {
    getCollection: (params: any) => ProductsService.getProducts(params),
    search: (query: string, params: any) => ProductsService.searchProducts(query, params),
    delete: (id: string | number) => ProductsService.deleteProduct(id),
}

// Wrapper to adapt ProductForm props
const ProductFormWrapper = ({ initialData, onSuccess, onCancel }: any) => (
    <ProductForm product={initialData} onSuccess={onSuccess} onCancel={onCancel} />
)

export function ProductsTable() {

    const columns: ColumnDef<any>[] = [
        {
            key: "name",
            header: "Name",
            className: "font-medium",
            render: (product) => (
                <div className="flex items-center gap-2">
                    <Package className="h-4 w-4 text-muted-foreground" />
                    <div className="flex flex-col">
                        <span>{product.name}</span>
                        {product.sku && (
                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                                <Tag className="h-3 w-3" /> {product.sku}
                            </span>
                        )}
                    </div>
                </div>
            )
        },
        {
            key: "price",
            header: "Price",
            render: (product) => (
                <div className="flex items-center gap-1">
                    <DollarSign className="h-3.5 w-3.5 text-muted-foreground" />
                    <span>{parseFloat(product.price || '0').toFixed(2)}</span>
                </div>
            )
        },
        {
            key: "quantity",
            header: "Stock",
            render: (product) => (
                <div className="flex items-center gap-2">
                    <Box className="h-3.5 w-3.5 text-muted-foreground" />
                    <Badge variant={product.quantity > 0 ? "default" : "destructive"} className="text-xs">
                        {product.quantity || 0}
                    </Badge>
                </div>
            )
        },
        {
            key: "description",
            header: "Description",
            render: (product) => (
                <div className="max-w-[300px] truncate text-muted-foreground text-sm" title={product.description}>
                    {product.description || '-'}
                </div>
            )
        }
    ]

    const dataMapper = (product: any) => ({
        ...product,
        quantity: product.quantity ?? 0,
        price: product.price ?? 0
    })

    // Custom filter for client-side search feedback (if needed, though hybrid search usually handles it)
    const clientFilter = (product: any, query: string, filters: any) => {
        const lowerQuery = query.toLowerCase()
        return (
            product.name.toLowerCase().includes(lowerQuery) ||
            (product.sku && product.sku.toLowerCase().includes(lowerQuery)) ||
            (product.description && product.description.toLowerCase().includes(lowerQuery))
        )
    }

    const renderCard = (product: any, actions: React.ReactNode) => {
        return (
            <Card className="hover:shadow-md transition-shadow h-full">
                <CardContent className="p-4 flex flex-col h-full justify-between">
                    <div className="space-y-4">
                        <div className="flex items-start justify-between gap-4">
                            <div className="flex-1 min-w-0">
                                <h3 className="font-semibold text-lg truncate flex items-center gap-2">
                                    <Package className="h-4 w-4 text-muted-foreground" />
                                    {product.name}
                                </h3>
                                <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                                    <Tag className="h-3.5 w-3.5" />
                                    <span className="font-mono">{product.sku}</span>
                                </div>
                            </div>
                            <div className="flex flex-col items-end gap-1">
                                <Badge variant={product.quantity > 0 ? "outline" : "destructive"}>
                                    {product.quantity > 0 ? "In Stock" : "Out of Stock"}
                                </Badge>
                                <span className="font-bold text-lg flex items-center">
                                    <DollarSign className="h-4 w-4" />
                                    {parseFloat(product.price || '0').toFixed(2)}
                                </span>
                            </div>
                        </div>

                        {product.description && (
                            <div className="text-sm text-muted-foreground line-clamp-3 bg-muted/50 p-2 rounded">
                                <FileText className="h-3 w-3 inline mr-1" />
                                {product.description}
                            </div>
                        )}

                        <div className="flex items-center justify-between text-sm pt-2">
                            <div className="flex items-center gap-1 text-muted-foreground">
                                <Box className="h-4 w-4" />
                                <span>Quantity:</span>
                                <span className="font-medium text-foreground">{product.quantity}</span>
                            </div>
                        </div>
                    </div>
                    <div className="mt-4 pt-4 border-t">
                        {actions}
                    </div>
                </CardContent>
            </Card>
        )
    }

    return (
        <UniversalTable
            title="Products"
            description="Manage your product catalog and SKUs"
            endpoint="/products"
            service={productsServiceAdapter}
            columns={columns}
            FormComponent={ProductFormWrapper}
            dataMapper={dataMapper}
            clientFilter={clientFilter}
            renderCard={renderCard}
            searchPlaceholder="Search products by name or SKU..."
        />
    )
}
