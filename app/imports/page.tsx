import { DashboardLayout } from "@/components/dashboard-layout"
import { PermissionGuard } from "@/components/auth/permission-guard"
import { ImportTracker } from "@/components/imports/import-tracker"

export default function ImportsPage() {
  return (
    <DashboardLayout>
      <PermissionGuard permission="settings.data_transfer.imports" showError={true}>
        <ImportTracker />
      </PermissionGuard>
    </DashboardLayout>
  )
}
