import { DashboardLayout } from "@/components/dashboard-layout"
import { PermissionGuard } from "@/components/auth/permission-guard"
import { CommissionRecoveryDashboard } from "@/components/commissions/commission-recovery-dashboard"

export default function CommissionsPage() {
  return (
    <DashboardLayout>
      <PermissionGuard permission="commissions" showError={true}>
        <CommissionRecoveryDashboard />
      </PermissionGuard>
    </DashboardLayout>
  )
}
