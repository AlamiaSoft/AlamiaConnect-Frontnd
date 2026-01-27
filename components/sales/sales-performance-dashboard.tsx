"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Progress } from "@/components/ui/progress"
import { TrendingUp, Users, Target, DollarSign } from "lucide-react"

type Region = "all" | "karachi" | "lahore" | "islamabad"

interface SalesManager {
  id: string
  name: string
  unitsSold: number
  revenue: number
  target: number
  region: string
}

export function SalesPerformanceDashboard() {
  const [selectedRegion, setSelectedRegion] = useState<Region>("all")

  // Mock data for sales managers
  const allManagers: SalesManager[] = [
    { id: "1", name: "Ahmed Khan", unitsSold: 24, revenue: 18500000, target: 20000000, region: "Karachi" },
    { id: "2", name: "Fatima Ali", unitsSold: 31, revenue: 25000000, target: 22000000, region: "Karachi" },
    { id: "3", name: "Hassan Raza", unitsSold: 19, revenue: 14200000, target: 18000000, region: "Lahore" },
    { id: "4", name: "Ayesha Malik", unitsSold: 28, revenue: 21500000, target: 20000000, region: "Lahore" },
    { id: "5", name: "Usman Sheikh", unitsSold: 15, revenue: 11800000, target: 15000000, region: "Islamabad" },
    { id: "6", name: "Zainab Hussain", unitsSold: 22, revenue: 17300000, target: 18000000, region: "Islamabad" },
    { id: "7", name: "Ali Akbar", unitsSold: 26, revenue: 20100000, target: 19000000, region: "Karachi" },
    { id: "8", name: "Sara Imran", unitsSold: 18, revenue: 13900000, target: 16000000, region: "Lahore" },
  ]

  // Filter managers by region
  const filteredManagers =
    selectedRegion === "all" ? allManagers : allManagers.filter((m) => m.region.toLowerCase() === selectedRegion)

  // Calculate aggregated metrics
  const totalSales = filteredManagers.reduce((sum, m) => sum + m.revenue, 0)
  const totalUnits = filteredManagers.reduce((sum, m) => sum + m.unitsSold, 0)
  const totalTarget = filteredManagers.reduce((sum, m) => sum + m.target, 0)
  const achievementPercent = totalTarget > 0 ? (totalSales / totalTarget) * 100 : 0
  const totalCommission = totalSales * 0.03 // Assuming 3% commission

  // Active leads mock data
  const activeLeads =
    selectedRegion === "all" ? 145 : selectedRegion === "karachi" ? 62 : selectedRegion === "lahore" ? 48 : 35

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-PK", {
      style: "currency",
      currency: "PKR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-balance">Sales Executive Performance</h1>
          <p className="mt-1 text-sm text-muted-foreground">Track team performance and achievement metrics</p>
        </div>
      </div>

      {/* Regional Filter Tabs */}
      <Tabs value={selectedRegion} onValueChange={(value) => setSelectedRegion(value as Region)} className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-4">
          <TabsTrigger value="all">All Pakistan</TabsTrigger>
          <TabsTrigger value="karachi">Karachi</TabsTrigger>
          <TabsTrigger value="lahore">Lahore</TabsTrigger>
          <TabsTrigger value="islamabad">Islamabad</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Top Metrics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Sales</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalSales)}</div>
            <p className="mt-1 text-xs text-muted-foreground">{totalUnits} units sold this month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active Leads</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeLeads}</div>
            <p className="mt-1 text-xs text-muted-foreground">In pipeline across region</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Target Achievement</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{achievementPercent.toFixed(1)}%</div>
            <p className="mt-1 text-xs text-muted-foreground">
              {formatCurrency(totalSales)} of {formatCurrency(totalTarget)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Commission Earned</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalCommission)}</div>
            <p className="mt-1 text-xs text-muted-foreground">Based on 3% commission rate</p>
          </CardContent>
        </Card>
      </div>

      {/* Leaderboard Table */}
      <Card>
        <CardHeader>
          <CardTitle>Sales Team Leaderboard</CardTitle>
          <CardDescription>
            Performance rankings for{" "}
            {selectedRegion === "all"
              ? "all regions"
              : selectedRegion.charAt(0).toUpperCase() + selectedRegion.slice(1)}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px]">Rank</TableHead>
                <TableHead>Sales Manager</TableHead>
                <TableHead className="text-center">Units Sold</TableHead>
                <TableHead className="text-right">Revenue</TableHead>
                <TableHead className="w-[300px]">Target vs Actual</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredManagers
                .sort((a, b) => b.revenue - a.revenue)
                .map((manager, index) => {
                  const achievementPct = (manager.revenue / manager.target) * 100
                  return (
                    <TableRow key={manager.id}>
                      <TableCell className="font-medium">#{index + 1}</TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{manager.name}</div>
                          <div className="text-xs text-muted-foreground">{manager.region}</div>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <span className="rounded-full bg-secondary px-2 py-1 text-sm font-medium">
                          {manager.unitsSold}
                        </span>
                      </TableCell>
                      <TableCell className="text-right font-medium">{formatCurrency(manager.revenue)}</TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-muted-foreground">
                              {formatCurrency(manager.revenue)} / {formatCurrency(manager.target)}
                            </span>
                            <span
                              className={`font-medium ${
                                achievementPct >= 100
                                  ? "text-green-600"
                                  : achievementPct >= 80
                                    ? "text-yellow-600"
                                    : "text-red-600"
                              }`}
                            >
                              {achievementPct.toFixed(0)}%
                            </span>
                          </div>
                          <Progress value={Math.min(achievementPct, 100)} className="h-2" />
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
