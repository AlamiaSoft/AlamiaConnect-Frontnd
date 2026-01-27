import { DashboardLayout } from "@/components/dashboard-layout"
import { PermissionGuard } from "@/components/auth/permission-guard"
import { ServiceInstallationDashboard } from "@/components/service/service-installation-dashboard"

export default function ServiceInstallationPage() {
  return (
    <DashboardLayout>
      <PermissionGuard permission="service" showError={true}>
        <ServiceInstallationDashboard />
      </PermissionGuard>
    </DashboardLayout>
  )
}
