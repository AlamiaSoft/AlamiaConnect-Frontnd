"use client"

import { useForm, useFieldArray } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { toast } from "sonner"
import {
    Form,
    FormControl,
    FormDescription,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { LeadsService } from "@/services/leads-service"
import { PersonsService } from "@/services/contacts-service"
import { ProductsService } from "@/services/products-service"
import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import useSWR from "swr"
import { Plus, Trash2 } from "lucide-react"

// Product Schema
const productSchema = z.object({
    product_id: z.string().min(1, "Product is required"),
    name: z.string(),
    price: z.number().min(0),
    quantity: z.number().min(1, "Quantity must be at least 1"),
    amount: z.number().min(0),
})

// New Person Schema (Subset of PersonForm schema)
const newPersonSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Invalid email address").optional().or(z.literal("")),
    phone: z.string().min(3, "Phone is required").optional().or(z.literal("")),
    organization_name: z.string().optional()
})

// Main Lead Schema
const leadSchema = z.object({
    title: z.string().min(2, "Title is required"),
    description: z.string().optional(),

    // Mode toggles validation
    selection_mode: z.enum(["existing", "new"]),

    // Existing Person Mode
    person_id: z.string().optional(),

    // New Person Mode
    new_person: newPersonSchema.optional(),

    lead_value: z.string().optional().refine((val) => !val || !isNaN(Number(val)), {
        message: "Must be a valid number",
    }),
    lead_type_id: z.string().optional(),
    lead_source_id: z.string().optional(),
    products: z.array(productSchema).optional(),
}).superRefine((data, ctx) => {
    if (data.selection_mode === "existing" && !data.person_id) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Please select a person",
            path: ["person_id"]
        })
    }
    if (data.selection_mode === "new") {
        if (!data.new_person?.name) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "Name is required",
                path: ["new_person", "name"]
            })
        }
        // Basic requirement: at least one contact method usually, but let's stick to name for now as per schema
    }
})

type LeadFormValues = z.infer<typeof leadSchema>

interface LeadFormProps {
    initialData?: any
    id?: string | number // Lead ID for update mode
    onSuccess?: () => void
    onCancel?: () => void
}

export function LeadForm({ initialData, id, onSuccess, onCancel }: LeadFormProps) {
    const router = useRouter()
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [activeTab, setActiveTab] = useState<"existing" | "new">("existing")

    // Fetch persons for selection
    const { data: personsResponse, isLoading: personsLoading, mutate: refreshPersons } = useSWR(
        '/contacts/persons?perPage=100',
        () => PersonsService.getPersons({ perPage: 100 })
    )

    // Fetch products
    const { data: productsResponse, isLoading: productsLoading } = useSWR(
        '/products?perPage=100',
        () => ProductsService.getProducts({ perPage: 100 })
    )

    const persons = personsResponse?.data || []
    const availableProducts = productsResponse?.data || []

    const form = useForm<LeadFormValues>({
        resolver: zodResolver(leadSchema),
        defaultValues: {
            title: initialData?.title || "",
            description: initialData?.description || "",
            selection_mode: "existing",
            person_id: initialData?.person?.id?.toString() || initialData?.person_id?.toString() || "",
            new_person: {
                name: "",
                email: "",
                phone: "",
                organization_name: ""
            },
            lead_value: initialData?.lead_value?.toString() || "",
            lead_type_id: initialData?.lead_type_id?.toString() || "",
            lead_source_id: initialData?.lead_source_id?.toString() || "",
            // Map products from API response (usually in 'products' relation) to form structure
            products: initialData?.products?.map((p: any) => ({
                product_id: p.product_id?.toString() || p.id?.toString(), // Handle both structure variations if any
                name: p.name,
                price: parseFloat(p.price),
                quantity: parseInt(p.quantity),
                amount: parseFloat(p.amount)
            })) || [],
        },
    })

    // Sync tab state with form mode
    useEffect(() => {
        form.setValue("selection_mode", activeTab)
    }, [activeTab, form])

    const { fields: productFields, append: appendProduct, remove: removeProduct } = useFieldArray({
        control: form.control,
        name: "products",
    })

    const watchProducts = form.watch("products") || []

    const handleProductSelect = (index: number, productId: string) => {
        const product = availableProducts.find((p: any) => p.id.toString() === productId)
        if (product) {
            const price = parseFloat(product.price || "0")
            const quantity = form.getValues(`products.${index}.quantity`) || 1

            form.setValue(`products.${index}.product_id`, productId)
            form.setValue(`products.${index}.name`, product.name)
            form.setValue(`products.${index}.price`, price)
            form.setValue(`products.${index}.amount`, price * quantity)
        }
    }

    const handleQuantityChange = (index: number, quantity: number) => {
        const price = form.getValues(`products.${index}.price`) || 0
        form.setValue(`products.${index}.quantity`, quantity)
        form.setValue(`products.${index}.amount`, price * quantity)
    }

    useEffect(() => {
        const total = watchProducts.reduce((sum, item) => sum + (item.amount || 0), 0)
        if (total > 0) {
            form.setValue("lead_value", total.toFixed(2))
        }
    }, [watchProducts, form])

    const onSubmit = async (values: LeadFormValues) => {
        setIsSubmitting(true)
        try {
            const payload: any = {
                title: values.title,
                description: values.description,
                lead_value: values.lead_value ? parseFloat(values.lead_value) : 0,
                // Status/Pipeline usually handled via specific actions or dragged in Kanban, 
                // but needed for creation defaults.
                status: 1,
                lead_pipeline_id: 1,
                lead_pipeline_stage_id: 1,
                products: values.products?.map(p => ({
                    product_id: parseInt(p.product_id),
                    name: p.name,
                    price: p.price,
                    quantity: p.quantity,
                    amount: p.amount
                }))
            };

            // Person Handling
            if (values.selection_mode === "existing" && values.person_id) {
                payload.person_id = parseInt(values.person_id);
            } else if (values.selection_mode === "new" && values.new_person) {
                // Atomic creation/update payload
                payload.person = {
                    name: values.new_person.name,
                    emails: values.new_person.email ? [{ label: "work", value: values.new_person.email }] : [],
                    contact_numbers: values.new_person.phone ? [{ label: "work", value: values.new_person.phone }] : [],
                    organization_name: values.new_person.organization_name
                };
            } else {
                throw new Error("Please select or create a person.");
            }

            if (id) {
                // Update Mode
                await LeadsService.updateLead(id, payload);
                toast.success("Lead updated successfully");
            } else {
                // Create Mode
                await LeadsService.createLead(payload);
                toast.success("Lead created successfully");
            }

            if (onSuccess) {
                onSuccess();
            } else {
                router.push("/leads");
                router.refresh();
            }
        } catch (error: any) {
            console.error("Failed to save lead:", error);
            // Enhanced error handling for field-specific errors if available
            if (error?.errors) {
                // Map backend validation errors to form
                Object.keys(error.errors).forEach((key) => {
                    // Check if error is related to person fields in atomic payload
                    if (key.startsWith('person.')) {
                        form.setError(`new_person.${key.split('.')[1]}` as any, { message: error.errors[key][0] });
                    } else {
                        form.setError(key as any, { message: error.errors[key][0] });
                    }
                });
                toast.error("Please check the form for errors.");
            } else {
                toast.error(error.message || "Failed to save lead");
            }
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

                <div className="space-y-4">
                    {/* Basic Lead Info */}
                    <FormField
                        control={form.control}
                        name="title"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Lead Title</FormLabel>
                                <FormControl>
                                    <Input placeholder="e.g. Sales Inquiry from Website" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {/* Person Selection / Creation Tabs */}
                    <div className="border rounded-md p-4 bg-slate-50 dark:bg-slate-900/50">
                        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "existing" | "new")} className="w-full">
                            <TabsList className="grid w-full grid-cols-2 mb-4">
                                <TabsTrigger value="existing">Select Existing Person</TabsTrigger>
                                <TabsTrigger value="new">Create New Person</TabsTrigger>
                            </TabsList>

                            <TabsContent value="existing">
                                <FormField
                                    control={form.control}
                                    name="person_id"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Contact Person</FormLabel>
                                            <Select
                                                onValueChange={field.onChange}
                                                defaultValue={field.value}
                                                disabled={personsLoading}
                                            >
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder={personsLoading ? "Loading persons..." : "Select a person"} />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {persons.map((person: any) => (
                                                        <SelectItem key={person.id} value={person.id.toString()}>
                                                            {person.name}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </TabsContent>

                            <TabsContent value="new" className="space-y-4">
                                <FormField
                                    control={form.control}
                                    name="new_person.name"
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
                                <div className="grid grid-cols-2 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="new_person.email"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Email</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="john@example.com" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="new_person.phone"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Phone</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="+1 234..." {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            </TabsContent>
                        </Tabs>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                            control={form.control}
                            name="lead_value"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Expected Value</FormLabel>
                                    <FormControl>
                                        <Input type="number" step="0.01" placeholder="0.00" {...field} />
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
                                        <Textarea
                                            placeholder="Notes..."
                                            className="min-h-[38px] resize-none"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                </div>

                {/* Products Section */}
                <div className="space-y-4 border rounded-lg p-4 bg-slate-50 dark:bg-slate-900/50">
                    <div className="flex items-center justify-between">
                        <FormLabel>Products</FormLabel>
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => appendProduct({ product_id: "", name: "", price: 0, quantity: 1, amount: 0 })}
                        >
                            <Plus className="mr-2 h-4 w-4" /> Add Product
                        </Button>
                    </div>

                    {productFields.length === 0 && (
                        <div className="text-sm text-muted-foreground text-center py-4">No products added yet.</div>
                    )}

                    {productFields.map((field, index) => (
                        <div key={field.id} className="grid sm:grid-cols-12 gap-3 items-end border-b pb-4 last:border-0 last:pb-0">
                            {/* Product Select */}
                            <div className="sm:col-span-5">
                                <FormField
                                    control={form.control}
                                    name={`products.${index}.product_id`}
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-xs">Product</FormLabel>
                                            <Select
                                                onValueChange={(val) => handleProductSelect(index, val)}
                                                defaultValue={field.value}
                                            >
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select Product" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {availableProducts.map((p: any) => (
                                                        <SelectItem key={p.id} value={p.id.toString()}>
                                                            {p.name} - ${Number(p.price).toFixed(2)}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </FormItem>
                                    )}
                                />
                            </div>

                            {/* Quantity */}
                            <div className="sm:col-span-2">
                                <FormField
                                    control={form.control}
                                    name={`products.${index}.quantity`}
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-xs">Qty</FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="number"
                                                    min="1"
                                                    {...field}
                                                    onChange={(e) => handleQuantityChange(index, parseInt(e.target.value) || 0)}
                                                />
                                            </FormControl>
                                        </FormItem>
                                    )}
                                />
                            </div>

                            {/* Price (Read-onlyish) */}
                            <div className="sm:col-span-2">
                                <FormField
                                    control={form.control}
                                    name={`products.${index}.price`}
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-xs">Price</FormLabel>
                                            <FormControl>
                                                <Input type="number" step="0.01" {...field} readOnly className="bg-muted" />
                                            </FormControl>
                                        </FormItem>
                                    )}
                                />
                            </div>

                            {/* Amount (Read-only) */}
                            <div className="sm:col-span-2">
                                <FormField
                                    control={form.control}
                                    name={`products.${index}.amount`}
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-xs">Amount</FormLabel>
                                            <FormControl>
                                                <Input type="number" step="0.01" {...field} readOnly className="bg-muted" />
                                            </FormControl>
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <div className="sm:col-span-1">
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => removeProduct(index)}
                                    className="text-destructive hover:text-destructive"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t">
                    <Button
                        type="button"
                        variant="ghost"
                        onClick={() => onCancel ? onCancel() : router.back()}
                    >
                        Cancel
                    </Button>
                    <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? "Processing..." : (activeTab === 'new' ? "Create Lead & Person" : "Create Lead")}
                    </Button>
                </div>
            </form>
        </Form>
    )
}
