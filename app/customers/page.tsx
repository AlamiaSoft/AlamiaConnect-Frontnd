import { DashboardLayout } from "@/components/dashboard-layout"
import { CustomersTable } from "@/components/customers/customers-table"
import { OrganizationsTable } from "@/components/customers/organizations-table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

import { PermissionGuard } from "@/components/auth/permission-guard"

export default function CustomersPage() {
  return (
    <DashboardLayout>
      <PermissionGuard permission="contacts" showError={true}>
        <Tabs defaultValue="people" className="space-y-6">
          <div className="flex items-center justify-between">
            <TabsList>
              <TabsTrigger value="people">People</TabsTrigger>
              <TabsTrigger value="organizations">Organizations</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="people" className="border-none p-0 outline-none">
            <CustomersTable />
          </TabsContent>

          <TabsContent value="organizations" className="border-none p-0 outline-none">
            <OrganizationsTable />
          </TabsContent>
        </Tabs>
      </PermissionGuard>
    </DashboardLayout>
  )
}
