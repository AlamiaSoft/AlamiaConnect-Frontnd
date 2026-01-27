"use client"

import DashboardLayout from "@/components/dashboard-layout"
import { LeadsTable } from "@/components/leads/leads-table"
import { Breadcrumbs } from "@/components/ui/breadcrumbs"

import { PermissionGuard } from "@/components/auth/permission-guard"

export default function LeadsPage() {
  return (
    <DashboardLayout>
      <PermissionGuard permission="leads" showError={true}>
        <div className="space-y-6">
          <Breadcrumbs items={[
            { label: "Dashboard", href: "/" },
            { label: "Leads" }
          ]} />
          <LeadsTable />
        </div>
      </PermissionGuard>
    </DashboardLayout>
  )
}
