"use client"

import { UserForm } from "./user-form"
import { SettingsService } from "@/services/settings-service"
import { UniversalTable, ColumnDef } from "@/components/shared/universal-table"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Breadcrumbs } from "@/components/ui/breadcrumbs"
import { Badge } from "@/components/ui/badge"

const columns: ColumnDef<any>[] = [
    { key: "id", header: "ID" },
    { key: "name", header: "Name" },
    { key: "email", header: "Email" },
    { key: "status", header: "Status" },
    { key: "created_at", header: "Created At" },
]

export default function UsersSettingsPage() {
    const renderCard = (item: any, actions: React.ReactNode) => (
        <div className="rounded-lg border bg-card p-4 space-y-3">
            <div className="flex items-start justify-between">
                <div>
                    <h3 className="font-semibold text-lg">{item.name}</h3>
                    <p className="text-sm text-muted-foreground">{item.email}</p>
                </div>
                <Badge variant={item.status ? "default" : "destructive"}>
                    {item.status ? "Active" : "Inactive"}
                </Badge>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                <div className="col-span-2">
                    <span className="font-semibold">Role:</span> {item.role?.name || item.role_id}
                </div>
                <div>ID: {item.id}</div>
                <div>Created: {new Date(item.created_at).toLocaleDateString()}</div>
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
                    { label: "Users" }
                ]} />

                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Users</h1>
                        <p className="text-muted-foreground mt-1">Manage system users and their access.</p>
                    </div>
                </div>

                <UniversalTable
                    title="Users"
                    description="Manage system users"
                    endpoint="/settings/users"
                    service={{
                        getCollection: (params) => SettingsService.getUsers(),
                        delete: (id) => SettingsService.deleteUser(id),
                    }}
                    columns={columns}
                    FormComponent={UserForm}
                    renderCard={renderCard}
                />
            </div>
        </DashboardLayout>
    )
}
