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
import { useState } from "react"
import { SettingsService } from "@/services/settings-service"

const groupSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    description: z.string().optional(),
})

type GroupFormValues = z.infer<typeof groupSchema>

interface GroupFormProps {
    initialData?: any
    onSuccess?: () => void
    onCancel?: () => void
    isViewOnly?: boolean
}

export function GroupForm({ initialData, onSuccess, onCancel, isViewOnly = false }: GroupFormProps) {
    const [isSubmitting, setIsSubmitting] = useState(false)

    const form = useForm<GroupFormValues>({
        resolver: zodResolver(groupSchema),
        defaultValues: {
            name: initialData?.name || "",
            description: initialData?.description || "",
        },
    })

    const onSubmit = async (data: GroupFormValues) => {
        setIsSubmitting(true)
        try {
            if (initialData?.id) {
                await SettingsService.updateGroup(initialData.id, data)
                toast.success("Group updated successfully")
            } else {
                await SettingsService.createGroup(data)
                toast.success("Group created successfully")
            }
            onSuccess?.()
        } catch (error: any) {
            toast.error(error.message || "Failed to save group")
        } finally {
            setIsSubmitting(false)
        }
    }

    if (isViewOnly) {
        return (
            <div className="space-y-4">
                <div className="grid grid-cols-1 gap-4 p-4 rounded-lg border bg-muted/30">
                    <div>
                        <span className="text-xs text-muted-foreground block mb-1">Name</span>
                        <span className="font-medium">{initialData?.name}</span>
                    </div>
                    <div>
                        <span className="text-xs text-muted-foreground block mb-1">Description</span>
                        <span className="font-medium">{initialData?.description || "No description provided."}</span>
                    </div>
                </div>
                <div className="flex justify-end gap-2 pt-4">
                    <Button type="button" variant="outline" onClick={onCancel}>Close</Button>
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
                            <FormLabel>Name</FormLabel>
                            <FormControl>
                                <Input placeholder="e.g. Sales Team or Karachi Office" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Description</FormLabel>
                            <FormControl>
                                <Textarea placeholder="Describe the purpose of this group..." {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <div className="flex justify-end gap-2 pt-4">
                    <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
                    <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? "Saving..." : initialData?.id ? "Update Group" : "Create Group"}
                    </Button>
                </div>
            </form>
        </Form>
    )
}
