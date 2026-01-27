"use client"

import { DashboardLayout } from "@/components/dashboard-layout"
import { PermissionGuard } from "@/components/auth/permission-guard"
import { MaintenanceDashboard } from "@/components/maintenance/maintenance-dashboard"

export default function MaintenancePage() {
  return (
    <DashboardLayout>
      <PermissionGuard permission="maintenance" showError={true}>
        <MaintenanceDashboard />
      </PermissionGuard>
    </DashboardLayout>
  )
}
