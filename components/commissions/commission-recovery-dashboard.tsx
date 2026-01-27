"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { DollarSign, Calculator, CheckCircle, Clock, AlertCircle } from "lucide-react"
import useSWR from "swr"
import api from "@/lib/api"
import { deserialize } from "@/lib/json-api"

const fetcher = (url: string) => api.get(url).then(res => deserialize(res.data))

interface Invoice {
  id: string
  invoiceNumber: string
  customerName: string
  totalAmount: number
  amountReceived: number
  commissionStatus: "Pending" | "Partial" | "Released"
  salesManager: string
  machineryCategory: string
  date: string
}

// Mock data removed in favor of API

const commissionTiers: Record<string, number> = {
  "CNC Machine": 2.5,
  "Lathe Machine": 2.0,
  "Heavy Drill": 2.2,
  "Industrial Sewing": 1.8,
  Default: 2.0,
}

export function CommissionRecoveryDashboard() {
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null)
  const [showCalculator, setShowCalculator] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")

  const { data: remoteInvoices } = useSWR('/sales-invoices', fetcher)

  const invoices: Invoice[] = remoteInvoices ? remoteInvoices.map((inv: any) => ({
    id: inv.id,
    invoiceNumber: inv.invoice_number,
    customerName: inv.customer_name || 'Unknown',
    totalAmount: Number(inv.total_amount),
    amountReceived: Number(inv.amount_received),
    commissionStatus: inv.commissionStatus || 'Pending',
    salesManager: inv.sales_manager || 'Unknown',
    machineryCategory: inv.machineryCategory || 'Default',
    date: inv.date || new Date().toISOString()
  })) : []

  const calculateCommission = (invoice: Invoice) => {
    const recoveryPercentage = (invoice.amountReceived / invoice.totalAmount) * 100
    const tierRate = commissionTiers[invoice.machineryCategory] || commissionTiers["Default"]

    if (recoveryPercentage === 100) {
      return invoice.totalAmount * (tierRate / 100)
    } else if (recoveryPercentage >= 75) {
      return invoice.amountReceived * ((tierRate * 0.75) / 100)
    } else if (recoveryPercentage >= 50) {
      return invoice.amountReceived * ((tierRate * 0.5) / 100)
    }
    return 0
  }

  const filteredInvoices = invoices.filter((invoice) => {
    const matchesSearch =
      invoice.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.salesManager.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter === "all" || invoice.commissionStatus === statusFilter

    return matchesSearch && matchesStatus
  })

  const totalPendingCommission = invoices
    .filter((inv) => inv.commissionStatus === "Pending" && inv.amountReceived === inv.totalAmount)
    .reduce((sum, inv) => sum + calculateCommission(inv), 0)

  const totalReleased = invoices
    .filter((inv) => inv.commissionStatus === "Released")
    .reduce((sum, inv) => sum + calculateCommission(inv), 0)

  const handleReleaseCommission = (invoice: Invoice) => {
    alert(
      `Commission release request sent to Finance/HR for ${invoice.salesManager}\nInvoice: ${invoice.invoiceNumber}\nAmount: PKR ${calculateCommission(invoice).toLocaleString()}`,
    )
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Released":
        return <CheckCircle className="h-4 w-4" />
      case "Partial":
        return <Clock className="h-4 w-4" />
      case "Pending":
        return <AlertCircle className="h-4 w-4" />
      default:
        return null
    }
  }

  const getStatusVariant = (status: string): "default" | "secondary" | "destructive" | "outline" => {
    switch (status) {
      case "Released":
        return "default"
      case "Partial":
        return "secondary"
      case "Pending":
        return "outline"
      default:
        return "outline"
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Commission & Recovery</h1>
        <p className="text-muted-foreground">Track payment recoveries and manage sales commissions</p>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Commissions</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">PKR {totalPendingCommission.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Ready for release</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Released This Month</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">PKR {totalReleased.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Processed to payroll</p>
          </CardContent>
        </Card>

        <Card className="cursor-pointer transition-colors hover:bg-accent" onClick={() => setShowCalculator(true)}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Commission Calculator</CardTitle>
            <Calculator className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-sm font-medium">Click to calculate</div>
            <p className="text-xs text-muted-foreground">Tier-based commission rates</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle>Invoice Recoveries</CardTitle>
          <CardDescription>Manage commission releases based on payment recovery status</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="flex-1">
              <Input
                placeholder="Search by invoice, customer, or sales manager..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="Pending">Pending</SelectItem>
                <SelectItem value="Partial">Partial</SelectItem>
                <SelectItem value="Released">Released</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Invoice #</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Sales Manager</TableHead>
                  <TableHead className="text-right">Total Amount</TableHead>
                  <TableHead className="text-right">Received</TableHead>
                  <TableHead className="text-right">Recovery %</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Commission</TableHead>
                  <TableHead className="text-center">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredInvoices.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center text-muted-foreground">
                      No invoices found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredInvoices.map((invoice) => {
                    const recoveryPercent = (invoice.amountReceived / invoice.totalAmount) * 100
                    const commission = calculateCommission(invoice)

                    return (
                      <TableRow key={invoice.id}>
                        <TableCell className="font-medium">{invoice.invoiceNumber}</TableCell>
                        <TableCell>{invoice.customerName}</TableCell>
                        <TableCell>{invoice.salesManager}</TableCell>
                        <TableCell className="text-right">PKR {invoice.totalAmount.toLocaleString()}</TableCell>
                        <TableCell className="text-right">PKR {invoice.amountReceived.toLocaleString()}</TableCell>
                        <TableCell className="text-right">
                          <span className={recoveryPercent === 100 ? "font-semibold text-green-600" : ""}>
                            {recoveryPercent.toFixed(0)}%
                          </span>
                        </TableCell>
                        <TableCell>
                          <Badge variant={getStatusVariant(invoice.commissionStatus)} className="gap-1">
                            {getStatusIcon(invoice.commissionStatus)}
                            {invoice.commissionStatus}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right font-medium">PKR {commission.toLocaleString()}</TableCell>
                        <TableCell className="text-center">
                          {invoice.commissionStatus === "Pending" && recoveryPercent === 100 && (
                            <Button size="sm" onClick={() => handleReleaseCommission(invoice)}>
                              Release
                            </Button>
                          )}
                          {invoice.commissionStatus === "Partial" && (
                            <Button size="sm" variant="outline" disabled>
                              Partial Pay
                            </Button>
                          )}
                          {invoice.commissionStatus === "Released" && (
                            <span className="text-xs text-muted-foreground">Processed</span>
                          )}
                        </TableCell>
                      </TableRow>
                    )
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Commission Calculator Side Panel */}
      <Sheet open={showCalculator} onOpenChange={setShowCalculator}>
        <SheetContent className="sm:max-w-md">
          <SheetHeader>
            <SheetTitle>Commission Calculator</SheetTitle>
            <SheetDescription>
              Calculate commission based on recovery percentage and machinery category
            </SheetDescription>
          </SheetHeader>

          <div className="mt-6 space-y-6">
            <div className="rounded-lg border bg-muted/50 p-4">
              <h3 className="mb-3 font-semibold">Commission Tiers</h3>
              <div className="space-y-2 text-sm">
                {Object.entries(commissionTiers).map(([category, rate]) => (
                  <div key={category} className="flex justify-between">
                    <span className="text-muted-foreground">{category}</span>
                    <span className="font-medium">{rate}%</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-lg border bg-muted/50 p-4">
              <h3 className="mb-3 font-semibold">Recovery Rules</h3>
              <div className="space-y-2 text-sm">
                <div className="flex items-start gap-2">
                  <CheckCircle className="mt-0.5 h-4 w-4 text-green-600" />
                  <div>
                    <p className="font-medium">100% Recovery</p>
                    <p className="text-muted-foreground">Full tier rate applied</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <Clock className="mt-0.5 h-4 w-4 text-amber-600" />
                  <div>
                    <p className="font-medium">75-99% Recovery</p>
                    <p className="text-muted-foreground">75% of tier rate</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <AlertCircle className="mt-0.5 h-4 w-4 text-orange-600" />
                  <div>
                    <p className="font-medium">50-74% Recovery</p>
                    <p className="text-muted-foreground">50% of tier rate</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Select Invoice to Calculate</Label>
                <Select
                  value={selectedInvoice?.id || ""}
                  onValueChange={(value) => {
                    const invoice = invoices.find((inv) => inv.id === value)
                    setSelectedInvoice(invoice || null)
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Choose an invoice" />
                  </SelectTrigger>
                  <SelectContent>
                    {invoices.map((invoice) => (
                      <SelectItem key={invoice.id} value={invoice.id}>
                        {invoice.invoiceNumber} - {invoice.customerName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedInvoice && (
                <div className="rounded-lg border bg-primary/5 p-4 space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Category:</span>
                    <span className="font-medium">{selectedInvoice.machineryCategory}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Tier Rate:</span>
                    <span className="font-medium">
                      {commissionTiers[selectedInvoice.machineryCategory] || commissionTiers["Default"]}%
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Recovery:</span>
                    <span className="font-medium">
                      {((selectedInvoice.amountReceived / selectedInvoice.totalAmount) * 100).toFixed(0)}%
                    </span>
                  </div>
                  <div className="border-t pt-3 flex justify-between">
                    <span className="font-semibold">Commission:</span>
                    <span className="text-lg font-bold text-primary">
                      PKR {calculateCommission(selectedInvoice).toLocaleString()}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  )
}
