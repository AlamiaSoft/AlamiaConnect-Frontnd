import { DashboardLayout } from "@/components/dashboard-layout"
import { PermissionGuard } from "@/components/auth/permission-guard"
import { SalesDashboard } from "@/components/sales/sales-dashboard"

export default function SalesPage() {
  return (
    <DashboardLayout>
      <PermissionGuard permission="sales" showError={true}>
        <SalesDashboard />
      </PermissionGuard>
    </DashboardLayout>
  )
}
