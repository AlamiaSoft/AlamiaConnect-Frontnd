"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import {
    Phone,
    Mail,
    Calendar,
    Briefcase,
    DollarSign,
    User,
} from "lucide-react"
import { LeadsService } from "@/services/leads-service"
import { UniversalTable, ColumnDef } from "@/components/shared/universal-table"

import { LeadForm } from "./lead-form"

// Adapter to match ServiceInterface
const leadsServiceAdapter = {
    getCollection: (params: any) => LeadsService.getLeads({
        ...params,
        include: 'user,person,stage,source,person.organization' // Corrected relationship
    }),
    search: (query: string, params: any) => LeadsService.getLeads({
        ...params,
        include: 'user,person,stage,source,person.organization',
        search: query
    }),
    delete: (id: string | number) => LeadsService.deleteLead(id),
}

// Wrapper to adapt LeadForm props
const LeadFormWrapper = ({ initialData, onSuccess, onCancel }: any) => (
    <LeadForm initialData={initialData} onSuccess={onSuccess} onCancel={onCancel} />
)

export function LeadsTable() {

    const getStatusColor = (status: string) => {
        const colors: Record<string, string> = {
            new: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
            contacted: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
            qualified: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
            proposal: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
            negotiation: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300",
            won: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300",
            lost: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
        }
        return (typeof status === 'string' ? status : String(status || '')).toLowerCase() in colors
            ? colors[(typeof status === 'string' ? status : String(status || '')).toLowerCase()]
            : "bg-gray-100 text-gray-800"
    }

    const columns: ColumnDef<any>[] = [
        {
            key: "id",
            header: "Lead ID",
            render: (lead) => <span className="text-sm font-mono text-muted-foreground">#{lead.id}</span>
        },
        {
            key: "name",
            header: "Contact",
            className: "min-w-[200px]",
            render: (lead) => (
                <Link href={`/leads/${lead.id}`} className="flex flex-col gap-1 group">
                    <span className="font-medium group-hover:text-primary transition-colors">{lead.person?.name || lead.title || 'Untitled'}</span>
                    <div className="flex gap-2 text-xs text-muted-foreground">
                        {lead.phone && (
                            <span className="flex items-center gap-1">
                                <Phone className="h-3 w-3" />
                                {lead.phone}
                            </span>
                        )}
                        {lead.email && (
                            <span className="flex items-center gap-1">
                                <Mail className="h-3 w-3" />
                                {lead.email}
                            </span>
                        )}
                    </div>
                </Link>
            )
        },
        {
            key: "company",
            header: "Company",
            render: (lead) => (
                <div className="flex items-center gap-2">
                    <Briefcase className="h-4 w-4 text-muted-foreground" />
                    <span>{lead.organization?.name || 'N/A'}</span>
                </div>
            )
        },
        {
            key: "status",
            header: "Status",
            render: (lead) => (
                <Badge variant="secondary" className={getStatusColor(lead.stage?.name || lead.status)}>
                    {lead.stage?.name || String(lead.status || 'New')}
                </Badge>
            )
        },
        {
            key: "source",
            header: "Source",
            render: (lead) => lead.source?.name || '-'
        },
        {
            key: "value",
            header: "Value",
            render: (lead) => (
                <div className="font-medium">
                    {lead.lead_value ? `PKR ${Number(lead.lead_value).toLocaleString()}` : '-'}
                </div>
            )
        },
        {
            key: "assignee",
            header: "Assignee",
            render: (lead) => (
                <div className="flex items-center gap-2 text-sm">
                    <User className="h-3.5 w-3.5 text-muted-foreground" />
                    <span>{lead.user?.name || 'Unassigned'}</span>
                </div>
            )
        },
        {
            key: "lastContact",
            header: "Last Contact",
            render: (lead) => (
                <span className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    {lead.created_at ? new Date(lead.created_at).toLocaleDateString() : '-'}
                </span>
            )
        }
    ]

    const dataMapper = (lead: any) => ({
        ...lead,
        phone: lead.person?.phone || lead.phone || (lead.person?.contact_numbers?.[0]?.value) || '-',
        email: lead.person?.email || lead.email || (lead.person?.emails?.[0]?.value) || '-',
        organization: lead.person?.organization // Flatten organization for easy access
    })

    // Custom logic for filtering (Generic text search)
    const clientFilter = (lead: any, query: string, filters: any) => {
        const lowerQuery = query.toLowerCase()
        const name = (lead.person?.name || lead.title || '').toLowerCase();
        const company = (lead.organization?.name || '').toLowerCase();

        return (
            name.includes(lowerQuery) ||
            company.includes(lowerQuery)
        )
    }

    const renderCard = (lead: any, actions: React.ReactNode) => {
        return (
            <Card className="hover:shadow-md transition-shadow h-full">
                <CardContent className="p-4 flex flex-col h-full justify-between">
                    <div className="space-y-3">
                        <div className="flex items-start justify-between">
                            <Link href={`/leads/${lead.id}`} className="group">
                                <h3 className="font-semibold text-lg group-hover:text-primary transition-colors">{lead.person?.name || lead.title || 'Untitled'}</h3>
                                <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                                    <Briefcase className="h-3.5 w-3.5" />
                                    <span>{lead.organization?.name || 'N/A'}</span>
                                </div>
                            </Link>
                            <Badge variant="secondary" className={getStatusColor(lead.stage?.name || lead.status)}>
                                {lead.stage?.name || lead.status || 'New'}
                            </Badge>
                        </div>

                        <div className="space-y-1">
                            <div className="flex items-center gap-2 text-sm">
                                <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                                <span>{lead.phone}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                                <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                                <span className="truncate">{lead.email}</span>
                            </div>
                        </div>

                        <div className="flex items-center justify-between pt-2 border-t mt-2">
                            <div className="flex items-center gap-1 font-semibold leading-none">
                                <DollarSign className="h-4 w-4 text-muted-foreground" />
                                <span>{lead.lead_value ? Number(lead.lead_value).toLocaleString() : '-'}</span>
                            </div>
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                <User className="h-3 w-3" />
                                {lead.user?.name || 'Unassigned'}
                            </div>
                        </div>
                    </div>
                    <div className="mt-4 pt-2 border-t">
                        {actions}
                    </div>
                </CardContent>
            </Card>
        )
    }

    // Defining filters prop for server-side filtering
    const filters = [
        {
            key: "status",
            label: "Status",
            options: [
                { label: "New", value: "new" },
                { label: "Contacted", value: "contacted" },
                { label: "Qualified", value: "qualified" },
                { label: "Proposal", value: "proposal" },
                { label: "Negotiation", value: "negotiation" },
                { label: "Won", value: "won" },
                { label: "Lost", value: "lost" },
            ]
        }
    ]

    return (
        <UniversalTable
            title="Leads"
            description="Manage and track all sales leads across regions"
            endpoint="/leads"
            service={leadsServiceAdapter}
            columns={columns}
            // FormComponent={LeadFormWrapper} // TODO: Implement LeadForm
            dataMapper={dataMapper}
            clientFilter={clientFilter}
            renderCard={renderCard}
            searchPlaceholder="Search leads..."
            filters={filters}
            FormComponent={LeadFormWrapper}
        />
    )
}
