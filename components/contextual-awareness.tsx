"use client"

import { useEffect, useState } from "react"
import { usePathname } from "next/navigation"

// ContextualAwareness: Captures current page state for the AI
export function ContextualAwareness() {
    const pathname = usePathname()
    const [pageState, setPageState] = useState<any>(null)

    useEffect(() => {
        // Collect page metadata
        const collectStats = () => {
            const state = {
                url: window.location.href,
                pathname,
                title: document.title,
                timestamp: new Date().toISOString(),
                // Potentially extract data-ids or content snippets
            }
            setPageState(state)

            // Pass to a global window variable or a state store for the Voice Assistant
            if (typeof window !== "undefined") {
                (window as any).ALAMIA_PAGE_STATE = state
            }
        }

        collectStats()
        // Optional: Re-collect on interactions or DOM changes
    }, [pathname])

    return null // Headless component
}
