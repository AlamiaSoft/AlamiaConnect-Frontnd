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
    FormDescription,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { useState, useEffect } from "react"
import useSWR from "swr"
import api from "@/lib/api"
import { SettingsService } from "@/services/settings-service"

const userSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters").optional().or(z.literal("")),
    confirm_password: z.string().optional().or(z.literal("")),
    role_id: z.string().min(1, "Please select a role"),
    status: z.boolean().default(true),
    view_permission: z.enum(["global", "individual"]).default("individual"),
}).refine((data) => {
    if (data.password && data.password !== data.confirm_password) {
        return false;
    }
    return true;
}, {
    message: "Passwords don't match",
    path: ["confirm_password"],
})

type UserFormValues = z.infer<typeof userSchema>

interface UserFormProps {
    initialData?: any
    onSuccess?: () => void
    onCancel?: () => void
    isViewOnly?: boolean
}

export function UserForm({ initialData, onSuccess, onCancel, isViewOnly = false }: UserFormProps) {
    const [isSubmitting, setIsSubmitting] = useState(false)
    const { data: rolesResponse } = useSWR('roles', () => SettingsService.getRoles())

    const roles = Array.isArray(rolesResponse) ? rolesResponse : []

    const form = useForm<UserFormValues>({
        resolver: zodResolver(userSchema),
        defaultValues: {
            name: initialData?.name || "",
            email: initialData?.email || "",
            password: "",
            confirm_password: "",
            role_id: initialData?.role_id?.toString() || "",
            status: initialData?.status === 1 || initialData?.status === true || !initialData,
            view_permission: initialData?.view_permission || "individual",
        },
    })

    const onSubmit = async (data: UserFormValues) => {
        setIsSubmitting(true)
        try {
            const payload = {
                ...data,
                status: data.status ? 1 : 0
            }

            if (initialData?.id) {
                await SettingsService.updateUser(initialData.id, payload)
                toast.success("User updated successfully")
            } else {
                await SettingsService.createUser(payload)
                toast.success("User created successfully")
            }
            onSuccess?.()
        } catch (error: any) {
            toast.error(error.message || "Failed to save user")
        } finally {
            setIsSubmitting(false)
        }
    }

    if (isViewOnly) {
        return (
            <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 rounded-lg border bg-muted/30">
                        <span className="text-xs text-muted-foreground block mb-1">Full Name</span>
                        <span className="font-medium">{initialData?.name}</span>
                    </div>
                    <div className="p-4 rounded-lg border bg-muted/30">
                        <span className="text-xs text-muted-foreground block mb-1">Email Address</span>
                        <span className="font-medium">{initialData?.email}</span>
                    </div>
                    <div className="p-4 rounded-lg border bg-muted/30">
                        <span className="text-xs text-muted-foreground block mb-1">Role</span>
                        <span className="font-medium">{roles.find(r => r.id == initialData?.role_id)?.name || initialData?.role_id}</span>
                    </div>
                    <div className="p-4 rounded-lg border bg-muted/30">
                        <span className="text-xs text-muted-foreground block mb-1">Status</span>
                        <span className="font-medium">{initialData?.status ? "Active" : "Inactive"}</span>
                    </div>
                    <div className="p-4 rounded-lg border bg-muted/30 col-span-2">
                        <span className="text-xs text-muted-foreground block mb-1">View Permission</span>
                        <span className="font-medium capitalize">{initialData?.view_permission}</span>
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
                <div className="grid grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Name</FormLabel>
                                <FormControl>
                                    <Input placeholder="John Doe" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Email</FormLabel>
                                <FormControl>
                                    <Input type="email" placeholder="john@example.com" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="password"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>{initialData?.id ? "Change Password" : "Password"}</FormLabel>
                                <FormControl>
                                    <Input type="password" placeholder="******" {...field} />
                                </FormControl>
                                <FormDescription>
                                    {initialData?.id ? "Leave blank to keep current password" : "Minimum 6 characters"}
                                </FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="confirm_password"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Confirm Password</FormLabel>
                                <FormControl>
                                    <Input type="password" placeholder="******" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="role_id"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Role</FormLabel>
                                <Select onValueChange={field.onChange} value={field.value}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select a role" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {roles.map((role) => (
                                            <SelectItem key={role.id} value={role.id.toString()}>
                                                {role.name}
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
                        name="view_permission"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>View Permission</FormLabel>
                                <Select onValueChange={field.onChange} value={field.value}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select permission" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value="individual">Individual</SelectItem>
                                        <SelectItem value="global">Global</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                                <FormLabel className="text-base">Active Status</FormLabel>
                                <FormDescription>
                                    Allow this user to login to the system.
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

                <div className="flex justify-end gap-2 pt-4">
                    <Button type="button" variant="outline" onClick={onCancel}>
                        Cancel
                    </Button>
                    <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? "Saving..." : initialData?.id ? "Update User" : "Create User"}
                    </Button>
                </div>
            </form>
        </Form>
    )
}
