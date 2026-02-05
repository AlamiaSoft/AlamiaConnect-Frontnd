"use client"

import React, { createContext, useContext, useState, useEffect } from "react"

export type Persona = "sales" | "finance" | "cs" | "trainer"

interface PersonaContextType {
    currentPersona: Persona
    setPersona: (persona: Persona) => void
}

const PersonaContext = createContext<PersonaContextType | undefined>(undefined)

export function PersonaProvider({ children }: { children: React.ReactNode }) {
    const [currentPersona, setCurrentPersona] = useState<Persona>("sales")

    // Load from local storage on mount
    useEffect(() => {
        const saved = localStorage.getItem("alamia_persona") as Persona
        if (saved && ["sales", "finance", "cs", "trainer"].includes(saved)) {
            setCurrentPersona(saved)
        }
    }, [])

    const setPersona = (persona: Persona) => {
        setCurrentPersona(persona)
        localStorage.setItem("alamia_persona", persona)
    }

    return (
        <PersonaContext.Provider value={{ currentPersona, setPersona }}>
            {children}
        </PersonaContext.Provider>
    )
}

export function usePersona() {
    const context = useContext(PersonaContext)
    if (context === undefined) {
        throw new Error("usePersona must be used within a PersonaProvider")
    }
    return context
}
