"use client"

import { useForm, useFieldArray } from "react-hook-form"
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
    FormDescription,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Plus, Trash2, GripVertical } from "lucide-react"
import { useState } from "react"
import api from "@/lib/api"

const pipelineSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    is_default: z.boolean().default(false),
    rotten_days: z.coerce.number().min(0).default(30),
    stages: z.array(z.object({
        id: z.string().optional(),
        name: z.string().min(1, "Stage name is required"),
        code: z.string().optional(),
        description: z.string().optional(),
        probability: z.coerce.number().min(0).max(100).default(100),
        sort_order: z.number().optional(),
    })).min(1, "At least one stage is required"),
})

type PipelineFormValues = z.infer<typeof pipelineSchema>

interface PipelineFormProps {
    initialData?: any
    onSuccess?: () => void
    onCancel?: () => void
    isViewOnly?: boolean
}

export function PipelineForm({ initialData, onSuccess, onCancel, isViewOnly = false }: PipelineFormProps) {
    const [isSubmitting, setIsSubmitting] = useState(false)

    const form = useForm<PipelineFormValues>({
        resolver: zodResolver(pipelineSchema),
        defaultValues: {
            name: initialData?.name || "",
            is_default: initialData?.is_default === 1 || initialData?.is_default === true,
            rotten_days: initialData?.rotten_days || 30,
            stages: initialData?.stages?.map((s: any) => ({
                id: s.id?.toString() || "",
                name: s.name || "",
                code: s.code || "",
                description: s.description || "",
                probability: s.probability !== undefined ? s.probability : 100,
                sort_order: s.sort_order || 0
            })) || [
                    { name: "Qualification", code: "qualification", description: "A lead has been contacted and meets your ICP and BANT criteria.", probability: 10, sort_order: 1 },
                    { name: "Discovery / Demo", code: "discovery", description: "A formal meeting or demo has been held to uncover pain points and present value.", probability: 30, sort_order: 2 },
                    { name: "Proposal Sent", code: "proposal", description: "A formal quote or contract has been delivered to the prospect.", probability: 50, sort_order: 3 },
                    { name: "Negotiation", code: "negotiation", description: "The prospect is reviewing terms, legal, or pricing adjustments.", probability: 75, sort_order: 4 },
                    { name: "Verbal Agreement", code: "verbal", description: "The prospect has said \"yes\" but the paperwork is not yet signed.", probability: 90, sort_order: 5 },
                    { name: "Closed Won", code: "won", description: "The contract is signed and payment/onboarding has begun.", probability: 100, sort_order: 6 },
                    { name: "Closed Lost", code: "lost", description: "The deal is no longer active (archive for future nurturing).", probability: 0, sort_order: 7 }
                ],
        },
    })

    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: "stages",
    })

    const onSubmit = async (data: PipelineFormValues) => {
        setIsSubmitting(true)
        try {
            const payload = {
                data: {
                    type: "pipelines",
                    attributes: {
                        ...data,
                        is_default: data.is_default ? 1 : 0,
                    }
                }
            }

            if (initialData?.id) {
                await api.put(`/settings/pipelines/${initialData.id}`, payload)
                toast.success("Pipeline updated successfully")
            } else {
                await api.post("/settings/pipelines", payload)
                toast.success("Pipeline created successfully")
            }
            onSuccess?.()
        } catch (error: any) {
            toast.error(error.message || "Failed to save pipeline")
        } finally {
            setIsSubmitting(false)
        }
    }

    if (isViewOnly) {
        return (
            <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 rounded-lg border bg-muted/30">
                        <span className="text-xs text-muted-foreground block mb-1">Pipeline Name</span>
                        <span className="font-medium">{initialData?.name}</span>
                    </div>
                    <div className="p-4 rounded-lg border bg-muted/30">
                        <span className="text-xs text-muted-foreground block mb-1">Rotten Days</span>
                        <span className="font-medium">{initialData?.rotten_days}</span>
                    </div>
                </div>

                <div>
                    <h4 className="text-sm font-medium mb-3">Stages</h4>
                    <div className="space-y-2">
                        {initialData?.stages?.map((stage: any) => (
                            <div key={stage.id} className="p-3 rounded-lg border bg-card">
                                <div className="flex items-center gap-3 mb-2">
                                    <span className="text-xs font-mono text-muted-foreground w-8">#{stage.sort_order}</span>
                                    <span className="font-medium">{stage.name}</span>
                                    <div className="ml-auto flex items-center gap-3">
                                        <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">{stage.probability}%</span>
                                        <span className="text-xs text-muted-foreground uppercase tracking-wider">{stage.code}</span>
                                    </div>
                                </div>
                                {stage.description && (
                                    <div className="text-sm text-muted-foreground pl-11">
                                        {stage.description}
                                    </div>
                                )}
                            </div>
                        ))}
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
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Pipeline Name</FormLabel>
                                <FormControl>
                                    <Input placeholder="Sales Pipeline" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="rotten_days"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Rotten Days</FormLabel>
                                <FormControl>
                                    <Input type="number" {...field} />
                                </FormControl>
                                <FormDescription>Days before a lead is considered "rotten".</FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <FormField
                    control={form.control}
                    name="is_default"
                    render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                                <FormLabel className="text-base">Set as Default</FormLabel>
                                <FormDescription>
                                    New leads will automatically be assigned to this pipeline.
                                </FormDescription>
                            </div>
                            <FormControl>
                                <Switch
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                />
                            </FormControl>
                        </FormItem>
                    )}
                />

                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h4 className="text-sm font-medium">Stages</h4>
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => append({ name: "", code: "", description: "", probability: 100, sort_order: fields.length + 1 })}
                        >
                            <Plus className="h-4 w-4 mr-2" />
                            Add Stage
                        </Button>
                    </div>

                    <div className="space-y-3">
                        {fields.map((field, index) => (
                            <div key={field.id} className="flex items-start gap-4 p-4 rounded-lg border bg-card group">
                                <div className="mt-2 text-muted-foreground opacity-30 group-hover:opacity-100 cursor-grab">
                                    <GripVertical className="h-5 w-5" />
                                </div>

                                <div className="flex-1 space-y-3">
                                    <div className="grid grid-cols-12 gap-3">
                                        <div className="col-span-12 sm:col-span-5">
                                            <FormField
                                                control={form.control}
                                                name={`stages.${index}.name`}
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel className="text-xs text-muted-foreground">Name</FormLabel>
                                                        <FormControl>
                                                            <Input placeholder="Stage Name" {...field} />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </div>
                                        <div className="col-span-6 sm:col-span-4">
                                            <FormField
                                                control={form.control}
                                                name={`stages.${index}.code`}
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel className="text-xs text-muted-foreground">Code</FormLabel>
                                                        <FormControl>
                                                            <Input placeholder="Stage Code" {...field} />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </div>
                                        <div className="col-span-6 sm:col-span-3">
                                            <FormField
                                                control={form.control}
                                                name={`stages.${index}.probability`}
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel className="text-xs text-muted-foreground">Prob (%)</FormLabel>
                                                        <FormControl>
                                                            <Input type="number" min="0" max="100" {...field} />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </div>
                                    </div>

                                    <FormField
                                        control={form.control}
                                        name={`stages.${index}.description`}
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormControl>
                                                    <Input placeholder="Description (optional)" {...field} className="text-sm" />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className="text-destructive hover:text-destructive hover:bg-destructive/10 mt-2"
                                    onClick={() => remove(index)}
                                    disabled={fields.length === 1}
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="flex justify-end gap-2 pt-4">
                    <Button type="button" variant="outline" onClick={onCancel}>
                        Cancel
                    </Button>
                    <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? "Saving..." : initialData?.id ? "Update Pipeline" : "Create Pipeline"}
                    </Button>
                </div>
            </form>
        </Form>
    )
}
