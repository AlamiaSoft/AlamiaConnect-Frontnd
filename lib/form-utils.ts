import { UseFormReturn, FieldValues, Path } from "react-hook-form"
import { JsonApiError } from "@/lib/api-types"

/**
 * Maps JSON:API validation errors to React Hook Form errors.
 * 
 * @param form - The react-hook-form instance
 * @param error - The error response object from the API
 */
export function setFormErrors<T extends FieldValues>(
    form: UseFormReturn<T>,
    error: any
) {
    if (!error?.response?.data?.errors) {
        return
    }

    const errors = error.response.data.errors

    // Handle generic Laravel validation errors (legacy format)
    // { message: "...", errors: { "field": ["error"] } }
    if (!Array.isArray(errors) && typeof errors === 'object') {
        Object.entries(errors).forEach(([key, messages]) => {
            const message = Array.isArray(messages) ? messages[0] : messages as string
            form.setError(key as Path<T>, {
                type: "server",
                message: message
            })
        })
        return
    }

    // Handle JSON:API error objects array
    // [{ code: "422", source: { pointer: "/data/attributes/email" }, detail: "Email already taken" }]
    if (Array.isArray(errors)) {
        errors.forEach((err: any) => {
            if (err.status === "422" || err.code === "422") {
                // Extract field name from pointer (e.g. "/data/attributes/email" -> "email")
                let fieldName = err.source?.pointer?.split('/').pop()

                // Handle direct parameter source if valid pointer is missing
                if (!fieldName && err.source?.parameter) {
                    fieldName = err.source.parameter
                }

                if (fieldName) {
                    form.setError(fieldName as Path<T>, {
                        type: "server",
                        message: err.detail || err.title
                    })
                }
            }
        })
    }
}
