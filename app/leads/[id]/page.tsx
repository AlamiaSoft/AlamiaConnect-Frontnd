"use client"

import DashboardLayout from "@/components/dashboard-layout"
import { LeadDetail } from "@/components/leads/lead-details"
import { useParams } from "next/navigation"

export default function LeadDetailPage() {
    const params = useParams()
    const id = params.id as string

    return (
        <DashboardLayout>
            <LeadDetail leadId={id} />
        </DashboardLayout>
    )
}
