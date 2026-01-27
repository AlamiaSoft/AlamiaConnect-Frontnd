
"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { toast } from "sonner"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { SalesVisitService } from "@/services/sales-visit-service"
import { LeadsService } from "@/services/leads-service"
import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import useSWR from "swr"
import { CalendarIcon } from "lucide-react"

const visitSchema = z.object({
    lead_id: z.string().min(1, "Lead is required"),
    visit_at: z.string().min(1, "Date and time are required"),
    outcome: z.string().optional(),
    notes: z.string().optional(),
})

type VisitFormValues = z.infer<typeof visitSchema>

interface VisitFormProps {
    initialData?: any
    onSuccess?: () => void
    onCancel?: () => void
    isViewOnly?: boolean
}

export function VisitForm({ initialData, onSuccess, onCancel, isViewOnly = false }: VisitFormProps) {
    const router = useRouter()
    const [isSubmitting, setIsSubmitting] = useState(false)

    // Fetch Leads for Dropdown
    const { data: leadsResponse, isLoading: leadsLoading } = useSWR(
        '/leads/active',
        () => LeadsService.getLeads({ per_page: 50, sort: 'created_at', order: 'desc' }) // Fetch recent 50 leads
    )
    const leads = leadsResponse?.data || []

    const form = useForm<VisitFormValues>({
        resolver: zodResolver(visitSchema),
        defaultValues: {
            lead_id: initialData?.lead_id?.toString() || initialData?.lead?.id?.toString() || "",
            visit_at: initialData?.visit_at ? new Date(initialData.visit_at).toISOString().slice(0, 16) : "", // valid datetime-local format
            outcome: initialData?.outcome || "",
            notes: initialData?.notes || "",
        },
    })

    const onSubmit = async (values: VisitFormValues) => {
        setIsSubmitting(true)
        try {
            const payload = {
                ...values,
                lead_id: parseInt(values.lead_id),
                // gps_lat, gps_lng can be added here if we capture location
            }

            if (initialData?.id) {
                await SalesVisitService.updateVisit(initialData.id, payload)
                toast.success("Visit updated successfully")
            } else {
                await SalesVisitService.createVisit(payload)
                toast.success("Visit scheduled successfully")
            }

            if (onSuccess) {
                onSuccess()
            }
        } catch (error: any) {
            console.error("Failed to save visit:", error)
            toast.error(error.message || "Failed to save visit")
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

                <FormField
                    control={form.control}
                    name="lead_id"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Lead</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value} disabled={isViewOnly || leadsLoading}>
                                <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder={leadsLoading ? "Loading leads..." : "Select Lead"} />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    {leads.map((l: any) => (
                                        <SelectItem key={l.id} value={l.id.toString()}>
                                            {l.title} {l.person_name ? `(${l.person_name})` : ''}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="visit_at"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Visit Date & Time</FormLabel>
                            <FormControl>
                                <Input type="datetime-local" {...field} disabled={isViewOnly} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="outcome"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Outcome</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value} disabled={isViewOnly}>
                                <FormControl>
                                    <SelectTrigger><SelectValue placeholder="Select Outcome" /></SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    <SelectItem value="scheduled">Scheduled</SelectItem>
                                    <SelectItem value="completed">Completed</SelectItem>
                                    <SelectItem value="rescheduled">Rescheduled</SelectItem>
                                    <SelectItem value="cancelled">Cancelled</SelectItem>
                                    <SelectItem value="no_show">No Show</SelectItem>
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="notes"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Notes</FormLabel>
                            <FormControl>
                                <Textarea
                                    placeholder="Enter visit notes..."
                                    className="min-h-[100px]"
                                    {...field}
                                    disabled={isViewOnly}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <div className="flex justify-end gap-3 pt-4 border-t">
                    <Button
                        type="button"
                        variant="ghost"
                        onClick={() => onCancel ? onCancel() : router.back()}
                    >
                        {isViewOnly ? "Close" : "Cancel"}
                    </Button>
                    {!isViewOnly && (
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting ? "Processing..." : (initialData?.id ? "Update Visit" : "Schedule Visit")}
                        </Button>
                    )}
                </div>
            </form>
        </Form>
    )
}
