"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AttendanceSection } from "./attendance-section"
import { PayrollSection } from "./payroll-section"
import { ReimbursementsSection } from "./reimbursements-section"

export function HRDashboard() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-semibold tracking-tight text-balance">HR Management</h1>
      </div>

      <Tabs defaultValue="attendance" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-3">
          <TabsTrigger value="attendance">Attendance</TabsTrigger>
          <TabsTrigger value="payroll">Payroll</TabsTrigger>
          <TabsTrigger value="reimbursements">Reimbursements</TabsTrigger>
        </TabsList>

        <TabsContent value="attendance" className="space-y-4">
          <AttendanceSection />
        </TabsContent>

        <TabsContent value="payroll" className="space-y-4">
          <PayrollSection />
        </TabsContent>

        <TabsContent value="reimbursements" className="space-y-4">
          <ReimbursementsSection />
        </TabsContent>
      </Tabs>
    </div>
  )
}
