"use client"

import type React from "react"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { MapPin, Camera, CheckCircle2, Clock, AlertCircle, FileText } from "lucide-react"

type VisitPurpose = "Negotiation" | "Routine" | "Service" | "Complaint"
type VisitStatus = "Done" | "In-Progress" | "Blocked"

interface Visit {
  id: string
  purpose: VisitPurpose
  status?: VisitStatus
  location?: { lat: number; lng: number }
  photos: string[]
  blockedReason?: string
  invoiced: boolean
  timestamp: Date
  clientName: string
}

export function FieldVisitLogger() {
  const [visits, setVisits] = useState<Visit[]>([
    {
      id: "1",
      purpose: "Service",
      status: "Done",
      location: { lat: 24.8607, lng: 67.0011 },
      photos: ["/placeholder.svg?height=100&width=100"],
      invoiced: false,
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      clientName: "ABC Corporation",
    },
    {
      id: "2",
      purpose: "Negotiation",
      location: { lat: 24.8615, lng: 67.0025 },
      photos: [],
      invoiced: true,
      timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000),
      clientName: "XYZ Enterprises",
    },
  ])

  const [showLogForm, setShowLogForm] = useState(false)
  const [newVisit, setNewVisit] = useState<Partial<Visit>>({
    purpose: "Routine",
    photos: [],
    invoiced: false,
  })

  const captureGPS = () => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setNewVisit({
            ...newVisit,
            location: {
              lat: position.coords.latitude,
              lng: position.coords.longitude,
            },
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

  const logVisit = () => {
    const visit: Visit = {
      id: String(visits.length + 1),
      purpose: (newVisit.purpose as VisitPurpose) || "Routine",
      status: newVisit.purpose === "Service" ? "In-Progress" : undefined,
      location: newVisit.location,
      photos: newVisit.photos || [],
      blockedReason: newVisit.blockedReason,
      invoiced: false,
      timestamp: new Date(),
      clientName: newVisit.clientName || "Unknown Client",
    }
    setVisits([visit, ...visits])
    setNewVisit({ purpose: "Routine", photos: [], invoiced: false })
    setShowLogForm(false)
  }

  const updateVisitStatus = (id: string, status: VisitStatus, blockedReason?: string) => {
    setVisits(visits.map((visit) => (visit.id === id ? { ...visit, status, blockedReason } : visit)))
  }

  const pendingBillCount = visits.filter((v) => v.purpose === "Service" && v.status === "Done" && !v.invoiced).length

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Field Visit Logging</h1>
          <p className="text-muted-foreground">Track client visits and service calls</p>
        </div>
        <div className="flex gap-2">
          {pendingBillCount > 0 && (
            <Badge variant="destructive" className="h-10 px-4 text-sm">
              <FileText className="mr-2 h-4 w-4" />
              {pendingBillCount} Bill{pendingBillCount > 1 ? "s" : ""} Pending
            </Badge>
          )}
          <Button onClick={() => setShowLogForm(!showLogForm)}>{showLogForm ? "Cancel" : "Log New Visit"}</Button>
        </div>
      </div>

      {showLogForm && (
        <Card className="p-6">
          <h2 className="mb-4 text-xl font-semibold">New Visit Entry</h2>
          <div className="space-y-4">
            <div>
              <Label htmlFor="clientName">Client Name</Label>
              <Input
                id="clientName"
                placeholder="Enter client name"
                value={newVisit.clientName || ""}
                onChange={(e) => setNewVisit({ ...newVisit, clientName: e.target.value })}
              />
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
              <Label>Location</Label>
              <div className="flex gap-2">
                <Button type="button" variant="outline" className="w-full bg-transparent" onClick={captureGPS}>
                  <MapPin className="mr-2 h-4 w-4" />
                  {newVisit.location
                    ? `${newVisit.location.lat.toFixed(4)}, ${newVisit.location.lng.toFixed(4)}`
                    : "Capture GPS Location"}
                </Button>
              </div>
            </div>

            <div>
              <Label htmlFor="photo">Upload Photos</Label>
              <div className="flex gap-2">
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
                  className="w-full bg-transparent"
                  onClick={() => document.getElementById("photo")?.click()}
                >
                  <Camera className="mr-2 h-4 w-4" />
                  Upload Photos ({newVisit.photos?.length || 0})
                </Button>
              </div>
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

            <Button onClick={logVisit} className="w-full">
              Log Visit
            </Button>
          </div>
        </Card>
      )}

      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Recent Visits</h2>
        {visits.map((visit) => (
          <Card key={visit.id} className="p-4">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex-1 space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-semibold">{visit.clientName}</h3>
                  <Badge variant="outline">{visit.purpose}</Badge>
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
