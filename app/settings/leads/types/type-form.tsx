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
import { useState } from "react"
import api from "@/lib/api"

const typeSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
})

type TypeFormValues = z.infer<typeof typeSchema>

interface LeadTypeFormProps {
    initialData?: any
    onSuccess?: () => void
    onCancel?: () => void
    isViewOnly?: boolean
}

export function LeadTypeForm({ initialData, onSuccess, onCancel, isViewOnly = false }: LeadTypeFormProps) {
    const [isSubmitting, setIsSubmitting] = useState(false)

    const form = useForm<TypeFormValues>({
        resolver: zodResolver(typeSchema),
        defaultValues: {
            name: initialData?.name || "",
        },
    })

    const onSubmit = async (data: TypeFormValues) => {
        setIsSubmitting(true)
        try {
            const payload = {
                data: {
                    type: "types",
                    attributes: data
                }
            }

            if (initialData?.id) {
                await api.put(`/settings/types/${initialData.id}`, payload)
                toast.success("Type updated successfully")
            } else {
                await api.post("/settings/types", payload)
                toast.success("Type created successfully")
            }
            onSuccess?.()
        } catch (error: any) {
            toast.error(error.message || "Failed to save type")
        } finally {
            setIsSubmitting(false)
        }
    }

    if (isViewOnly) {
        return (
            <div className="space-y-4">
                <div>
                    <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-2">Type Details</h4>
                    <div className="grid grid-cols-1 gap-4 p-4 rounded-lg border bg-muted/30">
                        <div>
                            <span className="text-xs text-muted-foreground block mb-1">Name</span>
                            <span className="font-medium">{initialData?.name}</span>
                        </div>
                    </div>
                </div>
                <div className="flex justify-end gap-2 pt-4">
                    <Button type="button" variant="outline" onClick={onCancel}>
                        Close
                    </Button>
                </div>
            </div>
        )
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Type Name</FormLabel>
                            <FormControl>
                                <Input placeholder="e.g. Inbound, Outbound, Referral" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <div className="flex justify-end gap-2 pt-4">
                    <Button type="button" variant="outline" onClick={onCancel}>
                        Cancel
                    </Button>
                    <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? "Saving..." : initialData?.id ? "Update Type" : "Create Type"}
                    </Button>
                </div>
            </form>
        </Form>
    )
}
