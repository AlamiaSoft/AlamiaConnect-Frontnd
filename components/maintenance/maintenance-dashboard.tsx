"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Wrench, AlertTriangle, CheckCircle2, Clock, Search, Plus, LayoutGrid, List, TableIcon } from "lucide-react"

interface MaintenanceRequest {
  id: string
  ticketNumber: string
  customerName: string
  companyName: string
  machineType: string
  serialNumber: string
  issueType: string
  priority: "Low" | "Medium" | "High" | "Critical"
  status: "Pending" | "Assigned" | "In Progress" | "On Hold" | "Completed"
  assignedTo: string
  region: string
  requestedDate: string
  scheduledDate: string
  estimatedCost: number
}

const mockMaintenanceData: MaintenanceRequest[] = [
  {
    id: "1",
    ticketNumber: "MNT-2025-001",
    customerName: "Ahmed Khan",
    companyName: "Prime Manufacturing",
    machineType: "CNC Machine",
    serialNumber: "CNC-2024-045",
    issueType: "Routine Service",
    priority: "Medium",
    status: "In Progress",
    assignedTo: "Imran Ali",
    region: "Karachi",
    requestedDate: "2025-01-05",
    scheduledDate: "2025-01-08",
    estimatedCost: 25000,
  },
  {
    id: "2",
    ticketNumber: "MNT-2025-002",
    customerName: "Fatima Sheikh",
    companyName: "Tech Industries",
    machineType: "Lathe Machine",
    serialNumber: "LAT-2023-128",
    issueType: "Breakdown Repair",
    priority: "Critical",
    status: "Assigned",
    assignedTo: "Usman Malik",
    region: "Lahore",
    requestedDate: "2025-01-06",
    scheduledDate: "2025-01-07",
    estimatedCost: 85000,
  },
  {
    id: "3",
    ticketNumber: "MNT-2025-003",
    customerName: "Hassan Raza",
    companyName: "Precision Tools Ltd",
    machineType: "Drill Press",
    serialNumber: "DRL-2024-091",
    issueType: "Parts Replacement",
    priority: "High",
    status: "Pending",
    assignedTo: "Unassigned",
    region: "Islamabad",
    requestedDate: "2025-01-07",
    scheduledDate: "2025-01-10",
    estimatedCost: 45000,
  },
  {
    id: "4",
    ticketNumber: "MNT-2024-298",
    customerName: "Sana Ahmed",
    companyName: "Industrial Solutions",
    machineType: "CNC Machine",
    serialNumber: "CNC-2023-167",
    issueType: "Calibration",
    priority: "Low",
    status: "Completed",
    assignedTo: "Bilal Khan",
    region: "Karachi",
    requestedDate: "2024-12-28",
    scheduledDate: "2025-01-02",
    estimatedCost: 18000,
  },
  {
    id: "5",
    ticketNumber: "MNT-2025-004",
    customerName: "Zahid Hussain",
    companyName: "Metro Engineering",
    machineType: "Milling Machine",
    serialNumber: "MIL-2024-073",
    issueType: "Warranty Service",
    priority: "Medium",
    status: "On Hold",
    assignedTo: "Kashif Iqbal",
    region: "Lahore",
    requestedDate: "2025-01-04",
    scheduledDate: "2025-01-11",
    estimatedCost: 0,
  },
]

export function MaintenanceDashboard() {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("All")
  const [priorityFilter, setPriorityFilter] = useState("All")
  const [viewMode, setViewMode] = useState<"table" | "list" | "grid">("table")

  const filteredData = mockMaintenanceData.filter((request) => {
    const matchesSearch =
      request.ticketNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.serialNumber.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter === "All" || request.status === statusFilter
    const matchesPriority = priorityFilter === "All" || request.priority === priorityFilter

    return matchesSearch && matchesStatus && matchesPriority
  })

  const totalRequests = mockMaintenanceData.length
  const pendingRequests = mockMaintenanceData.filter((r) => r.status === "Pending").length
  const inProgressRequests = mockMaintenanceData.filter((r) => r.status === "In Progress").length
  const criticalIssues = mockMaintenanceData.filter((r) => r.priority === "Critical").length

  const getStatusBadge = (status: MaintenanceRequest["status"]) => {
    const variants: Record<MaintenanceRequest["status"], string> = {
      Pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
      Assigned: "bg-blue-100 text-blue-800 border-blue-200",
      "In Progress": "bg-purple-100 text-purple-800 border-purple-200",
      "On Hold": "bg-gray-100 text-gray-800 border-gray-200",
      Completed: "bg-green-100 text-green-800 border-green-200",
    }
    return <Badge className={variants[status]}>{status}</Badge>
  }

  const getPriorityBadge = (priority: MaintenanceRequest["priority"]) => {
    const variants: Record<MaintenanceRequest["priority"], string> = {
      Low: "bg-slate-100 text-slate-800 border-slate-200",
      Medium: "bg-blue-100 text-blue-800 border-blue-200",
      High: "bg-orange-100 text-orange-800 border-orange-200",
      Critical: "bg-red-100 text-red-800 border-red-200",
    }
    return <Badge className={variants[priority]}>{priority}</Badge>
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-balance">Maintenance Management</h1>
          <p className="text-muted-foreground mt-1 text-pretty">
            Track and manage service requests and maintenance schedules
          </p>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          New Service Request
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
            <Wrench className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalRequests}</div>
            <p className="text-xs text-muted-foreground mt-1">Active service tickets</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingRequests}</div>
            <p className="text-xs text-muted-foreground mt-1">Awaiting assignment</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{inProgressRequests}</div>
            <p className="text-xs text-muted-foreground mt-1">Currently servicing</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Critical Issues</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{criticalIssues}</div>
            <p className="text-xs text-muted-foreground mt-1">Urgent attention needed</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Service Requests</CardTitle>
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
                placeholder="Search tickets, customers..."
                className="pl-9"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All Status</SelectItem>
                <SelectItem value="Pending">Pending</SelectItem>
                <SelectItem value="Assigned">Assigned</SelectItem>
                <SelectItem value="In Progress">In Progress</SelectItem>
                <SelectItem value="On Hold">On Hold</SelectItem>
                <SelectItem value="Completed">Completed</SelectItem>
              </SelectContent>
            </Select>
            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All Priority</SelectItem>
                <SelectItem value="Low">Low</SelectItem>
                <SelectItem value="Medium">Medium</SelectItem>
                <SelectItem value="High">High</SelectItem>
                <SelectItem value="Critical">Critical</SelectItem>
              </SelectContent>
            </Select>
            {(searchTerm || statusFilter !== "All" || priorityFilter !== "All") && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSearchTerm("")
                  setStatusFilter("All")
                  setPriorityFilter("All")
                }}
              >
                Clear
              </Button>
            )}
          </div>

          {viewMode === "table" && (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Ticket #</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Machine</TableHead>
                    <TableHead>Issue Type</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Assigned To</TableHead>
                    <TableHead>Scheduled</TableHead>
                    <TableHead className="text-right">Est. Cost</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredData.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                        No maintenance requests found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredData.map((request) => (
                      <TableRow key={request.id}>
                        <TableCell className="font-medium">{request.ticketNumber}</TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="font-medium">{request.customerName}</span>
                            <span className="text-sm text-muted-foreground">{request.companyName}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="font-medium">{request.machineType}</span>
                            <span className="text-sm text-muted-foreground">{request.serialNumber}</span>
                          </div>
                        </TableCell>
                        <TableCell>{request.issueType}</TableCell>
                        <TableCell>{getPriorityBadge(request.priority)}</TableCell>
                        <TableCell>{getStatusBadge(request.status)}</TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="font-medium">{request.assignedTo}</span>
                            <span className="text-sm text-muted-foreground">{request.region}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          {new Date(request.scheduledDate).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                          })}
                        </TableCell>
                        <TableCell className="text-right">
                          {request.estimatedCost === 0 ? "Warranty" : `Rs ${request.estimatedCost.toLocaleString()}`}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}

          {viewMode === "list" && (
            <div className="space-y-3">
              {filteredData.map((request) => (
                <div
                  key={request.id}
                  className="flex items-center justify-between rounded-lg border p-4 hover:bg-accent/50 transition-colors"
                >
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">{request.ticketNumber}</span>
                      {getStatusBadge(request.status)}
                      {getPriorityBadge(request.priority)}
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-medium">
                        {request.customerName} • {request.companyName}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {request.machineType} ({request.serialNumber})
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {request.issueType} • Assigned to {request.assignedTo}
                      </p>
                    </div>
                  </div>
                  <div className="text-right space-y-1">
                    <p className="text-sm font-semibold">
                      {request.estimatedCost === 0 ? "Warranty" : `Rs ${request.estimatedCost.toLocaleString()}`}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(request.scheduledDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {viewMode === "grid" && (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredData.map((request) => (
                <Card key={request.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <CardTitle className="text-base">{request.ticketNumber}</CardTitle>
                        <p className="text-sm text-muted-foreground">{request.customerName}</p>
                      </div>
                      {getPriorityBadge(request.priority)}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {getStatusBadge(request.status)}
                    <div className="space-y-1 text-sm">
                      <p className="font-medium">{request.machineType}</p>
                      <p className="text-muted-foreground text-xs font-mono">{request.serialNumber}</p>
                      <p className="text-muted-foreground">{request.issueType}</p>
                    </div>
                    <div className="pt-2 border-t space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Assigned:</span>
                        <span className="font-medium">{request.assignedTo}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Cost:</span>
                        <span className="font-medium">
                          {request.estimatedCost === 0 ? "Warranty" : `Rs ${request.estimatedCost.toLocaleString()}`}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
