"use client"

import type React from "react"
import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from "@/components/ui/drawer"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import {
  MapPin,
  Camera,
  CheckCircle2,
  Clock,
  AlertCircle,
  FileText,
  Plus,
  Navigation,
  Building2,
  Calendar,
  Play,
  StopCircle,
} from "lucide-react"
import { toast } from "sonner"
import useSWR, { mutate } from "swr"
import api from "@/lib/api"
import { deserialize } from "@/lib/json-api"
import { VisitsService } from "@/services/visits-service"

const fetcher = (url: string) => api.get(url).then(res => deserialize(res.data))

const parseNotes = (notes?: string) => {
  try {
    return notes ? JSON.parse(notes) : {};
  } catch {
    return { originalNotes: notes };
  }
}

type VisitPurpose = "Negotiation" | "Routine" | "Service" | "Complaint"
type VisitStatus = "Done" | "In-Progress" | "Blocked"
type VisitOutcome = "Lead Closed" | "Payment Collection" | "Follow-up Required" | "No Action"
type TaskPriority = "Low" | "Medium" | "High" | "Urgent"

interface Visit {
  id: string
  purpose: VisitPurpose
  status?: VisitStatus
  outcome?: VisitOutcome
  contractAmount?: number
  transactionId?: string
  location?: { lat: number; lng: number }
  photos: string[]
  blockedReason?: string
  invoiced: boolean
  timestamp: Date
  clientName: string
  followUpTask?: {
    date: string
    priority: TaskPriority
  }
  checkInAt?: Date
  checkOutAt?: Date
}

const mockClientLocations = [
  { id: "1", name: "ABC Corporation", lat: 24.8607, lng: 67.0011, distance: "0.5 km" },
  { id: "2", name: "XYZ Enterprises", lat: 24.8615, lng: 67.0025, distance: "1.2 km" },
  { id: "3", name: "Tech Solutions Ltd", lat: 24.8598, lng: 67.0018, distance: "0.8 km" },
  { id: "4", name: "Industrial Co.", lat: 24.8622, lng: 67.0032, distance: "1.5 km" },
]

export function SalesActivityHub() {
  const { data: visitsData } = useSWR('/sales-visits?include=user,lead', fetcher)
  const { data: leadsData } = useSWR('/leads', fetcher)

  const visits: Visit[] = visitsData ? visitsData.map((v: any) => {
    const extra = parseNotes(v.notes);
    return {
      id: v.id.toString(),
      purpose: extra.purpose || 'Routine',
      status: extra.status || 'Done',
      outcome: v.outcome,
      contractAmount: extra.contractAmount,
      transactionId: extra.transactionId,
      location: v.gps_lat ? { lat: Number(v.gps_lat), lng: Number(v.gps_lng) } : undefined,
      photos: v.photo_url ? v.photo_url.split(',') : [],
      blockedReason: extra.blockedReason,
      invoiced: extra.invoiced || false,
      timestamp: new Date(v.visit_at),
      clientName: v.lead?.title || v.lead?.person_name || 'Unknown Client',
      followUpTask: extra.followUpTask,
      checkInAt: v.check_in_at ? new Date(v.check_in_at) : undefined,
      checkOutAt: v.check_out_at ? new Date(v.check_out_at) : undefined,
    };
  }) : []

  const activeVisit = visits.find(v => v.checkInAt && !v.checkOutAt);

  const [drawerOpen, setDrawerOpen] = useState(false)
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [newVisit, setNewVisit] = useState<Partial<Visit>>({
    purpose: "Routine",
    photos: [],
    invoiced: false,
  })
  const [createFollowUp, setCreateFollowUp] = useState(false)

  const captureGPS = () => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          }
          setUserLocation(location)
          setNewVisit({
            ...newVisit,
            location,
          })
        },
        () => {
          alert("Unable to retrieve location")
        },
      )
    } else {
      alert("Geolocation is not supported by your browser")
    }
  }

  const [statusFilter, setStatusFilter] = useState<string>("All")

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files) {
      const photoURLs = Array.from(files).map(() => "/placeholder.svg?height=100&width=100")
      setNewVisit({
        ...newVisit,
        photos: [...(newVisit.photos || []), ...photoURLs],
      })
    }
  }

  const logVisit = async () => {
    const notesPayload = {
      purpose: newVisit.purpose,
      status: newVisit.purpose === "Service" ? "In-Progress" : undefined,
      contractAmount: newVisit.contractAmount,
      transactionId: newVisit.transactionId,
      blockedReason: newVisit.blockedReason,
      invoiced: false,
      followUpTask: createFollowUp ? newVisit.followUpTask : undefined,
    };

    // Ensure we have a lead ID
    let finalLeadId = (newVisit as any).leadId;
    if (!finalLeadId) {
      // Fallback search (legacy)
      const selectedLead = leadsData?.find((l: any) => l.title === newVisit.clientName || l.person_name === newVisit.clientName);
      finalLeadId = selectedLead?.id;
    }

    if (!finalLeadId) {
      toast.error("Please select a valid client.");
      return;
    }

    const payload = {
      lead_id: finalLeadId,
      visit_at: new Date().toISOString(),
      outcome: newVisit.outcome,
      gps_lat: newVisit.location?.lat,
      gps_lng: newVisit.location?.lng,
      photo_url: newVisit.photos?.join(','),
      notes: JSON.stringify(notesPayload)
    };

    try {
      await VisitsService.createVisit(payload);
      mutate('/sales-visits?include=user,lead');
      setNewVisit({ purpose: "Routine", photos: [], invoiced: false });
      setCreateFollowUp(false);
      setDrawerOpen(false);
      toast.success("Visit logged successfully");
    } catch (e: any) {
      console.error("Failed to log visit", e);
      toast.error(e.response?.data?.message || "Failed to log visit");
    }
  }

  const updateVisitStatus = async (id: string, status: VisitStatus, blockedReason?: string) => {
    const visit = visits.find(v => v.id === id);
    if (!visit) return;

    const currentExtras = {
      purpose: visit.purpose,
      status: status,
      contractAmount: visit.contractAmount,
      transactionId: visit.transactionId,
      blockedReason: blockedReason,
      invoiced: visit.invoiced,
      followUpTask: visit.followUpTask
    };

    try {
      await VisitsService.updateVisit(id, {
        notes: JSON.stringify(currentExtras)
      });
      mutate('/sales-visits?include=user,lead');
    } catch (e) {
      console.error('Update failed', e);
    }
    const handleCheckIn = async (location: { lat: number; lng: number }, selectedLeadId: string) => {
      try {
        await VisitsService.createVisit({
          lead_id: selectedLeadId,
          visit_at: new Date().toISOString(),
          check_in_at: new Date().toISOString(),
          gps_lat: location.lat,
          gps_lng: location.lng,
          notes: JSON.stringify({ status: 'In-Progress', purpose: 'Routine' }) // Default state
        });
        mutate('/sales-visits?include=user,lead');
        toast.success("Checked in successfully!");
        setDrawerOpen(false); // Close generic drawer if open
      } catch (e: any) {
        toast.error("Check-in failed: " + (e.message || "Unknown error"));
      }
    }

    const handleCheckOut = async () => {
      if (!activeVisit) return;

      // We need to capture details. For now, we will open the drawer/modal to fill details
      // But for Quick Check-out we can just set the time. 
      // Let's assume we open the "Log Activity" drawer pre-filled with the active visit to "Close" it.

      // For this step, let's just make a simple check-out update
      try {
        await VisitsService.updateVisit(activeVisit.id, {
          check_out_at: new Date().toISOString(),
          gps_lat: userLocation?.lat, // Update location on check-out?
          gps_lng: userLocation?.lng,
        });
        mutate('/sales-visits?include=user,lead');
        toast.success("Checked out successfully!");
      } catch (e: any) {
        toast.error("Check-out failed.");
      }
    }

    const pendingBillCount = visits.filter((v) => v.purpose === "Service" && v.status === "Done" && !v.invoiced).length

    return (
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Sales Activity Hub</h1>
            <p className="text-muted-foreground">Track visits, close deals, and manage field operations</p>
          </div>
          <div className="flex gap-2">
            {pendingBillCount > 0 && (
              <Badge variant="destructive" className="h-10 px-4 text-sm">
                <FileText className="mr-2 h-4 w-4" />
                {pendingBillCount} Bill{pendingBillCount > 1 ? "s" : ""} Pending
              </Badge>
            )}
            <Drawer open={drawerOpen} onOpenChange={setDrawerOpen}>
              <DrawerTrigger asChild>
                {activeVisit ? (
                  <Button variant="destructive" onClick={handleCheckOut}>
                    <StopCircle className="mr-2 h-4 w-4" />
                    Check Out ({activeVisit.clientName})
                  </Button>
                ) : (
                  <Button onClick={() => setDrawerOpen(true)}>
                    <Play className="mr-2 h-4 w-4" />
                    Start Visit / Log Activity
                  </Button>
                )}
              </DrawerTrigger>
              <DrawerContent className="max-h-[85vh]">
                <DrawerHeader>
                  <DrawerTitle>New Sales Activity</DrawerTitle>
                </DrawerHeader>
                <div className="overflow-y-auto px-4 pb-6">
                  <Card className="mb-6 overflow-hidden">
                    <div className="relative h-48 bg-gradient-to-br from-blue-50 to-blue-100 p-4">
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Navigation className="h-12 w-12 text-blue-600" />
                      </div>
                      {userLocation && (
                        <Badge className="absolute left-4 top-4 bg-green-600">
                          <MapPin className="mr-1 h-3 w-3" />
                          Location Active
                        </Badge>
                      )}
                    </div>
                    <div className="border-t p-4">
                      <h3 className="mb-3 text-sm font-semibold">Nearby KTD Clients</h3>
                      <div className="space-y-2">
                        {(leadsData || []).map((lead: any) => (
                          <div
                            key={lead.id}
                            className="flex cursor-pointer items-center justify-between rounded-lg border p-2 transition-colors hover:bg-accent"
                            onClick={() => {
                              setNewVisit({ ...newVisit, clientName: lead.title || lead.person_name, leadId: lead.id.toString() } as any)
                              if (userLocation) {
                                if (confirm(`Check-in with ${lead.title || lead.person_name} at current location?`)) {
                                  handleCheckIn(userLocation, lead.id)
                                }
                              } else {
                                toast.error("Please capture GPS location first to check-in.")
                                captureGPS()
                              }
                            }}
                          >
                            <div className="flex items-center gap-2">
                              <Building2 className="h-4 w-4 text-muted-foreground" />
                              <span className="text-sm font-medium">{lead.title || lead.person_name || 'Unnamed'}</span>
                            </div>
                            <span className="text-xs text-muted-foreground">--</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </Card>

                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="clientName">Client Name</Label>
                      <Select
                        value={(newVisit as any).leadId || (leadsData || []).find((l: any) => l.title === newVisit.clientName || l.person_name === newVisit.clientName)?.id?.toString()}
                        onValueChange={(val) => {
                          const selected = (leadsData as any[])?.find((l: any) => l.id.toString() === val);
                          if (selected) {
                            setNewVisit({ ...newVisit, clientName: selected.title || selected.person_name, leadId: val } as any);
                          }
                        }}
                      >
                        <SelectTrigger id="clientName">
                          <SelectValue placeholder="Select client" />
                        </SelectTrigger>
                        <SelectContent>
                          {(leadsData || []).map((lead: any) => (
                            <SelectItem key={lead.id} value={lead.id.toString()}>
                              {lead.title || lead.person_name || 'Unnamed'}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="purpose">Visit Purpose</Label>
                      <Select
                        value={newVisit.purpose}
                        onValueChange={(value: VisitPurpose) => setNewVisit({ ...newVisit, purpose: value })}
                      >
                        <SelectTrigger id="purpose">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Negotiation">Negotiation</SelectItem>
                          <SelectItem value="Routine">Routine</SelectItem>
                          <SelectItem value="Service">Service</SelectItem>
                          <SelectItem value="Complaint">Complaint</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="outcome">Visit Outcome</Label>
                      <Select
                        value={newVisit.outcome}
                        onValueChange={(value: VisitOutcome) => setNewVisit({ ...newVisit, outcome: value })}
                      >
                        <SelectTrigger id="outcome">
                          <SelectValue placeholder="Select outcome" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Lead Closed">Lead Closed</SelectItem>
                          <SelectItem value="Payment Collection">Payment Collection</SelectItem>
                          <SelectItem value="Follow-up Required">Follow-up Required</SelectItem>
                          <SelectItem value="No Action">No Action</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {newVisit.outcome === "Lead Closed" && (
                      <div>
                        <Label htmlFor="contractAmount">Contract Amount (PKR)</Label>
                        <Input
                          id="contractAmount"
                          type="number"
                          placeholder="Enter contract amount"
                          value={newVisit.contractAmount || ""}
                          onChange={(e) => setNewVisit({ ...newVisit, contractAmount: Number(e.target.value) })}
                        />
                      </div>
                    )}

                    {newVisit.outcome === "Payment Collection" && (
                      <div>
                        <Label htmlFor="transactionId">Cheque/Transaction ID</Label>
                        <Input
                          id="transactionId"
                          placeholder="Enter cheque or transaction ID"
                          value={newVisit.transactionId || ""}
                          onChange={(e) => setNewVisit({ ...newVisit, transactionId: e.target.value })}
                        />
                      </div>
                    )}

                    <div>
                      <Label>Location</Label>
                      <Button
                        type="button"
                        variant="outline"
                        className="w-full justify-start bg-transparent"
                        onClick={captureGPS}
                      >
                        <MapPin className="mr-2 h-4 w-4" />
                        {newVisit.location
                          ? `${newVisit.location.lat.toFixed(4)}, ${newVisit.location.lng.toFixed(4)}`
                          : "Capture GPS Location"}
                      </Button>
                    </div>

                    <div>
                      <Label htmlFor="photo">Upload Photos</Label>
                      <Input
                        id="photo"
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handlePhotoUpload}
                        className="hidden"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        className="w-full justify-start bg-transparent"
                        onClick={() => document.getElementById("photo")?.click()}
                      >
                        <Camera className="mr-2 h-4 w-4" />
                        Upload Photos ({newVisit.photos?.length || 0})
                      </Button>
                      {newVisit.photos && newVisit.photos.length > 0 && (
                        <div className="mt-2 flex gap-2">
                          {newVisit.photos.map((photo, idx) => (
                            <img
                              key={idx}
                              src={photo || "/placeholder.svg"}
                              alt={`Visit ${idx + 1}`}
                              className="h-20 w-20 rounded border object-cover"
                            />
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="space-y-4 rounded-lg border p-4">
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label htmlFor="followUp">Create Follow-up Task</Label>
                          <p className="text-xs text-muted-foreground">Schedule a future action</p>
                        </div>
                        <Switch id="followUp" checked={createFollowUp} onCheckedChange={setCreateFollowUp} />
                      </div>

                      {createFollowUp && (
                        <div className="space-y-3 pt-2">
                          <div>
                            <Label htmlFor="followUpDate">Follow-up Date & Time</Label>
                            <Input
                              id="followUpDate"
                              type="datetime-local"
                              value={newVisit.followUpTask?.date || ""}
                              onChange={(e) =>
                                setNewVisit({
                                  ...newVisit,
                                  followUpTask: {
                                    ...newVisit.followUpTask,
                                    date: e.target.value,
                                    priority: newVisit.followUpTask?.priority || "Medium",
                                  },
                                })
                              }
                            />
                          </div>
                          <div>
                            <Label htmlFor="priority">Task Priority</Label>
                            <Select
                              value={newVisit.followUpTask?.priority}
                              onValueChange={(value: TaskPriority) =>
                                setNewVisit({
                                  ...newVisit,
                                  followUpTask: {
                                    date: newVisit.followUpTask?.date || "",
                                    priority: value,
                                  },
                                })
                              }
                            >
                              <SelectTrigger id="priority">
                                <SelectValue placeholder="Select priority" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Low">Low</SelectItem>
                                <SelectItem value="Medium">Medium</SelectItem>
                                <SelectItem value="High">High</SelectItem>
                                <SelectItem value="Urgent">Urgent</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      )}
                    </div>

                    <Button onClick={logVisit} className="w-full" size="lg">
                      Log Activity
                    </Button>
                  </div>
                </div>
              </DrawerContent>
            </Drawer>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Recent Activities</h2>
            <div className="w-[200px]">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All Statuses</SelectItem>
                  <SelectItem value="Done">Done</SelectItem>
                  <SelectItem value="In-Progress">In-Progress</SelectItem>
                  <SelectItem value="Blocked">Blocked</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          {visits
            .filter(v => statusFilter === "All" || v.status === statusFilter)
            .map((visit) => (
              <Card key={visit.id} className="p-4">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="flex-1 space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-semibold">{visit.clientName}</h3>
                      <Badge variant="outline">{visit.purpose}</Badge>
                      {visit.outcome && <Badge variant="secondary">{visit.outcome}</Badge>}
                      {visit.status && (
                        <Badge
                          variant={
                            visit.status === "Done" ? "default" : visit.status === "Blocked" ? "destructive" : "secondary"
                          }
                        >
                          {visit.status === "Done" && <CheckCircle2 className="mr-1 h-3 w-3" />}
                          {visit.status === "In-Progress" && <Clock className="mr-1 h-3 w-3" />}
                          {visit.status === "Blocked" && <AlertCircle className="mr-1 h-3 w-3" />}
                          {visit.status}
                        </Badge>
                      )}
                      {visit.purpose === "Service" && visit.status === "Done" && !visit.invoiced && (
                        <Badge variant="destructive">Bill Pending</Badge>
                      )}
                    </div>

                    <div className="text-sm text-muted-foreground">{visit.timestamp.toLocaleString()}</div>

                    {visit.contractAmount && (
                      <div className="text-sm font-medium text-green-600">
                        Contract Value: PKR {visit.contractAmount.toLocaleString()}
                      </div>
                    )}

                    {visit.transactionId && (
                      <div className="text-sm">
                        <span className="text-muted-foreground">Transaction ID:</span>{" "}
                        <span className="font-mono font-medium">{visit.transactionId}</span>
                      </div>
                    )}

                    {visit.followUpTask && (
                      <div className="flex items-center gap-2 rounded-md bg-amber-50 p-2 text-sm">
                        <Calendar className="h-4 w-4 text-amber-600" />
                        <span>
                          Follow-up: {new Date(visit.followUpTask.date).toLocaleString()} ({visit.followUpTask.priority}{" "}
                          Priority)
                        </span>
                      </div>
                    )}

                    {visit.location && (
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <MapPin className="h-3 w-3" />
                        {visit.location.lat.toFixed(4)}, {visit.location.lng.toFixed(4)}
                      </div>
                    )}

                    {visit.photos.length > 0 && (
                      <div className="flex gap-2">
                        {visit.photos.map((photo, idx) => (
                          <img
                            key={idx}
                            src={photo || "/placeholder.svg"}
                            alt={`Visit ${idx + 1}`}
                            className="h-16 w-16 rounded border object-cover"
                          />
                        ))}
                      </div>
                    )}

                    {visit.blockedReason && (
                      <div className="rounded-md bg-muted p-2 text-sm">
                        <strong>Blocked Reason:</strong> {visit.blockedReason}
                      </div>
                    )}
                  </div>

                  {visit.purpose === "Service" && (
                    <div className="space-y-2 sm:w-48">
                      <Label className="text-xs">Status</Label>
                      <Select
                        value={visit.status}
                        onValueChange={(value: VisitStatus) => {
                          if (value === "Blocked") {
                            const reason = prompt("Enter reason for blocking:")
                            if (reason) {
                              updateVisitStatus(visit.id, value, reason)
                            }
                          } else {
                            updateVisitStatus(visit.id, value)
                          }
                        }}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="In-Progress">In-Progress</SelectItem>
                          <SelectItem value="Done">Done</SelectItem>
                          <SelectItem value="Blocked">Blocked</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>
              </Card>
            ))}
        </div>
      </div>
    )
  }
