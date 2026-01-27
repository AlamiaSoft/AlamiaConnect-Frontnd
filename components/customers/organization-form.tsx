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
import { OrganizationsService } from "@/services/contacts-service"
import { useState } from "react"
import type { Organization } from "@/lib/api-types"
import { setFormErrors } from "@/lib/form-utils"

const organizationSchema = z.object({
    name: z.string().min(2, "Organization name must be at least 2 characters"),
    address: z.string().optional().or(z.literal("")),
    website: z.string().url("Invalid website URL").optional().or(z.literal("")),
    phone: z.string().optional().or(z.literal("")),
    email: z.string().email("Invalid email address").optional().or(z.literal("")),
})

type OrganizationFormValues = z.infer<typeof organizationSchema>

interface OrganizationFormProps {
    organization?: Organization | null
    onSuccess: () => void
    onCancel: () => void
}

export function OrganizationForm({ organization, onSuccess, onCancel }: OrganizationFormProps) {
    const [isSubmitting, setIsSubmitting] = useState(false)

    const form = useForm<OrganizationFormValues>({
        resolver: zodResolver(organizationSchema),
        defaultValues: {
            name: organization?.name || "",
            // Address is now an object in API, map 'address' property to form string
            address: typeof organization?.address === 'object' && organization.address ? organization.address.address : "",
            website: (organization as any)?.website || "",
            phone: (organization as any)?.phone || "",
            email: (organization as any)?.email || "",
        },
    })

    const onSubmit = async (values: OrganizationFormValues) => {
        setIsSubmitting(true)
        try {
            const payload = {
                name: values.name,
                // Wrap address string into object for Krayin-native API
                address: values.address ? { address: values.address } : undefined,
                website: values.website || undefined,
                phone: values.phone || undefined,
                email: values.email || undefined,
            }

            if (organization?.id) {
                await OrganizationsService.updateOrganization(organization.id, payload)
                toast.success("Organization updated successfully")
            } else {
                await OrganizationsService.createOrganization(payload)
                toast.success("Organization created successfully")
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
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Organization Name</FormLabel>
                            <FormControl>
                                <Input placeholder="Acme Corporation" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="address"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Address</FormLabel>
                            <FormControl>
                                <Input placeholder="123 Business St, City" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="website"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Website</FormLabel>
                            <FormControl>
                                <Input placeholder="https://acme.com" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <div className="grid grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Email</FormLabel>
                                <FormControl>
                                    <Input placeholder="info@acme.com" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="phone"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Phone</FormLabel>
                                <FormControl>
                                    <Input placeholder="+1234567890" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <div className="flex justify-end gap-3 pt-4">
                    <Button type="button" variant="outline" onClick={onCancel}>
                        Cancel
                    </Button>
                    <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? "Saving..." : organization ? "Update Organization" : "Create Organization"}
                    </Button>
                </div>
            </form>
        </Form>
    )
}
