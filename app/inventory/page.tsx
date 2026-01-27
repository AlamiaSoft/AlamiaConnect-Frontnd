import { DashboardLayout } from "@/components/dashboard-layout"
import { PermissionGuard } from "@/components/auth/permission-guard"
import InventoryDashboard from "@/components/inventory/inventory-dashboard"
import { ProductsTable } from "@/components/inventory/products-table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function InventoryPage() {
  return (
    <DashboardLayout>
      <PermissionGuard permission="inventory" showError={true}>
        <Tabs defaultValue="dashboard" className="space-y-4">
          <div className="flex items-center justify-between">
            <TabsList>
              <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
              <TabsTrigger value="products">Products</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="dashboard" className="space-y-4">
            <InventoryDashboard />
          </TabsContent>
          <TabsContent value="products" className="space-y-4">
            <ProductsTable />
          </TabsContent>
        </Tabs>
      </PermissionGuard>
    </DashboardLayout>
  )
}
