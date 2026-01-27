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
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Plus, Trash2 } from "lucide-react"
import { PersonsService, OrganizationsService } from "@/services/contacts-service"
import { useEffect, useState } from "react"
import type { Person, Organization } from "@/lib/api-types"
import useSWR from "swr"
import { setFormErrors } from "@/lib/form-utils"

const contactMethodSchema = z.object({
    value: z.string().min(1, "Required"),
    label: z.string().min(1, "Label required"),
})

const personSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    emails: z.array(contactMethodSchema).default([{ value: "", label: "work" }]),
    contact_numbers: z.array(contactMethodSchema).default([{ value: "", label: "work" }]),
    job_title: z.string().optional().or(z.literal("")),
    organization_id: z.string().optional().or(z.literal("")),
})

type PersonFormValues = z.infer<typeof personSchema>

interface PersonFormProps {
    person?: Person | null
    onSuccess: () => void
    onCancel: () => void
}

export function PersonForm({ person, onSuccess, onCancel }: PersonFormProps) {
    const [isSubmitting, setIsSubmitting] = useState(false)

    // Fetch organizations for the dropdown
    const { data: orgsResponse } = useSWR(
        '/contacts/organizations',
        () => OrganizationsService.getOrganizations()
    )
    const organizations = orgsResponse?.data?.map((o: any) => ({
        id: o.id.toString(),
        name: o.name
    })) || []

    const form = useForm<PersonFormValues>({
        resolver: zodResolver(personSchema),
        defaultValues: {
            name: person?.name || "",
            emails: person?.emails?.length ? person.emails.map(e => ({ value: e.value || "", label: e.label || "work" })) : [{ value: "", label: "work" }],
            contact_numbers: person?.contact_numbers?.length ? person.contact_numbers.map(p => ({ value: p.value || "", label: p.label || "work" })) : [{ value: "", label: "work" }],
            job_title: (person as any)?.job_title || "",
            organization_id: person?.organization?.id?.toString() || "",
        },
    })

    const { fields: emailFields, append: appendEmail, remove: removeEmail } = useFieldArray({
        control: form.control,
        name: "emails"
    })

    const { fields: phoneFields, append: appendPhone, remove: removePhone } = useFieldArray({
        control: form.control,
        name: "contact_numbers"
    })

    const onSubmit = async (values: PersonFormValues) => {
        setIsSubmitting(true)
        try {
            const payload: any = {
                name: values.name,
                emails: values.emails.filter(e => e.value.trim() !== ""),
                contact_numbers: values.contact_numbers.filter(p => p.value.trim() !== ""),
                job_title: values.job_title || undefined,
                organization_id: values.organization_id && values.organization_id !== "none" ? parseInt(values.organization_id) : undefined,
            }

            if (person?.id) {
                await PersonsService.updatePerson(person.id, payload)
                toast.success("Person updated successfully")
            } else {
                await PersonsService.createPerson(payload)
                toast.success("Person created successfully")
            }
            onSuccess()
        } catch (error: any) {
            console.error("Form submission error:", error)
            setFormErrors(form, error)
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Full Name</FormLabel>
                            <FormControl>
                                <Input placeholder="John Doe" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                {/* Emails Field Array */}
                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <FormLabel>Email Addresses</FormLabel>
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="h-7 px-2"
                            onClick={() => appendEmail({ value: "", label: "work" })}
                        >
                            <Plus className="h-3.5 w-3.5 mr-1" /> Add
                        </Button>
                    </div>
                    {emailFields.map((field, index) => (
                        <div key={field.id} className="flex gap-2">
                            <FormField
                                control={form.control}
                                name={`emails.${index}.label`}
                                render={({ field }) => (
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger className="w-[100px]">
                                                <SelectValue />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="work">Work</SelectItem>
                                            <SelectItem value="home">Home</SelectItem>
                                            <SelectItem value="other">Other</SelectItem>
                                        </SelectContent>
                                    </Select>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name={`emails.${index}.value`}
                                render={({ field }) => (
                                    <FormItem className="flex-1">
                                        <FormControl>
                                            <Input placeholder="email@example.com" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            {emailFields.length > 1 && (
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => removeEmail(index)}
                                    className="text-muted-foreground hover:text-destructive"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            )}
                        </div>
                    ))}
                </div>

                {/* Phone Numbers Field Array */}
                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <FormLabel>Phone Numbers</FormLabel>
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="h-7 px-2"
                            onClick={() => appendPhone({ value: "", label: "work" })}
                        >
                            <Plus className="h-3.5 w-3.5 mr-1" /> Add
                        </Button>
                    </div>
                    {phoneFields.map((field, index) => (
                        <div key={field.id} className="flex gap-2">
                            <FormField
                                control={form.control}
                                name={`contact_numbers.${index}.label`}
                                render={({ field }) => (
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger className="w-[100px]">
                                                <SelectValue />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="work">Work</SelectItem>
                                            <SelectItem value="home">Home</SelectItem>
                                            <SelectItem value="mobile">Mobile</SelectItem>
                                            <SelectItem value="other">Other</SelectItem>
                                        </SelectContent>
                                    </Select>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name={`contact_numbers.${index}.value`}
                                render={({ field }) => (
                                    <FormItem className="flex-1">
                                        <FormControl>
                                            <Input placeholder="+1 234..." {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            {phoneFields.length > 1 && (
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => removePhone(index)}
                                    className="text-muted-foreground hover:text-destructive"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            )}
                        </div>
                    ))}
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="job_title"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Job Title</FormLabel>
                                <FormControl>
                                    <Input placeholder="Sales Manager" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="organization_id"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Organization</FormLabel>
                                <Select
                                    onValueChange={field.onChange}
                                    defaultValue={field.value}
                                    value={field.value}
                                >
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select an organization" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value="none">None</SelectItem>
                                        {organizations.map((org: any) => (
                                            <SelectItem key={org.id} value={org.id}>
                                                {org.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t">
                    <Button type="button" variant="outline" onClick={onCancel}>
                        Cancel
                    </Button>
                    <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? "Saving..." : person ? "Update Person" : "Create Person"}
                    </Button>
                </div>
            </form>
        </Form>
    )
}
