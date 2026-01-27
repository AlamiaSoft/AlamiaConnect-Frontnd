"use client"

import { LeadSourceForm } from "./source-form"
import { SettingsService } from "@/services/settings-service"
import { UniversalTable, ColumnDef } from "@/components/shared/universal-table"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Breadcrumbs } from "@/components/ui/breadcrumbs"

const columns: ColumnDef<any>[] = [
    { key: "id", header: "ID" },
    { key: "name", header: "Name" },
    { key: "created_at", header: "Created At" },
]

export default function LeadSourcesPage() {
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
                    { label: "Sources" }
                ]} />

                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Lead Sources</h1>
                        <p className="text-muted-foreground mt-1">Manage where your leads come from.</p>
                    </div>
                </div>

                <UniversalTable
                    title="Lead Sources"
                    description="Manage where your leads come from"
                    endpoint="/settings/sources"
                    service={{
                        getCollection: (params) => SettingsService.getSources(),
                        delete: (id) => SettingsService.delete(`/settings/sources/${id}`),
                    }}
                    columns={columns}
                    FormComponent={LeadSourceForm}
                    renderCard={renderCard}
                />
            </div>
        </DashboardLayout>
    )
}
