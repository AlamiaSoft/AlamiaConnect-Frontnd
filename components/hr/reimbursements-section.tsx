"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Upload, FileText, CheckCircle, Clock, XCircle } from "lucide-react"

interface Reimbursement {
  id: string
  employeeName: string
  employeeId: string
  type: string
  amount: number
  date: string
  status: "Pending" | "Approved" | "Rejected"
  description: string
}

export function ReimbursementsSection() {
  const [reimbursements, setReimbursements] = useState<Reimbursement[]>([
    {
      id: "1",
      employeeName: "Ahmed Khan",
      employeeId: "EMP001",
      type: "Travel",
      amount: 5000,
      date: "2025-01-05",
      status: "Approved",
      description: "Client visit - Lahore",
    },
    {
      id: "2",
      employeeName: "Hassan Raza",
      employeeId: "EMP003",
      type: "Maintenance",
      amount: 3500,
      date: "2025-01-06",
      status: "Pending",
      description: "Equipment repair",
    },
  ])

  const [formData, setFormData] = useState({
    type: "",
    amount: "",
    description: "",
    receipt: null as File | null,
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log("[Alamia] Reimbursement submitted:", formData)
    // Submit logic would go here
    setFormData({ type: "", amount: "", description: "", receipt: null })
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setFormData({ ...formData, receipt: file })
    }
  }

  const getStatusIcon = (status: Reimbursement["status"]) => {
    switch (status) {
      case "Approved":
        return <CheckCircle className="h-4 w-4" />
      case "Pending":
        return <Clock className="h-4 w-4" />
      case "Rejected":
        return <XCircle className="h-4 w-4" />
    }
  }

  const getStatusColor = (status: Reimbursement["status"]) => {
    switch (status) {
      case "Approved":
        return "bg-green-100 text-green-800 border-green-200"
      case "Pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "Rejected":
        return "bg-red-100 text-red-800 border-red-200"
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* Submission Form */}
      <Card>
        <CardHeader>
          <CardTitle>Submit Reimbursement</CardTitle>
          <CardDescription>Submit expense claims for travel or maintenance</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="type">Expense Type</Label>
              <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
                <SelectTrigger id="type">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="travel">Travel</SelectItem>
                  <SelectItem value="maintenance">Maintenance</SelectItem>
                  <SelectItem value="fuel">Fuel</SelectItem>
                  <SelectItem value="accommodation">Accommodation</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="amount">Amount (PKR)</Label>
              <Input
                id="amount"
                type="number"
                placeholder="0"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Provide details about the expense"
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="receipt">Receipt/Proof</Label>
              <div className="flex items-center gap-2">
                <label htmlFor="receipt-upload" className="flex-1">
                  <div className="flex items-center gap-2 rounded-md border border-input bg-background px-3 py-2 text-sm cursor-pointer hover:bg-accent">
                    <Upload className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">
                      {formData.receipt ? formData.receipt.name : "Upload receipt image"}
                    </span>
                  </div>
                </label>
                <Input
                  id="receipt-upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </div>
            </div>

            <Button type="submit" className="w-full">
              <FileText className="mr-2 h-4 w-4" />
              Submit Claim
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Recent Reimbursements */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Reimbursements</CardTitle>
          <CardDescription>Track your submitted expense claims</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Type</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reimbursements.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium capitalize">{item.type}</div>
                        <div className="text-xs text-muted-foreground">{item.description}</div>
                      </div>
                    </TableCell>
                    <TableCell className="font-mono">
                      {new Intl.NumberFormat("en-PK", {
                        style: "currency",
                        currency: "PKR",
                        minimumFractionDigits: 0,
                      }).format(item.amount)}
                    </TableCell>
                    <TableCell>{new Date(item.date).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={getStatusColor(item.status)}>
                        <span className="mr-1">{getStatusIcon(item.status)}</span>
                        {item.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
