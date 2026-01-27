import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, ShoppingCart, Wrench, TrendingUp } from "lucide-react"

export function DashboardContent() {
  const stats = [
    {
      title: "Total Leads",
      value: "2,345",
      change: "+12.5%",
      icon: Users,
    },
    {
      title: "Active Sales",
      value: "₨8.5M",
      change: "+8.2%",
      icon: ShoppingCart,
    },
    {
      title: "Maintenance",
      value: "156",
      change: "-3.1%",
      icon: Wrench,
    },
    {
      title: "Inventory Value",
      value: "₨12.3M",
      change: "+5.4%",
      icon: TrendingUp,
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground mt-1">Welcome back to AlamiaConnect. Here's your overview.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground mt-1">
                <span className={stat.change.startsWith("+") ? "text-green-600" : "text-red-600"}>{stat.change}</span>{" "}
                from last month
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                "New lead: Ahmad Hassan - Karachi",
                "Sale completed: ₨450,000 - DHA Phase 5",
                "Maintenance request: Plot #234 - Lahore",
                "Inventory updated: 12 units added",
              ].map((activity, i) => (
                <div key={i} className="flex items-center gap-3 text-sm">
                  <div className="h-2 w-2 rounded-full bg-primary" />
                  <span>{activity}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {["Add New Lead", "Record Sale", "Create Maintenance Request", "Update Inventory"].map((action) => (
                <button
                  key={action}
                  className="w-full rounded-md border bg-muted/50 px-4 py-2 text-left text-sm hover:bg-muted transition-colors"
                >
                  {action}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
