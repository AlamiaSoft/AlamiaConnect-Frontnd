"use client"

import DashboardLayout from "@/components/dashboard-layout"
import { LeadsPipeline } from "@/components/leads/leads-pipeline-view"

import { PermissionGuard } from "@/components/auth/permission-guard"

export default function LeadsPage() {
  return (
    <DashboardLayout>
      <PermissionGuard permission="leads" showError={true}>
        <LeadsPipeline />
      </PermissionGuard>
    </DashboardLayout>
  )
}
