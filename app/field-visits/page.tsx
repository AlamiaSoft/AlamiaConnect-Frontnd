
"use client"

import DashboardLayout from "@/components/dashboard-layout"
import { VisitsTable } from "@/components/field-visits/visits-table"
import { Breadcrumbs } from "@/components/ui/breadcrumbs"

import { PermissionGuard } from "@/components/auth/permission-guard"

export default function FieldVisitsPage() {
  return (
    <DashboardLayout>
      <PermissionGuard permission="activities" showError={true}>
        <div className="space-y-6">
          <Breadcrumbs items={[
            { label: "Dashboard", href: "/" },
            { label: "Sales" },
            { label: "Field Visits" }
          ]} />
          <VisitsTable />
        </div>
      </PermissionGuard>
    </DashboardLayout>
  )
}
