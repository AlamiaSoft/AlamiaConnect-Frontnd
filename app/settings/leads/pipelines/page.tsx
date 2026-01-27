"use client"

import { PipelineForm } from "./pipeline-form"
import { SettingsService } from "@/services/settings-service"
import { UniversalTable, ColumnDef } from "@/components/shared/universal-table"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Breadcrumbs } from "@/components/ui/breadcrumbs"

const columns: ColumnDef<any>[] = [
    { key: "id", header: "ID" },
    { key: "name", header: "Name" },
    { key: "is_default", header: "Default" },
    { key: "rotten_days", header: "Rotten Days" },
    { key: "created_at", header: "Created At" },
]

export default function PipelinesSettingsPage() {
    const renderCard = (item: any, actions: React.ReactNode) => (
        <div className="rounded-lg border bg-card p-4 space-y-3">
            <div className="flex items-start justify-between">
                <div>
                    <h3 className="font-semibold text-lg">{item.name}</h3>
                    <p className="text-sm text-muted-foreground">ID: {item.id}</p>
                </div>
                {item.is_default && (
                    <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">Default</span>
                )}
            </div>
            <div className="flex gap-4 text-sm">
                <div>
                    <span className="text-muted-foreground">Rotten Days:</span>
                    <span className="ml-1 font-medium">{item.rotten_days || 'N/A'}</span>
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
                    { label: "Pipelines" }
                ]} />

                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Pipelines & Stages</h1>
                        <p className="text-muted-foreground mt-1">Configure your sales processes and deal stages.</p>
                    </div>
                </div>

                <UniversalTable
                    title="Pipelines"
                    description="Configure your sales processes and deal stages"
                    endpoint="/settings/pipelines"
                    service={{
                        getCollection: (params) => SettingsService.getPipelines(),
                        delete: (id) => SettingsService.delete(`/settings/pipelines/${id}`),
                    }}
                    columns={columns}
                    FormComponent={PipelineForm}
                    renderCard={renderCard}
                />
            </div>
        </DashboardLayout>
    )
}
