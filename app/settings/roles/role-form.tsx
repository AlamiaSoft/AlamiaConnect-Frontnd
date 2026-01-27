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
import { Textarea } from "@/components/ui/textarea"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { useState, useEffect } from "react"
import api from "@/lib/api"
import { SettingsService } from "@/services/settings-service"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Label } from "@/components/ui/label"

const roleSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    description: z.string().min(2, "Description is required"),
    access_level: z.enum(["global", "group", "individual"]).default("individual"),
    permission_type: z.enum(["all", "custom"]),
    permissions: z.array(z.string()).optional(),
})

type RoleFormValues = z.infer<typeof roleSchema>

interface RoleFormProps {
    initialData?: any
    onSuccess?: () => void
    onCancel?: () => void
    isViewOnly?: boolean
}

interface PermissionNode {
    key: string;
    name: string;
    description?: string;
    children?: PermissionNode[];
}

export function RoleForm({ initialData, onSuccess, onCancel, isViewOnly = false }: RoleFormProps) {
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [permissionsTree, setPermissionsTree] = useState<PermissionNode[]>([])
    const [isLoadingPermissions, setIsLoadingPermissions] = useState(false)

    const form = useForm<RoleFormValues>({
        resolver: zodResolver(roleSchema),
        defaultValues: {
            name: initialData?.name || "",
            description: initialData?.description || "",
            access_level: initialData?.access_level || "individual",
            permission_type: initialData?.permission_type || "custom",
            permissions: initialData?.permissions ? Object.keys(initialData.permissions).map(key => initialData.permissions[key]) : [], // Assuming backend returns array or key-map
        },
    })


    // Fix: If initial permissions come as array of strings, use as is. If object (key=>value), map keys.
    useEffect(() => {
        if (initialData?.permissions && Array.isArray(initialData.permissions)) {
            form.setValue('permissions', initialData.permissions)
        }
    }, [initialData, form])

    useEffect(() => {
        const fetchPermissions = async () => {
            setIsLoadingPermissions(true)
            try {
                const response = await SettingsService.getPermissions()
                setPermissionsTree(response.data as unknown as PermissionNode[])
            } catch (error) {
                console.error("Failed to fetch permissions", error)
                toast.error("Failed to load permissions")
            } finally {
                setIsLoadingPermissions(false)
            }
        }
        fetchPermissions()
    }, [])

    const permissionType = form.watch("permission_type")

    const handlePermissionChange = (key: string, checked: boolean) => {
        const currentPermissions = form.getValues("permissions") || []
        if (checked) {
            form.setValue("permissions", [...currentPermissions, key])
        } else {
            form.setValue("permissions", currentPermissions.filter(k => k !== key))
        }
    }

    const getAllKeys = (nodes: PermissionNode[]): string[] => {
        let keys: string[] = []
        nodes.forEach(node => {
            keys.push(node.key)
            if (node.children) {
                keys = [...keys, ...getAllKeys(node.children)]
            }
        })
        return keys
    }

    // Helper to check/uncheck all
    const handleSelectAll = (checked: boolean) => {
        if (checked) {
            form.setValue("permissions", getAllKeys(permissionsTree))
        } else {
            form.setValue("permissions", [])
        }
    }

    // Recursive permission renderer
    const renderPermissionNode = (node: PermissionNode, level = 0) => {
        const currentPermissions = form.watch("permissions") || []
        const isChecked = currentPermissions.includes(node.key)

        // Check if all children are checked
        const childrenKeys = node.children ? getAllKeys(node.children) : []
        const areAllChildrenChecked = childrenKeys.length > 0 && childrenKeys.every(k => currentPermissions.includes(k))
        const isIndeterminate = !isChecked && childrenKeys.some(k => currentPermissions.includes(k))

        const handleNodeChange = (checked: boolean) => {
            let newPermissions = [...currentPermissions]

            // Toggle self
            if (checked) {
                if (!newPermissions.includes(node.key)) newPermissions.push(node.key)
                // Select all children
                if (node.children) {
                    const childKeys = getAllKeys(node.children)
                    childKeys.forEach(k => {
                        if (!newPermissions.includes(k)) newPermissions.push(k)
                    })
                }
            } else {
                newPermissions = newPermissions.filter(k => k !== node.key)
                // Deselect all children
                if (node.children) {
                    const childKeys = getAllKeys(node.children)
                    newPermissions = newPermissions.filter(k => !childKeys.includes(k))
                }
            }
            form.setValue("permissions", newPermissions)
        }

        return (
            <div key={node.key} className="space-y-2">
                <div className="flex items-center space-x-2 py-1" style={{ paddingLeft: `${level * 20}px` }}>
                    <Checkbox
                        id={node.key}
                        checked={isChecked}
                        onCheckedChange={(checked) => handleNodeChange(checked as boolean)}
                    />
                    <label
                        htmlFor={node.key}
                        className={`text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 ${level === 0 ? 'text-base font-semibold' : ''}`}
                    >
                        {node.name}
                    </label>
                </div>
                {node.children && node.children.map(child => renderPermissionNode(child, level + 1))}
            </div>
        )
    }

    const onSubmit = async (data: RoleFormValues) => {
        setIsSubmitting(true)
        try {
            const payload = {
                name: data.name,
                description: data.description,
                access_level: data.access_level,
                permission_type: data.permission_type,
                permissions: data.permission_type === 'custom' ? data.permissions : []
            }

            if (initialData?.id) {
                await SettingsService.updateRole(initialData.id, payload)
                toast.success("Role updated successfully")
            } else {
                await SettingsService.createRole(payload)
                toast.success("Role created successfully")
            }
            onSuccess?.()
        } catch (error: any) {
            toast.error(error.message || "Failed to save role")
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
                        <span className="font-medium">{initialData?.description}</span>
                    </div>
                    <div>
                        <span className="text-xs text-muted-foreground block mb-1">Access Type</span>
                        <span className="font-medium capitalize">{initialData?.permission_type}</span>
                    </div>
                    {initialData?.permission_type === 'custom' && (
                        <div>
                            <span className="text-xs text-muted-foreground block mb-1">Permissions</span>
                            <div className="h-48 overflow-y-auto text-sm bg-background p-2 rounded border">
                                {initialData?.permissions?.length || 0} permissions access granted
                            </div>
                        </div>
                    )}
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
                            <FormLabel>Name</FormLabel>
                            <FormControl>
                                <Input placeholder="Administrator" {...field} />
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
                                <Textarea placeholder="Full access to system..." {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="access_level"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Access Scope</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select scope" />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    <SelectItem value="global">Global (All Records)</SelectItem>
                                    <SelectItem value="group">Group (Location/Office)</SelectItem>
                                    <SelectItem value="individual">Individual (Own Records)</SelectItem>
                                </SelectContent>
                            </Select>
                            <FormDescription>
                                Defines which records users with this role can see.
                            </FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="permission_type"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Access Type</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select type" />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    <SelectItem value="custom">Custom</SelectItem>
                                    <SelectItem value="all">All Access</SelectItem>
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                {permissionType === 'custom' && (
                    <div className="border rounded-md p-4">
                        <div className="flex items-center justify-between mb-4 pb-2 border-b">
                            <Label className="text-base font-semibold">Permissions</Label>
                            <div className="flex items-center space-x-2">
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleSelectAll(true)}
                                >
                                    Select All
                                </Button>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleSelectAll(false)}
                                >
                                    Deselect All
                                </Button>
                            </div>
                        </div>

                        {isLoadingPermissions ? (
                            <div className="flex items-center justify-center p-8 text-muted-foreground">
                                Loading permissions...
                            </div>
                        ) : (
                            <div className="h-[400px] overflow-y-auto pr-4 space-y-4">
                                {permissionsTree.map(node => renderPermissionNode(node))}
                            </div>
                        )}
                    </div>
                )}

                <div className="flex justify-end gap-2 pt-4">
                    <Button type="button" variant="outline" onClick={onCancel}>
                        Cancel
                    </Button>
                    <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? "Saving..." : initialData?.id ? "Update Role" : "Create Role"}
                    </Button>
                </div>
            </form>
        </Form>
    )
}
