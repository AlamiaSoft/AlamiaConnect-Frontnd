
"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
    MapPin,
    Calendar,
    User,
    CheckCircle2,
    Clock,
    XCircle,
    FileText
} from "lucide-react"
import { SalesVisitService } from "@/services/sales-visit-service"
import { UniversalTable, ColumnDef } from "@/components/shared/universal-table"
import { VisitForm } from "./visit-form"
import { format } from "date-fns"

// Adapter 
const visitsServiceAdapter = {
    getCollection: (params: any) => SalesVisitService.getVisits({
        ...params,
        include: 'user,lead'
    }),
    delete: (id: string | number) => SalesVisitService.deleteVisit(id),
}

const VisitFormWrapper = ({ initialData, onSuccess, onCancel, isViewOnly }: any) => (
    <VisitForm initialData={initialData} onSuccess={onSuccess} onCancel={onCancel} isViewOnly={isViewOnly} />
)

const filters = [
    {
        key: "outcome",
        label: "Outcome",
        options: [
            { label: "Scheduled", value: "scheduled" },
            { label: "Completed", value: "completed" },
            { label: "Rescheduled", value: "rescheduled" },
            { label: "Cancelled", value: "cancelled" },
        ]
    }
]

export function VisitsTable() {

    const getOutcomeBadge = (outcome: string) => {
        const status = outcome?.toLowerCase() || 'scheduled'
        switch (status) {
            case 'completed': return <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-200"><CheckCircle2 className="w-3 h-3 mr-1" />Completed</Badge>
            case 'cancelled': return <Badge variant="destructive" className="bg-red-100 text-red-800 hover:bg-red-200"><XCircle className="w-3 h-3 mr-1" />Cancelled</Badge>
            case 'rescheduled': return <Badge variant="outline" className="text-orange-600 border-orange-200"><Clock className="w-3 h-3 mr-1" />Rescheduled</Badge>
            default: return <Badge variant="secondary" className="bg-blue-100 text-blue-800 hover:bg-blue-200"><Calendar className="w-3 h-3 mr-1" />Scheduled</Badge>
        }
    }

    const columns: ColumnDef<any>[] = [
        {
            key: "id",
            header: "ID",
            render: (visit) => <span className="text-xs font-mono text-muted-foreground">#{visit.id}</span>
        },
        {
            key: "lead",
            header: "Lead / Customer",
            render: (visit) => (
                <div className="font-medium">
                    {visit.lead?.title || `Lead #${visit.lead_id}`}
                    <div className="text-xs text-muted-foreground">{visit.lead?.person_name}</div>
                </div>
            )
        },
        {
            key: "visit_at",
            header: "Date & Time",
            render: (visit) => (
                <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>{visit.visit_at ? format(new Date(visit.visit_at), "MMM d, yyyy h:mm a") : '-'}</span>
                </div>
            )
        },
        {
            key: "outcome",
            header: "Outcome",
            render: (visit) => getOutcomeBadge(visit.outcome)
        },
        {
            key: "user",
            header: "Agent",
            render: (visit) => (
                <div className="flex items-center gap-2 text-sm">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span>{visit.user?.name || 'Unassigned'}</span>
                </div>
            )
        }
    ]

    const dataMapper = (resource: any) => {
        // Handle generic JSON:API normalization if needed, similar to LeadsTable
        const attributes = resource.attributes || resource || {}
        return {
            ...attributes,
            id: resource.id || attributes.id,
            // Ensure nested objects are accessible
            lead: attributes.lead || (resource.relationships?.lead?.data ? { id: resource.relationships.lead.data.id } : null), // Ideally backend includes full object
            user: attributes.user || (resource.relationships?.user?.data ? { id: resource.relationships.user.data.id } : null),
        }
    }

    const renderCard = (visit: any, actions: React.ReactNode) => (
        <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-4 space-y-3">
                <div className="flex justify-between items-start">
                    <div>
                        <div className="font-semibold">{visit.lead?.title || 'Unknown Lead'}</div>
                        <div className="text-sm text-muted-foreground">{visit.lead?.person_name}</div>
                    </div>
                    {getOutcomeBadge(visit.outcome)}
                </div>

                <div className="space-y-1 text-sm">
                    <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span>{visit.visit_at ? format(new Date(visit.visit_at), "MMM d, yyyy h:mm a") : '-'}</span>
                    </div>
                    {visit.notes && (
                        <div className="flex items-start gap-2 mt-2 pt-2 border-t text-muted-foreground">
                            <FileText className="h-4 w-4 mt-0.5 shrink-0" />
                            <span className="line-clamp-2">{visit.notes}</span>
                        </div>
                    )}
                </div>

                <div className="pt-2 flex justify-between items-center border-t mt-2">
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <User className="h-3 w-3" />
                        {visit.user?.name || 'Unassigned'}
                    </div>
                    {actions}
                </div>
            </CardContent>
        </Card>
    )

    return (
        <UniversalTable
            title="Field Visits"
            description="Schedule and track sales field visits."
            endpoint="/sales-visits"
            service={visitsServiceAdapter}
            columns={columns}
            dataMapper={dataMapper}
            renderCard={renderCard}
            filters={filters}
            FormComponent={VisitFormWrapper}
        />
    )
}
