"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { ClipboardList, Wrench, AlertCircle, Clock, CheckCircle2, Package, Plus, Search } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Progress } from "@/components/ui/progress"

interface InstallationJob {
  id: string
  jobNumber: string
  customer: string
  serialNumber: string
  machineName: string
  scheduledDate: string
  technician: string
  location: string
  status: "Scheduled" | "In-Progress" | "Testing" | "Completed"
  priority: "High" | "Medium" | "Low"
}

interface ServiceTicket {
  id: string
  ticketNumber: string
  serialNumber: string
  machineName: string
  customer: string
  complaintType: string
  description: string
  priority: "Critical" | "High" | "Medium" | "Low"
  status: "Open" | "Assigned" | "In-Progress" | "Resolved"
  reportedDate: string
  assignedTechnician?: string
  responseTime?: number
  firstTimeFix: boolean
}

interface SparePartRequest {
  id: string
  partName: string
  quantity: number
  serialNumber: string
  requestedBy: string
  status: "Pending" | "Approved" | "Shipped" | "Delivered"
}

export function ServiceInstallationDashboard() {
  const [selectedView, setSelectedView] = useState<"kanban" | "list">("kanban")
  const [showNewTicketDialog, setShowNewTicketDialog] = useState(false)
  const [showSparePartDialog, setShowSparePartDialog] = useState(false)
  const [newTicket, setNewTicket] = useState({
    serialNumber: "",
    complaintType: "",
    description: "",
    priority: "Medium",
  })
  const [newSparePartRequest, setNewSparePartRequest] = useState({
    partName: "",
    quantity: 1,
    serialNumber: "",
    urgency: "Normal",
  })

  const installationJobs: InstallationJob[] = [
    {
      id: "1",
      jobNumber: "INS-2025-001",
      customer: "Pak Steel Industries",
      serialNumber: "CNC-2024-1001",
      machineName: "CNC Machine Model X500",
      scheduledDate: "2025-01-15",
      technician: "Ahmed Khan",
      location: "Karachi",
      status: "Scheduled",
      priority: "High",
    },
    {
      id: "2",
      jobNumber: "INS-2025-002",
      customer: "Textile Manufacturing Co.",
      serialNumber: "LTH-2024-2003",
      machineName: "Lathe Machine L450",
      scheduledDate: "2025-01-10",
      technician: "Bilal Ahmed",
      location: "Lahore",
      status: "In-Progress",
      priority: "Medium",
    },
    {
      id: "3",
      jobNumber: "INS-2025-003",
      customer: "Modern Tools Ltd",
      serialNumber: "DRL-2024-3005",
      machineName: "Industrial Drill D300",
      scheduledDate: "2025-01-12",
      technician: "Hassan Ali",
      location: "Islamabad",
      status: "Testing",
      priority: "High",
    },
    {
      id: "4",
      jobNumber: "INS-2024-099",
      customer: "National Industries",
      serialNumber: "CNC-2024-1002",
      machineName: "CNC Machine Model X600",
      scheduledDate: "2025-01-05",
      technician: "Imran Shah",
      location: "Karachi",
      status: "Completed",
      priority: "Medium",
    },
  ]

  const serviceTickets: ServiceTicket[] = [
    {
      id: "1",
      ticketNumber: "TKT-2025-101",
      serialNumber: "CNC-2024-1001",
      machineName: "CNC Machine Model X500",
      customer: "Pak Steel Industries",
      complaintType: "Mechanical Failure",
      description: "Spindle not rotating properly",
      priority: "Critical",
      status: "In-Progress",
      reportedDate: "2025-01-08",
      assignedTechnician: "Ahmed Khan",
      responseTime: 2.5,
      firstTimeFix: false,
    },
    {
      id: "2",
      ticketNumber: "TKT-2025-102",
      serialNumber: "LTH-2024-2003",
      machineName: "Lathe Machine L450",
      customer: "Textile Manufacturing Co.",
      complaintType: "Electrical Issue",
      description: "Power fluctuation causing shutdowns",
      priority: "High",
      status: "Open",
      reportedDate: "2025-01-09",
      responseTime: undefined,
      firstTimeFix: false,
    },
    {
      id: "3",
      ticketNumber: "TKT-2025-100",
      serialNumber: "DRL-2024-3005",
      machineName: "Industrial Drill D300",
      customer: "Modern Tools Ltd",
      complaintType: "Software Error",
      description: "Control panel display malfunction",
      priority: "Medium",
      status: "Resolved",
      reportedDate: "2025-01-05",
      assignedTechnician: "Hassan Ali",
      responseTime: 4.0,
      firstTimeFix: true,
    },
  ]

  const firstTimeFixRate = Math.round(
    (serviceTickets.filter((t) => t.status === "Resolved" && t.firstTimeFix).length /
      serviceTickets.filter((t) => t.status === "Resolved").length) *
      100,
  )
  const avgResponseTime =
    serviceTickets.filter((t) => t.responseTime).reduce((sum, t) => sum + (t.responseTime || 0), 0) /
    serviceTickets.filter((t) => t.responseTime).length

  const handleCreateTicket = () => {
    console.log("Creating new service ticket:", newTicket)
    setShowNewTicketDialog(false)
    setNewTicket({ serialNumber: "", complaintType: "", description: "", priority: "Medium" })
  }

  const handleRequestSparePart = () => {
    console.log("Requesting spare part:", newSparePartRequest)
    alert("Spare part request sent to Inventory Manager")
    setShowSparePartDialog(false)
    setNewSparePartRequest({ partName: "", quantity: 1, serialNumber: "", urgency: "Normal" })
  }

  const getJobsByStatus = (status: string) => {
    return installationJobs.filter((job) => job.status === status)
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "Critical":
      case "High":
        return "destructive"
      case "Medium":
        return "default"
      case "Low":
        return "secondary"
      default:
        return "default"
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Completed":
      case "Resolved":
        return "bg-green-500/10 text-green-700 dark:text-green-400"
      case "In-Progress":
      case "Testing":
        return "bg-blue-500/10 text-blue-700 dark:text-blue-400"
      case "Scheduled":
      case "Open":
        return "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400"
      case "Assigned":
        return "bg-purple-500/10 text-purple-700 dark:text-purple-400"
      default:
        return "bg-gray-500/10 text-gray-700 dark:text-gray-400"
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Service & Installation</h1>
          <p className="text-muted-foreground">Manage installations, service tickets, and field operations</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setShowNewTicketDialog(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            New Service Ticket
          </Button>
          <Button onClick={() => setShowSparePartDialog(true)} variant="outline" className="gap-2">
            <Package className="h-4 w-4" />
            Request Spare Parts
          </Button>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Installations</CardTitle>
            <Wrench className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{installationJobs.filter((j) => j.status !== "Completed").length}</div>
            <p className="text-xs text-muted-foreground">
              {installationJobs.filter((j) => j.status === "In-Progress").length} in progress
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Open Tickets</CardTitle>
            <ClipboardList className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{serviceTickets.filter((t) => t.status !== "Resolved").length}</div>
            <p className="text-xs text-muted-foreground">
              {serviceTickets.filter((t) => t.priority === "Critical").length} critical
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">First-Time Fix Rate</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{firstTimeFixRate}%</div>
            <Progress value={firstTimeFixRate} className="mt-2 h-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Response Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgResponseTime.toFixed(1)}h</div>
            <p className="text-xs text-muted-foreground">Target: 4h</p>
          </CardContent>
        </Card>
      </div>

      {/* Installation Jobs Kanban Board */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Installation Jobs</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">Track installation progress</p>
            </div>
            <div className="flex gap-2">
              <Button
                variant={selectedView === "kanban" ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedView("kanban")}
              >
                Kanban
              </Button>
              <Button
                variant={selectedView === "list" ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedView("list")}
              >
                List
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {selectedView === "kanban" ? (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Scheduled Column */}
              <div className="space-y-3">
                <div className="flex items-center justify-between px-3 py-2 bg-yellow-500/10 rounded-lg">
                  <h3 className="font-semibold text-sm">Scheduled</h3>
                  <Badge variant="secondary">{getJobsByStatus("Scheduled").length}</Badge>
                </div>
                <div className="space-y-2">
                  {getJobsByStatus("Scheduled").map((job) => (
                    <Card key={job.id} className="p-3 hover:shadow-md transition-shadow cursor-pointer">
                      <div className="space-y-2">
                        <div className="flex items-start justify-between">
                          <div className="font-medium text-sm">{job.jobNumber}</div>
                          <Badge variant={getPriorityColor(job.priority) as any} className="text-xs">
                            {job.priority}
                          </Badge>
                        </div>
                        <div className="text-sm text-muted-foreground">{job.customer}</div>
                        <div className="text-xs text-muted-foreground">{job.machineName}</div>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          {job.scheduledDate}
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>

              {/* In-Progress Column */}
              <div className="space-y-3">
                <div className="flex items-center justify-between px-3 py-2 bg-blue-500/10 rounded-lg">
                  <h3 className="font-semibold text-sm">In-Progress</h3>
                  <Badge variant="secondary">{getJobsByStatus("In-Progress").length}</Badge>
                </div>
                <div className="space-y-2">
                  {getJobsByStatus("In-Progress").map((job) => (
                    <Card key={job.id} className="p-3 hover:shadow-md transition-shadow cursor-pointer">
                      <div className="space-y-2">
                        <div className="flex items-start justify-between">
                          <div className="font-medium text-sm">{job.jobNumber}</div>
                          <Badge variant={getPriorityColor(job.priority) as any} className="text-xs">
                            {job.priority}
                          </Badge>
                        </div>
                        <div className="text-sm text-muted-foreground">{job.customer}</div>
                        <div className="text-xs text-muted-foreground">{job.machineName}</div>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Wrench className="h-3 w-3" />
                          {job.technician}
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Testing Column */}
              <div className="space-y-3">
                <div className="flex items-center justify-between px-3 py-2 bg-purple-500/10 rounded-lg">
                  <h3 className="font-semibold text-sm">Testing</h3>
                  <Badge variant="secondary">{getJobsByStatus("Testing").length}</Badge>
                </div>
                <div className="space-y-2">
                  {getJobsByStatus("Testing").map((job) => (
                    <Card key={job.id} className="p-3 hover:shadow-md transition-shadow cursor-pointer">
                      <div className="space-y-2">
                        <div className="flex items-start justify-between">
                          <div className="font-medium text-sm">{job.jobNumber}</div>
                          <Badge variant={getPriorityColor(job.priority) as any} className="text-xs">
                            {job.priority}
                          </Badge>
                        </div>
                        <div className="text-sm text-muted-foreground">{job.customer}</div>
                        <div className="text-xs text-muted-foreground">{job.machineName}</div>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <AlertCircle className="h-3 w-3" />
                          Quality Check
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Completed Column */}
              <div className="space-y-3">
                <div className="flex items-center justify-between px-3 py-2 bg-green-500/10 rounded-lg">
                  <h3 className="font-semibold text-sm">Completed</h3>
                  <Badge variant="secondary">{getJobsByStatus("Completed").length}</Badge>
                </div>
                <div className="space-y-2">
                  {getJobsByStatus("Completed").map((job) => (
                    <Card key={job.id} className="p-3 hover:shadow-md transition-shadow cursor-pointer">
                      <div className="space-y-2">
                        <div className="flex items-start justify-between">
                          <div className="font-medium text-sm">{job.jobNumber}</div>
                          <CheckCircle2 className="h-4 w-4 text-green-600" />
                        </div>
                        <div className="text-sm text-muted-foreground">{job.customer}</div>
                        <div className="text-xs text-muted-foreground">{job.machineName}</div>
                        <div className="flex items-center gap-1 text-xs text-green-600">
                          <CheckCircle2 className="h-3 w-3" />
                          Verified
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              {installationJobs.map((job) => (
                <div
                  key={job.id}
                  className="flex items-center justify-between p-4 rounded-lg border hover:bg-accent/50 transition-colors"
                >
                  <div className="flex-1">
                    <div className="font-medium">{job.jobNumber}</div>
                    <div className="text-sm text-muted-foreground">{job.customer}</div>
                  </div>
                  <div className="flex-1">
                    <div className="text-sm">{job.machineName}</div>
                    <div className="text-xs text-muted-foreground">{job.serialNumber}</div>
                  </div>
                  <div className="flex-1 text-sm text-muted-foreground">{job.technician}</div>
                  <div className="flex-1 text-sm text-muted-foreground">{job.scheduledDate}</div>
                  <div className="flex gap-2">
                    <Badge className={getStatusColor(job.status)}>{job.status}</Badge>
                    <Badge variant={getPriorityColor(job.priority) as any}>{job.priority}</Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Service Tickets */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Service Tickets</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {serviceTickets.map((ticket) => (
              <div
                key={ticket.id}
                className="flex items-center justify-between p-4 rounded-lg border hover:bg-accent/50 transition-colors"
              >
                <div className="flex-1">
                  <div className="font-medium">{ticket.ticketNumber}</div>
                  <div className="text-sm text-muted-foreground">{ticket.complaintType}</div>
                </div>
                <div className="flex-1">
                  <div className="text-sm">{ticket.machineName}</div>
                  <div className="text-xs text-muted-foreground">{ticket.serialNumber}</div>
                </div>
                <div className="flex-1 text-sm text-muted-foreground">{ticket.customer}</div>
                <div className="flex-1 text-sm text-muted-foreground">{ticket.assignedTechnician || "Unassigned"}</div>
                <div className="flex gap-2">
                  <Badge className={getStatusColor(ticket.status)}>{ticket.status}</Badge>
                  <Badge variant={getPriorityColor(ticket.priority) as any}>{ticket.priority}</Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* New Service Ticket Dialog */}
      <Dialog open={showNewTicketDialog} onOpenChange={setShowNewTicketDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create New Service Ticket</DialogTitle>
            <DialogDescription>Log a complaint or service request for a machine</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="serialNumber">Machine Serial Number *</Label>
              <div className="flex gap-2">
                <Input
                  id="serialNumber"
                  placeholder="e.g., CNC-2024-1001"
                  value={newTicket.serialNumber}
                  onChange={(e) => setNewTicket({ ...newTicket, serialNumber: e.target.value })}
                />
                <Button variant="outline" size="icon">
                  <Search className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="complaintType">Complaint Type *</Label>
              <Select
                value={newTicket.complaintType}
                onValueChange={(value) => setNewTicket({ ...newTicket, complaintType: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select complaint type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Mechanical Failure">Mechanical Failure</SelectItem>
                  <SelectItem value="Electrical Issue">Electrical Issue</SelectItem>
                  <SelectItem value="Software Error">Software Error</SelectItem>
                  <SelectItem value="Calibration Required">Calibration Required</SelectItem>
                  <SelectItem value="Parts Replacement">Parts Replacement</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                placeholder="Describe the issue in detail..."
                value={newTicket.description}
                onChange={(e) => setNewTicket({ ...newTicket, description: e.target.value })}
                rows={4}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="priority">Priority Level</Label>
              <Select
                value={newTicket.priority}
                onValueChange={(value) => setNewTicket({ ...newTicket, priority: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Critical">Critical</SelectItem>
                  <SelectItem value="High">High</SelectItem>
                  <SelectItem value="Medium">Medium</SelectItem>
                  <SelectItem value="Low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setShowNewTicketDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateTicket}>Create Ticket</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Spare Part Request Dialog */}
      <Dialog open={showSparePartDialog} onOpenChange={setShowSparePartDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Request Spare Parts</DialogTitle>
            <DialogDescription>Submit a request to the Inventory Manager</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="partName">Part Name *</Label>
              <Input
                id="partName"
                placeholder="e.g., Spindle Motor"
                value={newSparePartRequest.partName}
                onChange={(e) => setNewSparePartRequest({ ...newSparePartRequest, partName: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="quantity">Quantity *</Label>
              <Input
                id="quantity"
                type="number"
                min="1"
                value={newSparePartRequest.quantity}
                onChange={(e) =>
                  setNewSparePartRequest({ ...newSparePartRequest, quantity: Number.parseInt(e.target.value) || 1 })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="spareSerial">For Machine Serial Number *</Label>
              <Input
                id="spareSerial"
                placeholder="e.g., CNC-2024-1001"
                value={newSparePartRequest.serialNumber}
                onChange={(e) => setNewSparePartRequest({ ...newSparePartRequest, serialNumber: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="urgency">Urgency</Label>
              <Select
                value={newSparePartRequest.urgency}
                onValueChange={(value) => setNewSparePartRequest({ ...newSparePartRequest, urgency: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Critical">Critical</SelectItem>
                  <SelectItem value="Urgent">Urgent</SelectItem>
                  <SelectItem value="Normal">Normal</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setShowSparePartDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleRequestSparePart}>
              <Package className="h-4 w-4 mr-2" />
              Submit Request
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
