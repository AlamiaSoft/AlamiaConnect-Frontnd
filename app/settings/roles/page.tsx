"use client"

import { RoleForm } from "./role-form"
import { SettingsService } from "@/services/settings-service"
import { UniversalTable, ColumnDef } from "@/components/shared/universal-table"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Breadcrumbs } from "@/components/ui/breadcrumbs"
import { Badge } from "@/components/ui/badge"

const columns: ColumnDef<any>[] = [
    { key: "id", header: "ID" },
    { key: "name", header: "Name" },
    { key: "permission_type", header: "Type" },
    { key: "description", header: "Description" },
]

export default function RolesSettingsPage() {
    const renderCard = (item: any, actions: React.ReactNode) => (
        <div className="rounded-lg border bg-card p-4 space-y-3">
            <div className="flex items-start justify-between">
                <div>
                    <h3 className="font-semibold text-lg">{item.name}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-2">{item.description}</p>
                </div>
                <Badge variant={item.permission_type === 'all' ? "default" : "secondary"}>
                    {item.permission_type === 'all' ? "All Access" : "Custom"}
                </Badge>
            </div>
            <div className="text-xs text-muted-foreground pt-2 border-t mt-2">
                ID: {item.id}
            </div>
            <div className="pt-2">
                {actions}
            </div>
        </div>
    )

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <Breadcrumbs items={[
                    { label: "Settings", href: "/settings" },
                    { label: "Roles" }
                ]} />

                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Roles & Permissions</h1>
                        <p className="text-muted-foreground mt-1">Manage user roles and access rights.</p>
                    </div>
                </div>

                <UniversalTable
                    title="Roles"
                    description="Manage system roles"
                    endpoint="/settings/roles"
                    service={{
                        getCollection: (params) => SettingsService.getRoles(),
                        delete: (id) => SettingsService.deleteRole(id),
                    }}
                    columns={columns}
                    FormComponent={RoleForm}
                    renderCard={renderCard}
                />
            </div>
        </DashboardLayout>
    )
}
