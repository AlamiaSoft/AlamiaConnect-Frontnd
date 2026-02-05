"use client"

import { usePersona, Persona } from "@/contexts/persona-context"
import {
    Briefcase,
    Coins,
    HeadphonesIcon,
    GraduationCap,
    ChevronDown
} from "lucide-react"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const personas = [
    { id: "sales", label: "Sales Mode", icon: Briefcase, color: "text-blue-500" },
    { id: "finance", label: "Finance Mode", icon: Coins, color: "text-green-500" },
    { id: "cs", label: "CS Mode", icon: HeadphonesIcon, color: "text-purple-500" },
    { id: "trainer", label: "Trainer Mode", icon: GraduationCap, color: "text-orange-500" },
]

export function PersonaSwitcher({ collapsed }: { collapsed?: boolean }) {
    const { currentPersona, setPersona } = usePersona()

    const active = personas.find(p => p.id === currentPersona) || personas[0]

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="ghost"
                    className={cn(
                        "w-full justify-start gap-2 px-2 hover:bg-sidebar-accent",
                        collapsed ? "px-0 justify-center" : ""
                    )}
                >
                    <active.icon className={cn("h-5 w-5", active.color)} />
                    {!collapsed && (
                        <>
                            <span className="flex-1 text-left font-medium">{active.label}</span>
                            <ChevronDown className="h-4 w-4 opacity-50" />
                        </>
                    )}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56">
                {personas.map((p) => (
                    <DropdownMenuItem
                        key={p.id}
                        onClick={() => setPersona(p.id as Persona)}
                        className="gap-2 cursor-pointer"
                    >
                        <p.icon className={cn("h-4 w-4", p.color)} />
                        <span>{p.label}</span>
                        {currentPersona === p.id && (
                            <div className="ml-auto h-2 w-2 rounded-full bg-primary" />
                        )}
                    </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
