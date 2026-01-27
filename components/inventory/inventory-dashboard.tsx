"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Package,
  Search,
  AlertTriangle,
  TrendingDown,
  Download,
  Upload,
  Plus,
  LayoutGrid,
  List,
  TableIcon,
  Eye,
  Calendar,
  Wrench,
  Shield,
  Package2,
} from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"

interface SerialNumberItem {
  id: string
  serialNumber: string
  machineName: string
  category: string
  brand: string
  location: string
  status: "Available" | "Sold" | "In Service" | "Reserved"
  unitPrice: number
  purchaseDate: string
  salesDate?: string
  customerName?: string
  installationDate?: string
  installationLocation?: string
  warrantyStatus: "Active" | "Expired" | "Expiring Soon"
  warrantyExpiry: string
  serviceHistory: Array<{
    date: string
    type: "Maintenance" | "Repair" | "Inspection"
    description: string
    technician: string
    cost: number
  }>
  lastUpdated: string
}

export default function InventoryDashboard() {
  const [searchTerm, setSearchTerm] = useState("")
  const [filterCategory, setFilterCategory] = useState("all")
  const [filterStatus, setFilterStatus] = useState("all")
  const [filterWarranty, setFilterWarranty] = useState("all")
  const [viewMode, setViewMode] = useState<"table" | "list" | "grid">("table")
  const [selectedItem, setSelectedItem] = useState<SerialNumberItem | null>(null)
  const [showTimeline, setShowTimeline] = useState(false)

  const inventoryStats = [
    { label: "Total Units", value: "847", icon: Package, color: "text-blue-600" },
    { label: "Available", value: "423", icon: Package2, color: "text-green-600" },
    { label: "Sold", value: "389", icon: TrendingDown, color: "text-purple-600" },
    { label: "Warranty Expiring", value: "35", icon: AlertTriangle, color: "text-orange-600" },
  ]

  const serialNumberItems: SerialNumberItem[] = [
    {
      id: "1",
      serialNumber: "CNC-2024-001-A1",
      machineName: "CNC Milling Machine",
      category: "CNC Machines",
      brand: "Haas",
      location: "Karachi Warehouse",
      status: "Available",
      unitPrice: 2500000,
      purchaseDate: "2024-01-15",
      warrantyStatus: "Active",
      warrantyExpiry: "2027-01-15",
      serviceHistory: [],
      lastUpdated: "2024-01-15",
    },
    {
      id: "2",
      serialNumber: "LTH-2024-015-B3",
      machineName: "Heavy Duty Lathe",
      category: "Lathes",
      brand: "DMG MORI",
      location: "Ahmed Steel Works",
      status: "Sold",
      unitPrice: 1800000,
      purchaseDate: "2023-11-20",
      salesDate: "2024-01-10",
      customerName: "Ahmed Steel Works",
      installationDate: "2024-01-18",
      installationLocation: "Lahore Industrial Estate",
      warrantyStatus: "Active",
      warrantyExpiry: "2026-11-20",
      serviceHistory: [
        {
          date: "2024-03-15",
          type: "Maintenance",
          description: "Routine 3-month maintenance check",
          technician: "Ali Hassan",
          cost: 15000,
        },
        {
          date: "2024-05-22",
          type: "Repair",
          description: "Replaced hydraulic pump",
          technician: "Ahmed Khan",
          cost: 45000,
        },
      ],
      lastUpdated: "2024-05-22",
    },
    {
      id: "3",
      serialNumber: "DRL-2024-032-C5",
      machineName: "Radial Drilling Machine",
      category: "Drills",
      brand: "Fanuc",
      location: "Precision Metals Ltd",
      status: "Sold",
      unitPrice: 850000,
      purchaseDate: "2023-09-10",
      salesDate: "2023-12-05",
      customerName: "Precision Metals Ltd",
      installationDate: "2023-12-12",
      installationLocation: "Islamabad Industrial Zone",
      warrantyStatus: "Expiring Soon",
      warrantyExpiry: "2024-09-10",
      serviceHistory: [
        {
          date: "2024-02-10",
          type: "Inspection",
          description: "Annual safety inspection",
          technician: "Bilal Ahmed",
          cost: 8000,
        },
      ],
      lastUpdated: "2024-02-10",
    },
    {
      id: "4",
      serialNumber: "GRN-2024-008-D2",
      machineName: "Surface Grinding Machine",
      category: "Grinding",
      brand: "Okuma",
      location: "Karachi Warehouse",
      status: "Reserved",
      unitPrice: 1200000,
      purchaseDate: "2024-01-03",
      warrantyStatus: "Active",
      warrantyExpiry: "2027-01-03",
      serviceHistory: [],
      lastUpdated: "2024-01-03",
    },
    {
      id: "5",
      serialNumber: "WLD-2024-021-E7",
      machineName: "MIG Welding Machine",
      category: "Welding",
      brand: "Lincoln Electric",
      location: "National Fabricators",
      status: "Sold",
      unitPrice: 450000,
      purchaseDate: "2023-08-15",
      salesDate: "2023-10-20",
      customerName: "National Fabricators",
      installationDate: "2023-10-25",
      installationLocation: "Faisalabad Manufacturing Hub",
      warrantyStatus: "Expired",
      warrantyExpiry: "2024-08-15",
      serviceHistory: [
        {
          date: "2024-01-10",
          type: "Maintenance",
          description: "Cleaning and calibration",
          technician: "Hassan Ali",
          cost: 5000,
        },
        {
          date: "2024-04-05",
          type: "Repair",
          description: "Replaced welding torch",
          technician: "Usman Shah",
          cost: 12000,
        },
      ],
      lastUpdated: "2024-04-05",
    },
    {
      id: "6",
      serialNumber: "PRS-2024-012-F4",
      machineName: "Hydraulic Press",
      category: "Presses",
      brand: "Schuler",
      location: "Karachi Warehouse",
      status: "Available",
      unitPrice: 3200000,
      purchaseDate: "2024-01-07",
      warrantyStatus: "Active",
      warrantyExpiry: "2027-01-07",
      serviceHistory: [],
      lastUpdated: "2024-01-07",
    },
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Available":
        return "bg-green-100 text-green-800 border-green-200"
      case "Sold":
        return "bg-purple-100 text-purple-800 border-purple-200"
      case "In Service":
        return "bg-orange-100 text-orange-800 border-orange-200"
      case "Reserved":
        return "bg-blue-100 text-blue-800 border-blue-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getWarrantyColor = (status: string) => {
    switch (status) {
      case "Active":
        return "bg-green-100 text-green-800 border-green-200"
      case "Expiring Soon":
        return "bg-orange-100 text-orange-800 border-orange-200"
      case "Expired":
        return "bg-red-100 text-red-800 border-red-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const filteredItems = serialNumberItems.filter((item) => {
    const matchesSearch =
      item.machineName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.serialNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.customerName?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = filterCategory === "all" || item.category === filterCategory
    const matchesStatus = filterStatus === "all" || item.status === filterStatus
    const matchesWarranty = filterWarranty === "all" || item.warrantyStatus === filterWarranty
    return matchesSearch && matchesCategory && matchesStatus && matchesWarranty
  })

  const handleViewTimeline = (item: SerialNumberItem) => {
    setSelectedItem(item)
    setShowTimeline(true)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Inventory Management</h1>
          <p className="text-muted-foreground">Track individual machinery units by serial number</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Button variant="outline" size="sm">
            <Upload className="mr-2 h-4 w-4" />
            Import
          </Button>
          <Button size="sm">
            <Plus className="mr-2 h-4 w-4" />
            Add Unit
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {inventoryStats.map((stat, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{stat.label}</CardTitle>
              <stat.icon className={`h-5 w-5 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Serial Number Tracking</CardTitle>
              <CardDescription>View complete lifecycle of each machinery unit</CardDescription>
            </div>
            <div className="flex items-center gap-1 rounded-md border p-1">
              <Button
                variant={viewMode === "table" ? "secondary" : "ghost"}
                size="sm"
                onClick={() => setViewMode("table")}
                className="h-8 w-8 p-0"
              >
                <TableIcon className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === "list" ? "secondary" : "ghost"}
                size="sm"
                onClick={() => setViewMode("list")}
                className="h-8 w-8 p-0"
              >
                <List className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === "grid" ? "secondary" : "ghost"}
                size="sm"
                onClick={() => setViewMode("grid")}
                className="h-8 w-8 p-0"
              >
                <LayoutGrid className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-center gap-3 mb-6">
            <div className="relative flex-1 min-w-[240px]">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by serial number, machine, or customer..."
                className="pl-9"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="CNC Machines">CNC Machines</SelectItem>
                <SelectItem value="Lathes">Lathes</SelectItem>
                <SelectItem value="Drills">Drills</SelectItem>
                <SelectItem value="Grinding">Grinding</SelectItem>
                <SelectItem value="Welding">Welding</SelectItem>
                <SelectItem value="Presses">Presses</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="Available">Available</SelectItem>
                <SelectItem value="Sold">Sold</SelectItem>
                <SelectItem value="In Service">In Service</SelectItem>
                <SelectItem value="Reserved">Reserved</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterWarranty} onValueChange={setFilterWarranty}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Warranty" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Warranty</SelectItem>
                <SelectItem value="Active">Active</SelectItem>
                <SelectItem value="Expiring Soon">Expiring Soon</SelectItem>
                <SelectItem value="Expired">Expired</SelectItem>
              </SelectContent>
            </Select>
            {(searchTerm || filterCategory !== "all" || filterStatus !== "all" || filterWarranty !== "all") && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSearchTerm("")
                  setFilterCategory("all")
                  setFilterStatus("all")
                  setFilterWarranty("all")
                }}
              >
                Clear
              </Button>
            )}
          </div>

          {/* Table */}
          {viewMode === "table" && (
            <div className="overflow-x-auto rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Serial Number</TableHead>
                    <TableHead>Machine Name</TableHead>
                    <TableHead>Brand</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Warranty</TableHead>
                    <TableHead>Service Records</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredItems.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-mono text-sm">{item.serialNumber}</TableCell>
                      <TableCell className="font-medium">{item.machineName}</TableCell>
                      <TableCell>{item.brand}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={getStatusColor(item.status)}>
                          {item.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{item.customerName || "-"}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={getWarrantyColor(item.warrantyStatus)}>
                          {item.warrantyStatus}
                        </Badge>
                      </TableCell>
                      <TableCell>{item.serviceHistory.length} records</TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm" onClick={() => handleViewTimeline(item)}>
                          <Eye className="h-4 w-4 mr-1" />
                          Timeline
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          {/* List View */}
          {viewMode === "list" && (
            <div className="space-y-3">
              {filteredItems.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between rounded-lg border p-4 hover:bg-accent/50 transition-colors"
                >
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">{item.machineName}</span>
                      <Badge variant="outline" className={getStatusColor(item.status)}>
                        {item.status}
                      </Badge>
                      <Badge variant="outline" className={getWarrantyColor(item.warrantyStatus)}>
                        {item.warrantyStatus}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground font-mono">{item.serialNumber}</p>
                    <div className="flex gap-3 text-xs text-muted-foreground">
                      <span>{item.brand}</span>
                      <span>•</span>
                      <span>{item.customerName || item.location}</span>
                      <span>•</span>
                      <span>{item.serviceHistory.length} service records</span>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => handleViewTimeline(item)}>
                    <Eye className="h-4 w-4 mr-1" />
                    View Timeline
                  </Button>
                </div>
              ))}
            </div>
          )}

          {/* Grid View */}
          {viewMode === "grid" && (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredItems.map((item) => (
                <Card key={item.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <CardTitle className="text-base">{item.machineName}</CardTitle>
                        <p className="text-xs text-muted-foreground font-mono">{item.serialNumber}</p>
                      </div>
                      <Badge variant="outline" className={getStatusColor(item.status)}>
                        {item.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="space-y-1 text-sm">
                      <p className="text-muted-foreground">Brand: {item.brand}</p>
                      <p className="text-muted-foreground">Location: {item.customerName || item.location}</p>
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground">Warranty:</span>
                        <Badge variant="outline" className={getWarrantyColor(item.warrantyStatus)}>
                          {item.warrantyStatus}
                        </Badge>
                      </div>
                    </div>
                    <div className="pt-2 border-t">
                      <p className="text-xs text-muted-foreground mb-2">{item.serviceHistory.length} service records</p>
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full bg-transparent"
                        onClick={() => handleViewTimeline(item)}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View Timeline
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={showTimeline} onOpenChange={setShowTimeline}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Serial Number Timeline</DialogTitle>
            <DialogDescription>Complete lifecycle history for {selectedItem?.serialNumber}</DialogDescription>
          </DialogHeader>

          {selectedItem && (
            <div className="space-y-6">
              {/* Machine Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">{selectedItem.machineName}</CardTitle>
                  <CardDescription className="font-mono">{selectedItem.serialNumber}</CardDescription>
                </CardHeader>
                <CardContent className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Brand</p>
                    <p className="font-medium">{selectedItem.brand}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Category</p>
                    <p className="font-medium">{selectedItem.category}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Status</p>
                    <Badge variant="outline" className={getStatusColor(selectedItem.status)}>
                      {selectedItem.status}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Unit Price</p>
                    <p className="font-medium">PKR {(selectedItem.unitPrice / 1000000).toFixed(2)}M</p>
                  </div>
                </CardContent>
              </Card>

              {/* Timeline */}
              <div className="space-y-4">
                <h3 className="font-semibold flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Lifecycle Timeline
                </h3>

                <div className="space-y-4 pl-4 border-l-2 border-muted">
                  {/* Purchase Date */}
                  <div className="relative pl-6">
                    <div className="absolute left-[-9px] top-1 w-4 h-4 rounded-full bg-blue-500 border-2 border-background" />
                    <div className="space-y-1">
                      <p className="text-sm font-medium">Purchase Date</p>
                      <p className="text-sm text-muted-foreground">{selectedItem.purchaseDate}</p>
                      <p className="text-xs text-muted-foreground">Unit acquired and added to inventory</p>
                    </div>
                  </div>

                  {/* Sales Date */}
                  {selectedItem.salesDate && (
                    <div className="relative pl-6">
                      <div className="absolute left-[-9px] top-1 w-4 h-4 rounded-full bg-purple-500 border-2 border-background" />
                      <div className="space-y-1">
                        <p className="text-sm font-medium">Sales Date</p>
                        <p className="text-sm text-muted-foreground">{selectedItem.salesDate}</p>
                        <p className="text-xs text-muted-foreground">Sold to {selectedItem.customerName}</p>
                      </div>
                    </div>
                  )}

                  {/* Installation Date */}
                  {selectedItem.installationDate && (
                    <div className="relative pl-6">
                      <div className="absolute left-[-9px] top-1 w-4 h-4 rounded-full bg-green-500 border-2 border-background" />
                      <div className="space-y-1">
                        <p className="text-sm font-medium">Installation Date</p>
                        <p className="text-sm text-muted-foreground">{selectedItem.installationDate}</p>
                        <p className="text-xs text-muted-foreground">
                          Installed at {selectedItem.installationLocation}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Service History */}
                  {selectedItem.serviceHistory.length > 0 && (
                    <>
                      <div className="relative pl-6">
                        <div className="absolute left-[-9px] top-1 w-4 h-4 rounded-full bg-orange-500 border-2 border-background" />
                        <div className="space-y-1">
                          <p className="text-sm font-medium flex items-center gap-2">
                            <Wrench className="h-4 w-4" />
                            Service History
                          </p>
                        </div>
                      </div>
                      {selectedItem.serviceHistory.map((service, index) => (
                        <div key={index} className="relative pl-6 ml-4">
                          <div className="absolute left-[-9px] top-1 w-4 h-4 rounded-full bg-orange-300 border-2 border-background" />
                          <Card className="mt-2">
                            <CardContent className="p-3 space-y-2">
                              <div className="flex items-center justify-between">
                                <Badge variant="outline">{service.type}</Badge>
                                <p className="text-xs text-muted-foreground">{service.date}</p>
                              </div>
                              <p className="text-sm">{service.description}</p>
                              <div className="flex items-center justify-between text-xs text-muted-foreground">
                                <span>Technician: {service.technician}</span>
                                <span>Cost: PKR {service.cost.toLocaleString()}</span>
                              </div>
                            </CardContent>
                          </Card>
                        </div>
                      ))}
                    </>
                  )}

                  {/* Warranty Status */}
                  <div className="relative pl-6">
                    <div
                      className={`absolute left-[-9px] top-1 w-4 h-4 rounded-full border-2 border-background ${
                        selectedItem.warrantyStatus === "Active"
                          ? "bg-green-500"
                          : selectedItem.warrantyStatus === "Expiring Soon"
                            ? "bg-orange-500"
                            : "bg-red-500"
                      }`}
                    />
                    <div className="space-y-1">
                      <p className="text-sm font-medium flex items-center gap-2">
                        <Shield className="h-4 w-4" />
                        Warranty Status
                      </p>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className={getWarrantyColor(selectedItem.warrantyStatus)}>
                          {selectedItem.warrantyStatus}
                        </Badge>
                        <p className="text-xs text-muted-foreground">Expires: {selectedItem.warrantyExpiry}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
