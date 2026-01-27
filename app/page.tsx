import { DashboardLayout } from "@/components/dashboard-layout"
import { PermissionGuard } from "@/components/auth/permission-guard"
import { DashboardContent } from "@/components/dashboard-content"

export default function Page() {
  return (
    <DashboardLayout>
      <PermissionGuard permission="dashboard" showError={true}>
        <DashboardContent />
      </PermissionGuard>
    </DashboardLayout>
  )
}
