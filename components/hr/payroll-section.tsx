"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { DollarSign, TrendingUp, Target, Award } from "lucide-react"

interface PayrollData {
  employeeName: string
  employeeId: string
  baseSalary: number
  commission: number
  bonus: number
  deductions: number
  netSalary: number
  salesTarget: number
  salesAchieved: number
  commissionRate: number
}

export function PayrollSection() {
  const payrollData: PayrollData[] = [
    {
      employeeName: "Ahmed Khan",
      employeeId: "EMP001",
      baseSalary: 80000,
      commission: 12000,
      bonus: 5000,
      deductions: 8000,
      netSalary: 89000,
      salesTarget: 500000,
      salesAchieved: 620000,
      commissionRate: 2,
    },
    {
      employeeName: "Fatima Ali",
      employeeId: "EMP002",
      baseSalary: 75000,
      commission: 9000,
      bonus: 3000,
      deductions: 7500,
      netSalary: 79500,
      salesTarget: 450000,
      salesAchieved: 480000,
      commissionRate: 2,
    },
  ]

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-PK", {
      style: "currency",
      currency: "PKR",
      minimumFractionDigits: 0,
    }).format(amount)
  }

  return (
    <div className="space-y-6">
      {payrollData.map((employee) => (
        <Card key={employee.employeeId}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>{employee.employeeName}</CardTitle>
                <CardDescription>Employee ID: {employee.employeeId}</CardDescription>
              </div>
              <div className="text-right">
                <div className="text-sm text-muted-foreground">Net Salary</div>
                <div className="text-2xl font-bold text-primary">{formatCurrency(employee.netSalary)}</div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              {/* Monthly Salary Breakdown */}
              <div className="space-y-4">
                <h3 className="font-semibold text-sm flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  Monthly Salary Breakdown
                </h3>
                <div className="space-y-3 rounded-lg border bg-muted/30 p-4">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Base Salary</span>
                    <span className="text-sm font-medium">{formatCurrency(employee.baseSalary)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Commission</span>
                    <span className="text-sm font-medium text-green-600">+{formatCurrency(employee.commission)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Bonus</span>
                    <span className="text-sm font-medium text-green-600">+{formatCurrency(employee.bonus)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Deductions</span>
                    <span className="text-sm font-medium text-red-600">-{formatCurrency(employee.deductions)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between">
                    <span className="text-sm font-semibold">Total</span>
                    <span className="text-sm font-bold">{formatCurrency(employee.netSalary)}</span>
                  </div>
                </div>
              </div>

              {/* Commission Details */}
              <div className="space-y-4">
                <h3 className="font-semibold text-sm flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Commission Details
                </h3>
                <div className="space-y-4 rounded-lg border bg-muted/30 p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Target className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">Sales Target</span>
                    </div>
                    <span className="text-sm font-medium">{formatCurrency(employee.salesTarget)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Award className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">Sales Achieved</span>
                    </div>
                    <span className="text-sm font-medium">{formatCurrency(employee.salesAchieved)}</span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Achievement</span>
                      <span className="font-medium">
                        {Math.round((employee.salesAchieved / employee.salesTarget) * 100)}%
                      </span>
                    </div>
                    <Progress value={(employee.salesAchieved / employee.salesTarget) * 100} className="h-2" />
                  </div>
                  <Separator />
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Commission Rate</span>
                    <span className="text-sm font-medium">{employee.commissionRate}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-semibold">Total Commission</span>
                    <span className="text-sm font-bold text-green-600">{formatCurrency(employee.commission)}</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
