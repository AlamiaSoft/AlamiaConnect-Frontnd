"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { DollarSign, TrendingUp, ShoppingCart, Clock, Plus } from "lucide-react"
import Link from "next/link"
import useSWR from "swr"
import api from "@/lib/api"
import { deserialize } from "@/lib/json-api"
import { SalesTable } from "./sales-table"

const fetcher = (url: string) => api.get(url).then(res => deserialize(res.data))

// Mock data removed in favor of API

const statusColors: any = {
  closed: "bg-emerald-100 text-emerald-700 border-emerald-200",
  released: "bg-emerald-100 text-emerald-700 border-emerald-200",
  pending: "bg-amber-100 text-amber-700 border-amber-200",
  negotiation: "bg-blue-100 text-blue-700 border-blue-200",
  partial: "bg-blue-100 text-blue-700 border-blue-200",
}

export function SalesDashboard() {
  const { data: remoteInvoices } = useSWR('/sales-invoices', fetcher)

  const salesData: any[] = remoteInvoices ? remoteInvoices.map((inv: any) => ({
    id: inv.invoice_number,
    customer: inv.customer_name || 'Unknown',
    machinery: inv.machineryCategory || 'Default',
    amount: Number(inv.total_amount),
    status: (inv.commissionStatus === 'Released' ? 'closed' : (inv.commissionStatus === 'Partial' ? 'negotiation' : 'pending')),
    date: inv.date || new Date().toISOString(),
    executive: inv.sales_manager || 'Unknown',
    region: 'Karachi'
  })) : []

  const totalRevenue = salesData.filter((sale) => sale.status === "closed").reduce((sum, sale) => sum + sale.amount, 0)
  const totalDeals = salesData.length
  const closedDeals = salesData.filter((sale) => sale.status === "closed").length
  const pendingDeals = salesData.filter((sale) => sale.status === "pending").length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-balance">Sales Management</h1>
          <p className="mt-1 text-muted-foreground text-pretty">
            Track and manage all machinery sales and deals across regions
          </p>
        </div>
        <Link href="/sales-inquiry">
          <Button size="lg" className="gap-2">
            <Plus className="h-4 w-4" />
            New Sales Inquiry
          </Button>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">PKR {(totalRevenue / 1000000).toFixed(1)}M</div>
            <p className="mt-1 text-xs text-muted-foreground">From closed deals</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Deals</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalDeals}</div>
            <p className="mt-1 text-xs text-muted-foreground">All active sales</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Closed Deals</CardTitle>
            <TrendingUp className="h-4 w-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600">{closedDeals}</div>
            <p className="mt-1 text-xs text-muted-foreground">
              {((closedDeals / totalDeals) * 100).toFixed(0)}% success rate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pending Deals</CardTitle>
            <Clock className="h-4 w-4 text-amber-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">{pendingDeals}</div>
            <p className="mt-1 text-xs text-muted-foreground">Awaiting action</p>
          </CardContent>
        </Card>
      </div>

      {/* Sales Table */}
      <SalesTable />
    </div>
  )
}
