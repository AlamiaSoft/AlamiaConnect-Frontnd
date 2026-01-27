"use client"

import React, { createContext, useContext, useState, useEffect } from "react"
import { SettingsService } from "@/services/settings-service"
import { toast } from "sonner"

export interface Group {
    id: number
    name: string
    description?: string
}

interface LocationContextType {
    selectedLocation: Group | null
    locations: Group[]
    setSelectedLocation: (location: Group | null) => void
    isLoading: boolean
}

const LocationContext = createContext<LocationContextType | undefined>(undefined)

export function LocationProvider({ children }: { children: React.ReactNode }) {
    const [selectedLocation, setSelectedLocation] = useState<Group | null>(null)
    const [locations, setLocations] = useState<Group[]>([])
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        const fetchLocations = async () => {
            try {
                const response = await SettingsService.getGroups()
                const groups = response.data || []
                setLocations(groups)

                // Try to restore from localStorage
                const storedId = localStorage.getItem('ktd_selected_location_id')
                if (storedId === 'consolidated') {
                    setSelectedLocation(null)
                } else if (storedId) {
                    const found = groups.find((g: any) => String(g.id) === storedId)
                    if (found) {
                        setSelectedLocation(found)
                    } else if (groups.length > 0) {
                        setSelectedLocation(groups[0])
                    }
                } else {
                    // Default to Consolidated View if no preference stored
                    setSelectedLocation(null)
                }
            } catch (error) {
                console.error("Failed to load locations", error)
            } finally {
                setIsLoading(false)
            }
        }

        fetchLocations()
    }, [])

    const handleSetLocation = (location: Group | null) => {
        setSelectedLocation(location)
        if (location) {
            localStorage.setItem('ktd_selected_location_id', String(location.id))
            toast.info(`Switched context to ${location.name}`)
        } else {
            localStorage.setItem('ktd_selected_location_id', 'consolidated')
            toast.info(`Switched context to Consolidated View`)
        }
    }

    return (
        <LocationContext.Provider value={{ selectedLocation, locations, setSelectedLocation: handleSetLocation, isLoading }}>
            {children}
        </LocationContext.Provider>
    )
}

export function useLocation() {
    const context = useContext(LocationContext)
    if (context === undefined) {
        throw new Error("useLocation must be used within a LocationProvider")
    }
    return context
}
