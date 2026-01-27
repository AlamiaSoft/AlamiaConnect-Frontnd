"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Search, Upload, FileText, Package2, Ship, FileCheck } from "lucide-react"

type Shipment = {
  id: string
  supplier: string
  piNumber: string
  lcStatus: "Pending" | "Approved" | "Expired"
  gdNumber: string
  date: string
}

type DocumentType = "Bill of Lading" | "Packing List" | "Supplier Invoice" | "Customs Documents"

type DocumentSlot = {
  type: DocumentType
  icon: typeof FileText
  uploaded: boolean
  fileName?: string
}

export function ImportTracker() {
  const [serialSearch, setSerialSearch] = useState("")
  const [shipments] = useState<Shipment[]>([
    {
      id: "1",
      supplier: "Yamaha Motors Japan",
      piNumber: "PI-2024-001",
      lcStatus: "Approved",
      gdNumber: "GD-KHI-2024-1234",
      date: "2024-01-15",
    },
    {
      id: "2",
      supplier: "Honda Pakistan",
      piNumber: "PI-2024-002",
      lcStatus: "Pending",
      gdNumber: "GD-LHE-2024-5678",
      date: "2024-01-18",
    },
    {
      id: "3",
      supplier: "Suzuki International",
      piNumber: "PI-2024-003",
      lcStatus: "Approved",
      gdNumber: "GD-ISB-2024-9012",
      date: "2024-01-20",
    },
    {
      id: "4",
      supplier: "KTM Europe",
      piNumber: "PI-2024-004",
      lcStatus: "Expired",
      gdNumber: "GD-KHI-2024-3456",
      date: "2024-01-10",
    },
  ])

  const [documentSlots, setDocumentSlots] = useState<DocumentSlot[]>([
    { type: "Bill of Lading", icon: Ship, uploaded: false },
    { type: "Packing List", icon: FileCheck, uploaded: false },
    { type: "Supplier Invoice", icon: FileText, uploaded: false },
    { type: "Customs Documents", icon: Package2, uploaded: false },
  ])

  const handleFileUpload = (index: number, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const updatedSlots = [...documentSlots]
      updatedSlots[index] = {
        ...updatedSlots[index],
        uploaded: true,
        fileName: file.name,
      }
      setDocumentSlots(updatedSlots)
    }
  }

  const getStatusColor = (status: Shipment["lcStatus"]) => {
    switch (status) {
      case "Approved":
        return "bg-green-100 text-green-800 border-green-200"
      case "Pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "Expired":
        return "bg-red-100 text-red-800 border-red-200"
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-semibold tracking-tight text-balance">Import Tracker</h1>
        <p className="mt-2 text-muted-foreground">Manage shipments, documents, and machinery serial numbers</p>
      </div>

      {/* Serial Number Search */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Serial Number Lookup
          </CardTitle>
          <CardDescription>Search for machinery by serial number to track its shipment status</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input
              placeholder="Enter serial number (e.g., YMH-2024-001234)"
              value={serialSearch}
              onChange={(e) => setSerialSearch(e.target.value)}
              className="flex-1"
            />
            <Button>
              <Search className="mr-2 h-4 w-4" />
              Search
            </Button>
          </div>
          {serialSearch && (
            <div className="mt-4 p-4 bg-muted rounded-md">
              <p className="text-sm text-muted-foreground">
                No results found for "{serialSearch}". Try a different serial number.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Shipments Table */}
      <Card>
        <CardHeader>
          <CardTitle>Active Shipments</CardTitle>
          <CardDescription>Track all incoming shipments and LC status</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Supplier</TableHead>
                  <TableHead>PI Number</TableHead>
                  <TableHead>LC Status</TableHead>
                  <TableHead>GD Number</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {shipments.map((shipment) => (
                  <TableRow key={shipment.id}>
                    <TableCell className="font-medium">{shipment.supplier}</TableCell>
                    <TableCell>{shipment.piNumber}</TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(shipment.lcStatus)} variant="outline">
                        {shipment.lcStatus}
                      </Badge>
                    </TableCell>
                    <TableCell>{shipment.gdNumber}</TableCell>
                    <TableCell className="text-muted-foreground">{shipment.date}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Document Repository */}
      <Card>
        <CardHeader>
          <CardTitle>Document Repository</CardTitle>
          <CardDescription>Upload and manage import documentation</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {documentSlots.map((slot, index) => (
              <div key={slot.type} className="relative">
                <div
                  className={`flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-lg transition-colors ${
                    slot.uploaded
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/50 hover:bg-muted/50"
                  }`}
                >
                  <slot.icon className={`h-10 w-10 mb-3 ${slot.uploaded ? "text-primary" : "text-muted-foreground"}`} />
                  <Label htmlFor={`file-${index}`} className="text-sm font-medium text-center mb-2 cursor-pointer">
                    {slot.type}
                  </Label>
                  {slot.uploaded ? (
                    <div className="text-center">
                      <p className="text-xs text-muted-foreground truncate max-w-full px-2">{slot.fileName}</p>
                      <Badge className="mt-2" variant="secondary">
                        Uploaded
                      </Badge>
                    </div>
                  ) : (
                    <Button variant="outline" size="sm" className="mt-2 bg-transparent" asChild>
                      <label htmlFor={`file-${index}`} className="cursor-pointer">
                        <Upload className="mr-2 h-3 w-3" />
                        Upload
                      </label>
                    </Button>
                  )}
                  <input
                    id={`file-${index}`}
                    type="file"
                    className="hidden"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={(e) => handleFileUpload(index, e)}
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
