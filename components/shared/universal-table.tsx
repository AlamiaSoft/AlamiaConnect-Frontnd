"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import useSWR, { mutate } from "swr"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
    MoreVertical,
    Pencil,
    Trash2,
    Search,
    Plus,
    Table as TableIcon,
    LayoutGrid,
    List,
    ChevronLeft,
    ChevronRight,
    Eye,
    Loader2,
    Kanban
} from "lucide-react"
import { KanbanBoard } from "./universal-kanban"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { ResponsiveDialog } from "@/components/ui/responsive-dialog"
import { toast } from "sonner"

// --- Types ---

export interface ColumnDef<T> {
    key: string
    header: string
    render?: (item: T) => React.ReactNode
    sortable?: boolean
    className?: string
}

export interface FilterOption {
    value: string
    label: string
}

export interface FilterDef {
    key: string
    label: string
    options: FilterOption[]
}

export interface StatDef {
    title: string
    value: string | number
    icon?: React.ReactNode
    className?: string
}

export interface ServiceInterface<T> {
    getCollection: (params: any) => Promise<any>
    search?: (query: string, params: any) => Promise<any> // Optional dedicated search
    delete: (id: string | number) => Promise<any>
    update?: (id: string | number, data: any) => Promise<any>
}

export interface KanbanConfig {
    groupBy: string
    columns: Array<{ id: string; label: string; color?: string }>
    onStatusChange?: (id: string | number, newStatusId: string) => void
}

export interface UniversalTableProps<T> {
    title: string
    description?: string

    // Data Fetching
    endpoint: string // Cache key for SWR
    service: ServiceInterface<T>

    // Configuration
    columns: ColumnDef<T>[]
    filters?: FilterDef[]
    stats?: StatDef[] // Simple stats override

    // Custom Renders
    renderCard?: (item: T, actions: React.ReactNode) => React.ReactNode // For List/Grid views
    renderStats?: (data: T[]) => React.ReactNode // Custom stats area override

    // Forms
    FormComponent?: React.ComponentType<{
        initialData?: T | null
        onSuccess: () => void
        onCancel: () => void
        isViewOnly?: boolean
    }>
    createLink?: string // Route to navigate to for creation

    // Search
    searchPlaceholder?: string

    // Mapper (optional transformation from API to T)
    dataMapper?: (apiItem: any) => T

    // Quick Filters for Client Side (optional)
    clientFilter?: (item: T, query: string, filters: Record<string, string>) => boolean

    // Kanban Configuration
    kanban?: KanbanConfig
}

export function UniversalTable<T extends { id: string | number }>({
    title,
    description,
    endpoint,
    service,
    columns,
    filters = [],
    stats,
    renderCard,
    renderStats,
    FormComponent,
    searchPlaceholder = "Search...",
    dataMapper,
    clientFilter,
    createLink,
    kanban
}: UniversalTableProps<T>) {
    const router = useRouter()
    const searchParams = useSearchParams()

    // --- State ---
    const [searchQuery, setSearchQuery] = useState("")
    const [activeFilters, setActiveFilters] = useState<Record<string, string>>({})
    const [viewMode, setViewMode] = useState<"table" | "list" | "grid" | "board">(() => {
        const viewParam = searchParams.get('view')
        return (viewParam === 'table' || viewParam === 'list' || viewParam === 'grid' || viewParam === 'board') ? viewParam : 'table'
    })
    const [page, setPage] = useState(1)
    const [perPage, setPerPage] = useState(10)

    // Dialogs
    const [isFormOpen, setIsFormOpen] = useState(false)
    const [editingItem, setEditingItem] = useState<T | null>(null)
    const [deletingItem, setDeletingItem] = useState<T | null>(null)
    const [isDeleting, setIsDeleting] = useState(false)

    const [viewingItem, setViewingItem] = useState<T | null>(null)
    const [isViewOpen, setIsViewOpen] = useState(false)

    // Update URL when view mode changes
    // Update URL when view mode changes
    useEffect(() => {
        const currentView = searchParams.get('view')
        if (currentView !== viewMode) {
            const params = new URLSearchParams(searchParams.toString())
            params.set('view', viewMode)
            router.replace(`?${params.toString()}`, { scroll: false })
        }
    }, [viewMode, router, searchParams])

    // Initialize filters
    if (Object.keys(activeFilters).length === 0 && filters.length > 0) {
        const initialFilters: Record<string, string> = {}
        filters.forEach(f => initialFilters[f.key] = "all")
        // Only set if we actually have filters to avoid infinite loop
        if (Object.keys(initialFilters).length > 0 && Object.keys(activeFilters).length === 0) {
            // We'll just default to empty in state render, no need to force set here to avoid re-renders
        }
    }

    // --- Data Fetching ---
    const { data: apiResponse, error, isLoading } = useSWR(
        [endpoint, { search: searchQuery, page, perPage }],
        ([_, params]: [string, any]) => {
            // Hybrid Search Logic
            if (params.search && params.search.trim() !== '' && service.search) {
                return service.search(params.search, params)
            }
            return service.getCollection(params)
        }
    )

    // Normalizing Data
    const rawData = apiResponse?.data || []
    const data: T[] = dataMapper ? rawData.map(dataMapper) : rawData

    // Meta
    const meta = apiResponse?.meta || {}
    const totalItems = meta.total || data.length || 0
    const totalPages = meta.last_page || Math.ceil(totalItems / perPage) || 1

    // Client-Side Hyrbid Filtering (for instant feedback)
    const filteredData = data.filter(item => {
        // 1. Check Filters
        for (const filter of filters) {
            const value = activeFilters[filter.key] || "all"
            if (value !== "all") {
                // Accessing property dynamically - assumption is T has these keys or clientFilter handles it
                // This simple filter assumes item[key] exists. 
                // Ideally clientFilter prop should be used for complex logic.
                if ((item as any)[filter.key] !== value) return false
            }
        }

        // 2. Custom Client Filter
        if (clientFilter) {
            return clientFilter(item, searchQuery, activeFilters)
        }

        return true
    })

    // --- Handlers ---
    const handlePageChange = (newPage: number) => {
        if (newPage >= 1 && newPage <= totalPages) setPage(newPage)
    }

    const handleCreate = () => {
        setEditingItem(null)
        setIsFormOpen(true)
    }

    const handleEdit = (item: T) => {
        setEditingItem(item)
        setIsFormOpen(true)
    }

    const handleView = (item: T) => {
        setViewingItem(item)
        setIsViewOpen(true)
    }

    const handleDelete = async () => {
        if (!deletingItem) return
        setIsDeleting(true)
        try {
            await service.delete(deletingItem.id)
            toast.success("Item deleted successfully")
            mutate([endpoint, { search: searchQuery, page, perPage }])
            setDeletingItem(null)
        } catch (error) {
            console.error(error)
            toast.error("Failed to delete item")
        } finally {
            setIsDeleting(false)
        }
    }

    // Default Renderer for Filters
    const renderFilters = () => (
        <>
            <div className="relative flex-1 min-w-[240px]">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                    placeholder={searchPlaceholder}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                />
            </div>
            {filters.map(filter => (
                <Select
                    key={filter.key}
                    value={activeFilters[filter.key] || "all"}
                    onValueChange={(val) => setActiveFilters(prev => ({ ...prev, [filter.key]: val }))}
                >
                    <SelectTrigger className="w-[160px]">
                        <SelectValue placeholder={filter.label} />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All {filter.label}s</SelectItem>
                        {filter.options.map(opt => (
                            <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            ))}
            <Button
                variant="outline"
                size="sm"
                onClick={() => {
                    setSearchQuery("")
                    setActiveFilters({})
                }}
            >
                Clear
            </Button>
        </>
    )

    // Default Stats Renderer
    const defaultStatsRenderer = () => {
        if (!stats) return null
        return (
            <div className={`grid gap-4 md:grid-cols-${stats.length > 4 ? 4 : stats.length}`}>
                {stats.map((stat, idx) => (
                    <Card key={idx}>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                                {stat.icon}
                                {stat.title}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stat.value}</div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        )
    }

    const actionsCell = (item: T) => (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                    <MoreVertical className="h-4 w-4" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => handleView(item)}>
                    <Eye className="mr-2 h-4 w-4" /> View Details
                </DropdownMenuItem>
                {FormComponent && (
                    <DropdownMenuItem onClick={() => handleEdit(item)}>
                        <Pencil className="mr-2 h-4 w-4" /> Edit
                    </DropdownMenuItem>
                )}
                <DropdownMenuItem
                    className="text-destructive focus:text-destructive"
                    onClick={() => setDeletingItem(item)}
                >
                    <Trash2 className="mr-2 h-4 w-4" /> Delete
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )

    const actionButtons = (item: T) => (
        <div className="flex gap-2">
            <Button variant="outline" size="sm" className="flex-1 bg-transparent" onClick={() => handleView(item)}>
                View
            </Button>
            {FormComponent && (
                <Button variant="outline" size="sm" className="flex-1 bg-transparent" onClick={() => handleEdit(item)}>
                    Edit
                </Button>
            )}
        </div>
    )

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
                {description && <p className="text-muted-foreground mt-1">{description}</p>}
            </div>

            {/* Stats */}
            {renderStats ? renderStats(filteredData) : defaultStatsRenderer()}

            {/* Main Card */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle>{title} Directory</CardTitle>
                            <CardDescription>Manage your {title.toLowerCase()} here.</CardDescription>
                        </div>
                        <div className="flex items-center gap-3">
                            {(FormComponent || createLink) && (
                                <>
                                    {createLink ? (
                                        <Link href={createLink}>
                                            <Button>
                                                <Plus className="mr-2 h-4 w-4" /> Add {title.slice(0, -1)}
                                            </Button>
                                        </Link>
                                    ) : (
                                        <Button onClick={handleCreate}>
                                            <Plus className="mr-2 h-4 w-4" /> Add {title.slice(0, -1)}
                                        </Button>
                                    )}
                                </>
                            )}
                            <div className="flex items-center gap-1 rounded-md border p-1">
                                <Button variant={viewMode === "table" ? "secondary" : "ghost"} size="sm" onClick={() => setViewMode("table")} className="h-8 w-8 p-0"><TableIcon className="h-4 w-4" /></Button>
                                <Button variant={viewMode === "list" ? "secondary" : "ghost"} size="sm" onClick={() => setViewMode("list")} className="h-8 w-8 p-0"><List className="h-4 w-4" /></Button>
                                <Button variant={viewMode === "grid" ? "secondary" : "ghost"} size="sm" onClick={() => setViewMode("grid")} className="h-8 w-8 p-0"><LayoutGrid className="h-4 w-4" /></Button>
                                {kanban && (
                                    <Button variant={viewMode === "board" ? "secondary" : "ghost"} size="sm" onClick={() => setViewMode("board")} className="h-8 w-8 p-0"><Kanban className="h-4 w-4" /></Button>
                                )}
                            </div>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    {/* Filters Bar */}
                    <div className="flex flex-wrap items-center gap-3 mb-6">
                        {renderFilters()}
                    </div>

                    {/* Pagination Info */}
                    <div className="flex items-center justify-between mb-4 text-sm text-muted-foreground">
                        <div>Showing {filteredData.length} of {totalItems} items</div>
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                                <span>Rows per page</span>
                                <Select value={perPage.toString()} onValueChange={(val) => { setPerPage(Number(val)); setPage(1) }}>
                                    <SelectTrigger className="h-8 w-[70px]"><SelectValue placeholder={perPage} /></SelectTrigger>
                                    <SelectContent side="top">
                                        {[10, 20, 30, 40, 50].map(s => <SelectItem key={s} value={`${s}`}>{s}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-[100px] text-center">Page {page} of {totalPages}</div>
                                <div className="flex items-center gap-1">
                                    <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => handlePageChange(page - 1)} disabled={page <= 1}><ChevronLeft className="h-4 w-4" /></Button>
                                    <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => handlePageChange(page + 1)} disabled={page >= totalPages}><ChevronRight className="h-4 w-4" /></Button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* View Modes */}
                    {viewMode === "table" && (
                        <div className="overflow-auto rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        {columns.map((col, idx) => (
                                            <TableHead key={idx} className={col.className}>{col.header}</TableHead>
                                        ))}
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {isLoading && (
                                        <TableRow>
                                            <TableCell colSpan={columns.length + 1} className="text-center h-24">
                                                <div className="flex items-center justify-center gap-2 text-muted-foreground">
                                                    <Loader2 className="h-5 w-5 animate-spin" />
                                                    <span>Loading...</span>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    )}
                                    {!isLoading && filteredData.length === 0 && <TableRow><TableCell colSpan={columns.length + 1} className="text-center h-24">No results found.</TableCell></TableRow>}
                                    {filteredData.map((item, idx) => (
                                        <TableRow key={item.id || idx}>
                                            {columns.map((col, cIdx) => (
                                                <TableCell key={cIdx} className={col.className}>
                                                    {col.render ? col.render(item) : (item as any)[col.key]}
                                                </TableCell>
                                            ))}
                                            <TableCell className="text-right">{actionsCell(item)}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    )}

                    {(viewMode === "list" || viewMode === "grid") && (
                        <div className={viewMode === "grid" ? "grid gap-4 sm:grid-cols-2 lg:grid-cols-3" : "space-y-3"}>
                            {isLoading && (
                                <div className="col-span-full flex items-center justify-center py-10 text-muted-foreground">
                                    <Loader2 className="h-6 w-6 animate-spin mr-2" />
                                    <span>Loading...</span>
                                </div>
                            )}
                            {!isLoading && filteredData.map((item, idx) => (
                                <div key={item.id || idx}>
                                    {renderCard ? renderCard(item, actionButtons(item)) : <Card><CardContent className="p-4">{JSON.stringify(item)}</CardContent></Card>}
                                </div>
                            ))}
                            {!isLoading && filteredData.length === 0 && <div className="col-span-full text-center py-10 text-muted-foreground">No results found.</div>}
                        </div>
                    )}

                    {viewMode === "board" && kanban && (
                        <div className="h-[600px] border rounded-md p-4 bg-slate-50/50 dark:bg-slate-900/20">
                            <KanbanBoard
                                items={filteredData}
                                groupBy={kanban.groupBy}
                                columns={kanban.columns}
                                renderCard={(item) => renderCard ? renderCard(item, actionButtons(item)) : <Card><CardContent>{JSON.stringify(item)}</CardContent></Card>}
                                onStatusChange={kanban.onStatusChange}
                                isLoading={isLoading}
                            />
                        </div>
                    )}

                </CardContent>
            </Card>

            {/* Forms */}
            {FormComponent && (
                <>
                    <ResponsiveDialog
                        isOpen={isFormOpen}
                        setIsOpen={setIsFormOpen}
                        title={editingItem ? `Edit ${title.slice(0, -1)}` : `Add New ${title.slice(0, -1)}`}
                        description={editingItem ? "Update details." : "Enter details to create new."}
                    >
                        <FormComponent
                            initialData={editingItem}
                            onSuccess={() => {
                                setIsFormOpen(false)
                                mutate([endpoint, { search: searchQuery, page, perPage }])
                            }}
                            onCancel={() => setIsFormOpen(false)}
                        />
                    </ResponsiveDialog>

                    <ResponsiveDialog
                        isOpen={isViewOpen}
                        setIsOpen={setIsViewOpen}
                        title={`View ${title.slice(0, -1)} Details`}
                        description="Detailed information."
                    >
                        <FormComponent
                            initialData={viewingItem}
                            onSuccess={() => setIsViewOpen(false)}
                            onCancel={() => setIsViewOpen(false)}
                            isViewOnly={true}
                        />
                    </ResponsiveDialog>
                </>
            )}

            <AlertDialog open={!!deletingItem} onOpenChange={(open: boolean) => !open && setDeletingItem(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete this item.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={(e: React.MouseEvent) => { e.preventDefault(); handleDelete() }}
                            disabled={isDeleting}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            {isDeleting ? "Deleting..." : "Delete"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

        </div>
    )
}
