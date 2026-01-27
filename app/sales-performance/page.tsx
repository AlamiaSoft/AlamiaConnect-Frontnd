import { DashboardLayout } from "@/components/dashboard-layout"
import { PermissionGuard } from "@/components/auth/permission-guard"
import { SalesPerformanceDashboard } from "@/components/sales/sales-performance-dashboard"

export default function SalesPerformancePage() {
  return (
    <DashboardLayout>
      <PermissionGuard permission="sales_performance" showError={true}>
        <SalesPerformanceDashboard />
      </PermissionGuard>
    </DashboardLayout>
  )
}
