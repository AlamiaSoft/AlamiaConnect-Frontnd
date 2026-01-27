"use client"

import { LeadTypeForm } from "./type-form"
import { SettingsService } from "@/services/settings-service"
import { UniversalTable, ColumnDef } from "@/components/shared/universal-table"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Breadcrumbs } from "@/components/ui/breadcrumbs"

const columns: ColumnDef<any>[] = [
    { key: "id", header: "ID" },
    { key: "name", header: "Name" },
    { key: "created_at", header: "Created At" },
]

export default function LeadTypesPage() {
    const renderCard = (item: any, actions: React.ReactNode) => (
        <div className="rounded-lg border bg-card p-4 space-y-3">
            <div className="flex items-start justify-between">
                <div>
                    <h3 className="font-semibold text-lg">{item.name}</h3>
                    <p className="text-sm text-muted-foreground">ID: {item.id}</p>
                </div>
            </div>
            <div className="text-xs text-muted-foreground">
                Created: {new Date(item.created_at).toLocaleDateString()}
            </div>
            <div className="pt-2 border-t">
                {actions}
            </div>
        </div>
    )

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <Breadcrumbs items={[
                    { label: "Settings", href: "/settings" },
                    { label: "Leads", href: "/settings" },
                    { label: "Types" }
                ]} />

                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Lead Types</h1>
                        <p className="text-muted-foreground mt-1">Categorize your leads by type.</p>
                    </div>
                </div>

                <UniversalTable
                    title="Lead Types"
                    description="Categorize your leads by type"
                    endpoint="/settings/types"
                    service={{
                        getCollection: (params) => SettingsService.getTypes(),
                        delete: (id) => SettingsService.delete(`/settings/types/${id}`),
                    }}
                    columns={columns}
                    FormComponent={LeadTypeForm}
                    renderCard={renderCard}
                />
            </div>
        </DashboardLayout>
    )
}
