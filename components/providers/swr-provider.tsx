"use client"

import { SWRConfig } from 'swr'
import type { ReactNode } from 'react'

interface SWRProviderProps {
    children: ReactNode
}

export function SWRProvider({ children }: SWRProviderProps) {
    return (
        <SWRConfig
            value={{
                // Disable automatic revalidation
                revalidateOnFocus: false,
                revalidateOnReconnect: false,
                revalidateIfStale: false,

                // Keep data fresh but don't poll
                dedupingInterval: 2000,

                // Error retry
                shouldRetryOnError: false,
                errorRetryCount: 1,

                // Cache settings
                provider: () => new Map(),
            }}
        >
            {children}
        </SWRConfig>
    )
}
