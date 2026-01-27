"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Upload, Download, Calendar } from "lucide-react"
import { Input } from "@/components/ui/input"
import useSWR from "swr"
import api from "@/lib/api"
import { deserialize } from "@/lib/json-api"

const fetcher = (url: string) => api.get(url).then(res => deserialize(res.data))

interface AttendanceRecord {
  id: string
  employeeName: string
  employeeId: string
  date: string
  checkIn: string
  checkOut: string
  status: "Present" | "Absent" | "Late" | "Half Day"
  hours: string
}

export function AttendanceSection() {
  const { data: remoteData } = useSWR('/attendance?include=user', fetcher)

  const attendanceData: AttendanceRecord[] = remoteData ? remoteData.map((d: any) => {
    const start = new Date(d.check_in);
    const end = d.check_out ? new Date(d.check_out) : null;

    let hours = "0h 0m";
    if (end) {
      const diffMs = end.getTime() - start.getTime();
      const h = Math.floor(diffMs / 3600000);
      const m = Math.floor((diffMs % 3600000) / 60000);
      hours = `${h}h ${m}m`;
    }

    let status: any = "Present";
    if (start.getHours() > 9 || (start.getHours() === 9 && start.getMinutes() > 15)) {
      status = "Late";
    }
    if (end && (end.getTime() - start.getTime()) < 4 * 3600000) status = "Half Day";

    return {
      id: d.id,
      employeeName: d.user_name || "Unknown",
      employeeId: d.user?.id?.toString() || "EMP000",
      date: start.toISOString().split('T')[0],
      checkIn: start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      checkOut: end ? end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-',
      status: status,
      hours: hours
    }
  }) : []

  const handleCSVImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      console.log("[Alamia] CSV import triggered:", file.name)
      // CSV parsing logic would go here
    }
  }

  const getStatusColor = (status: AttendanceRecord["status"]) => {
    switch (status) {
      case "Present":
        return "bg-green-100 text-green-800 border-green-200"
      case "Late":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "Absent":
        return "bg-red-100 text-red-800 border-red-200"
      case "Half Day":
        return "bg-blue-100 text-blue-800 border-blue-200"
      default:
        return ""
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Daily Attendance</CardTitle>
            <CardDescription>Track employee attendance and working hours</CardDescription>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Calendar className="mr-2 h-4 w-4" />
              Today
            </Button>
            <label htmlFor="csv-upload">
              <Button variant="outline" size="sm" asChild>
                <span className="cursor-pointer">
                  <Upload className="mr-2 h-4 w-4" />
                  Import CSV
                </span>
              </Button>
            </label>
            <Input id="csv-upload" type="file" accept=".csv" className="hidden" onChange={handleCSVImport} />
            <Button variant="outline" size="sm">
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Employee ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Check In</TableHead>
                <TableHead>Check Out</TableHead>
                <TableHead>Hours</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {attendanceData.map((record) => (
                <TableRow key={record.id}>
                  <TableCell className="font-mono text-sm">{record.employeeId}</TableCell>
                  <TableCell className="font-medium">{record.employeeName}</TableCell>
                  <TableCell>{new Date(record.date).toLocaleDateString()}</TableCell>
                  <TableCell>{record.checkIn}</TableCell>
                  <TableCell>{record.checkOut}</TableCell>
                  <TableCell>{record.hours}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={getStatusColor(record.status)}>
                      {record.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}
