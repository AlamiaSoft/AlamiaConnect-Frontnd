"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
    Building2,
    MapPin,
    Phone,
    Globe,
    Mail,
} from "lucide-react"
import { OrganizationsService } from "@/services/contacts-service"
import { OrganizationForm } from "./organization-form"
import { UniversalTable, ColumnDef } from "@/components/shared/universal-table"

// Adapter to match ServiceInterface
const organizationsServiceAdapter = {
    getCollection: (params: any) => OrganizationsService.getOrganizations(params),
    search: (query: string, params: any) => OrganizationsService.searchOrganizations(query, params),
    delete: (id: string | number) => OrganizationsService.deleteOrganization(id),
}

// Wrapper to adapt OrganizationForm props
const OrganizationFormWrapper = ({ initialData, onSuccess, onCancel }: any) => (
    <OrganizationForm organization={initialData} onSuccess={onSuccess} onCancel={onCancel} />
)

export function OrganizationsTable() {

    const columns: ColumnDef<any>[] = [
        {
            key: "name",
            header: "Name",
            className: "font-medium",
            render: (org) => (
                <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-muted-foreground" />
                    <span>{org.name}</span>
                </div>
            )
        },
        {
            key: "contact",
            header: "Contact Info",
            render: (org) => (
                <div className="space-y-1">
                    {org.email && (
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Mail className="h-3 w-3" />
                            {org.email}
                        </div>
                    )}
                    {org.phone && (
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Phone className="h-3 w-3" />
                            {org.phone}
                        </div>
                    )}
                </div>
            )
        },
        {
            key: "address",
            header: "Address",
            render: (org) => {
                const addressStr = typeof org.address === 'string' ? org.address : (Array.isArray(org.address) && org.address.length > 0 ? org.address[0].address : "N/A")
                return (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <MapPin className="h-3.5 w-3.5" />
                        <span className="truncate max-w-[200px]">{addressStr}</span>
                    </div>
                )
            }
        },
        {
            key: "website",
            header: "Website",
            render: (org) => org.website && (
                <a
                    href={org.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm text-blue-600 hover:underline"
                >
                    <Globe className="h-3.5 w-3.5" />
                    Visit
                </a>
            )
        }
    ]

    const dataMapper = (org: any) => ({
        ...org,
        // Ensure properties exist for cleaner rendering if API returns differently
        email: org.email || '',
        phone: org.phone || '',
        website: org.website || '',
        address: org.addresses || org.address || []
    })

    // Custom filter for client-side search feedback
    const clientFilter = (org: any, query: string, filters: any) => {
        const lowerQuery = query.toLowerCase()
        return (
            org.name.toLowerCase().includes(lowerQuery) ||
            (org.email && org.email.toLowerCase().includes(lowerQuery)) ||
            (org.phone && org.phone.includes(query))
        )
    }

    const renderCard = (org: any, actions: React.ReactNode) => {
        const addressStr = typeof org.address === 'string' ? org.address : (Array.isArray(org.address) && org.address.length > 0 ? org.address[0].address : "N/A")

        return (
            <Card className="hover:shadow-md transition-shadow h-full">
                <CardContent className="p-4 flex flex-col h-full justify-between">
                    <div className="space-y-2">
                        <div className="flex items-start justify-between gap-4">
                            <div className="flex-1 min-w-0">
                                <h3 className="font-semibold text-lg truncate">{org.name}</h3>
                                {addressStr !== "N/A" && (
                                    <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                                        <MapPin className="h-3.5 w-3.5" />
                                        <span className="truncate">{addressStr}</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="grid gap-1 text-sm text-muted-foreground mt-4">
                            {org.email && (
                                <div className="flex items-center gap-2">
                                    <Mail className="h-3.5 w-3.5" />
                                    <span>{org.email}</span>
                                </div>
                            )}
                            {org.phone && (
                                <div className="flex items-center gap-2">
                                    <Phone className="h-3.5 w-3.5" />
                                    <span>{org.phone}</span>
                                </div>
                            )}
                            {org.website && (
                                <div className="flex items-center gap-2">
                                    <Globe className="h-3.5 w-3.5" />
                                    <a href={org.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline truncate">
                                        {org.website.replace(/^https?:\/\//, '')}
                                    </a>
                                </div>
                            )}
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
            title="Organizations"
            description="Manage your customer companies and partners"
            endpoint="/contacts/organizations"
            service={organizationsServiceAdapter}
            columns={columns}
            FormComponent={OrganizationFormWrapper}
            dataMapper={dataMapper}
            clientFilter={clientFilter}
            renderCard={renderCard}
            searchPlaceholder="Search organizations..."
        />
    )
}
