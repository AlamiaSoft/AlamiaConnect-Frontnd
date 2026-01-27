"use client"
export const runtime = 'edge';

import DashboardLayout from "@/components/dashboard-layout"
import { LeadForm } from "@/components/leads/lead-form"
import { LeadsService } from "@/services/leads-service"
import { useParams, useRouter } from "next/navigation"
import useSWR from "swr"
import { Skeleton } from "@/components/ui/skeleton"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function EditLeadPage() {
    const params = useParams()
    const router = useRouter()
    const id = params.id as string

    // Fetch lead data
    const { data: leadResponse, isLoading, error } = useSWR(
        id ? `/leads/${id}` : null,
        () => LeadsService.getLead(id)
    )

    const lead = leadResponse?.data

    if (isLoading) {
        return (
            <DashboardLayout>
                <div className="space-y-6">
                    <div className="flex items-center gap-4">
                        <Skeleton className="h-10 w-10 rounded-md" />
                        <Skeleton className="h-8 w-48" />
                    </div>
                    <div className="space-y-4">
                        <Skeleton className="h-[200px] w-full rounded-md" />
                    </div>
                </div>
            </DashboardLayout>
        )
    }

    if (error || !lead) {
        return (
            <DashboardLayout>
                <div className="flex flex-col items-center justify-center h-full space-y-4 text-center">
                    <h2 className="text-xl font-semibold">Lead not found</h2>
                    <p className="text-muted-foreground">The lead you are trying to edit does not exist or has been removed.</p>
                    <Button onClick={() => router.push("/leads")}>Back to Leads</Button>
                </div>
            </DashboardLayout>
        )
    }

    return (
        <DashboardLayout>
            <div className="space-y-6 max-w-4xl mx-auto">
                <div className="flex items-center gap-4 mb-6">
                    <Button variant="ghost" size="icon" onClick={() => router.back()}>
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <div>
                        <h1 className="text-2xl font-semibold tracking-tight">Edit Lead</h1>
                        <p className="text-sm text-muted-foreground">Manage lead details and products.</p>
                    </div>
                </div>

                <LeadForm
                    initialData={lead.attributes}
                    id={id}
                    onSuccess={() => {
                        router.push("/leads");
                        router.refresh();
                    }}
                />
            </div>
        </DashboardLayout>
    )
}
