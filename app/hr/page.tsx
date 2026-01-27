import { DashboardLayout } from "@/components/dashboard-layout"
import { PermissionGuard } from "@/components/auth/permission-guard"
import { HRDashboard } from "@/components/hr/hr-dashboard"

export default function HRPage() {
  return (
    <DashboardLayout>
      <PermissionGuard permission="hr" showError={true}>
        <HRDashboard />
      </PermissionGuard>
    </DashboardLayout>
  )
}
