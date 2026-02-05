"use client"

import { useState, useMemo, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Input } from "@/components/ui/input"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Search, Plus, Grid3x3, List, Filter, User, DollarSign, Loader2, AlertCircle } from "lucide-react"
import { LeadsTable } from "./leads-table"
import { cn } from "@/lib/utils"
import useSWR from "swr"
import { SettingsService } from "@/services/settings-service"
import { LeadsService } from "@/services/leads-service"

interface Lead {
    id: string
    person: {
        name: string
        email?: string
    }
    title: string
    lead_value: number
    user?: {
        name: string
    }
    source?: {
        name: string
    }
    type?: string
    lead_pipeline_stage_id: string | number
}

interface Stage {
    id: string | number
    name: string
    leads: Lead[]
    color: string
    value: number
    count: number
}

export function LeadsPipeline() {
    const [searchQuery, setSearchQuery] = useState("")
    const [selectedPipelineId, setSelectedPipelineId] = useState<string | null>(null)
    const [viewMode, setViewMode] = useState<"board" | "list">("board")

    // 1. Fetch Pipelines
    const {
        data: pipelinesResponse,
        error: pipelinesError,
        isLoading: pipelinesLoading
    } = useSWR(
        "/settings/pipelines",
        () => SettingsService.getPipelines(),
        {
            revalidateOnFocus: false,
            shouldRetryOnError: false
        }
    )

    // Safely extract pipelines
    const pipelines = useMemo(() => {
        if (!pipelinesResponse) return []
        // getCollection returns { data, meta, links }
        return Array.isArray(pipelinesResponse.data) ? pipelinesResponse.data : []
    }, [pipelinesResponse])

    // Map default pipeline on initial load
    useEffect(() => {
        if (!selectedPipelineId && pipelines.length > 0) {
            const defaultPipeline = pipelines.find((p: any) => p.is_default) || pipelines[0]
            if (defaultPipeline) {
                console.log('Setting default pipeline:', defaultPipeline.id)
                setSelectedPipelineId(defaultPipeline.id.toString())
            }
        }
    }, [pipelines, selectedPipelineId])

    // 2. Fetch Board Data (Stages + Leads) using the specialized backend endpoint
    const {
        data: boardData,
        error: boardError,
        isLoading: boardLoading
    } = useSWR(
        selectedPipelineId ? [`/leads/get`, selectedPipelineId] : null,
        () => LeadsService.getLeadsGroups(selectedPipelineId!),
        {
            revalidateOnFocus: false
        }
    )

    // 3. Transform data for Board View
    const stages: Stage[] = useMemo(() => {
        if (!boardData || typeof boardData !== 'object') return []

        const stageColors = [
            "bg-primary",
            "bg-indigo-500",
            "bg-blue-500",
            "bg-orange-500",
            "bg-emerald-600",
            "bg-destructive"
        ]

        // boardData is an object where keys are stage IDs
        return Object.values(boardData).map((stage: any, idx: number) => {
            const leadsList = stage.leads?.data || []

            return {
                id: stage.id.toString(),
                name: stage.name,
                leads: leadsList,
                value: Number(stage.lead_value) || 0,
                count: stage.leads?.meta?.total || leadsList.length,
                color: stageColors[idx % stageColors.length]
            }
        })
    }, [boardData])

    const isLoading = pipelinesLoading || boardLoading
    const error = pipelinesError || boardError

    return (
        <div className="flex flex-col h-full bg-background font-sans">
            {/* Header */}
            <div className="bg-card border-b border-border p-6">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <div className="text-xs text-muted-foreground font-medium mb-1">Dashboard / Leads</div>
                        <h1 className="text-2xl font-bold text-foreground tracking-tight">Leads</h1>
                    </div>
                    <Button className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-md px-6 shadow-sm">
                        Create Lead
                    </Button>
                </div>

                <div className="flex items-center gap-3">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search by Title"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-9 bg-background border-input text-foreground h-10 ring-offset-background"
                        />
                    </div>
                    <Button variant="outline" className="h-10 px-4 border-dashed">
                        <Filter className="h-4 w-4 mr-2 text-primary" />
                        Filter
                    </Button>
                    <div className="flex-1" />

                    <div className="flex items-center gap-3">
                        <Select
                            value={selectedPipelineId || ""}
                            onValueChange={(val) => {
                                console.log('Pipeline changed to:', val)
                                setSelectedPipelineId(val)
                            }}
                            disabled={pipelinesLoading}
                        >
                            <SelectTrigger className="w-[200px] h-10 bg-background">
                                <SelectValue placeholder={pipelinesLoading ? "Loading..." : "Select Pipeline"} />
                            </SelectTrigger>
                            <SelectContent className="max-h-[300px]">
                                {pipelines.length === 0 && !pipelinesLoading && (
                                    <div className="p-2 text-xs text-center text-muted-foreground">No pipelines found</div>
                                )}
                                {pipelines.map((p: any) => (
                                    <SelectItem key={p.id} value={p.id.toString()}>
                                        {p.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        <div className="flex items-center gap-px bg-muted p-1 rounded-lg border border-border">
                            <Button
                                variant="ghost"
                                size="sm"
                                className={cn(
                                    "h-8 px-3 rounded-md transition-all",
                                    viewMode === "board" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                                )}
                                onClick={() => setViewMode("board")}
                            >
                                <Grid3x3 className="h-4 w-4" />
                            </Button>
                            <Button
                                variant="ghost"
                                size="sm"
                                className={cn(
                                    "h-8 px-3 rounded-md transition-all",
                                    viewMode === "list" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                                )}
                                onClick={() => setViewMode("list")}
                            >
                                <List className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            {viewMode === "board" ? (
                <div className="flex-1 overflow-x-auto p-6 scrollbar-thin scrollbar-thumb-muted">
                    {isLoading ? (
                        <div className="flex items-center justify-center h-full">
                            <div className="flex flex-col items-center gap-3">
                                <Loader2 className="h-10 w-10 animate-spin text-primary opacity-50" />
                                <span className="text-sm font-medium text-muted-foreground">Syncing pipeline data...</span>
                            </div>
                        </div>
                    ) : error ? (
                        <div className="flex items-center justify-center h-full">
                            <Card className="max-w-md border-destructive/20 bg-destructive/5">
                                <CardContent className="p-6 flex flex-col items-center text-center gap-4">
                                    <AlertCircle className="h-12 w-12 text-destructive opacity-50" />
                                    <div>
                                        <h3 className="font-bold text-foreground">Connection Error</h3>
                                        <p className="text-sm text-muted-foreground mt-1">Failed to fetch pipeline data from the server. Please try again or check your connection.</p>
                                    </div>
                                    <Button onClick={() => window.location.reload()} variant="outline" size="sm">
                                        Retry Connection
                                    </Button>
                                </CardContent>
                            </Card>
                        </div>
                    ) : (
                        <div className="flex gap-6 min-w-max h-full">
                            {stages.length === 0 && (
                                <div className="w-full flex flex-col items-center justify-center opacity-40">
                                    <h3 className="text-xl font-bold">No Stages Configured</h3>
                                    <p className="text-sm">Please check the pipeline settings in administrative panel.</p>
                                </div>
                            )}
                            {stages.map((stage) => (
                                <div key={stage.id} className="flex-shrink-0 w-[320px] flex flex-col h-full bg-muted/20 rounded-xl border border-border/50 p-4">
                                    <div className="mb-6">
                                        <div className="flex items-center justify-between mb-3">
                                            <div className="flex items-center gap-2">
                                                <div className={cn("h-2.5 w-2.5 rounded-full shadow-[0_0_8px_rgba(var(--primary),0.5)]", stage.color)} />
                                                <h3 className="font-bold text-foreground text-sm tracking-tight">
                                                    {stage.name}
                                                </h3>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="text-[10px] font-bold px-1.5 py-0.5 bg-muted rounded-md text-muted-foreground">
                                                    {stage.count}
                                                </span>
                                                <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-foreground hover:bg-background rounded-md">
                                                    <Plus className="h-3.5 w-3.5" />
                                                </Button>
                                            </div>
                                        </div>
                                        <div className="flex items-baseline gap-1.5 border-t border-border/50 pt-3">
                                            <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">Pipeline Value</span>
                                            <span className="text-sm font-black text-foreground antialiased">PKR {stage.value.toLocaleString()}</span>
                                        </div>
                                    </div>

                                    <div className="space-y-4 flex-1 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-muted">
                                        {stage.leads.length === 0 ? (
                                            <div className="flex flex-col items-center justify-center py-16 text-center border-2 border-dashed border-border/60 rounded-2xl opacity-40 bg-background/50">
                                                <div className="w-12 h-12 mb-3 text-muted-foreground">
                                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                                        <path d="M21 12c0 1.657-3.134 3-7 3s-7-1.343-7-3 3.134-3 7-3 7 1.343 7 3z" />
                                                        <path d="M7 12v6c0 1.657 3.134 3 7 3s7-1.343 7-3v-6" />
                                                        <path d="M7 6v6" />
                                                    </svg>
                                                </div>
                                                <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Empty Stage</p>
                                            </div>
                                        ) : (
                                            stage.leads.map((lead: any) => (
                                                <Link key={lead.id} href={`/leads/${lead.id}`} className="block">
                                                    <Card className="bg-card border-border hover:border-primary/50 transition-all hover:shadow-md active:scale-[0.98] group cursor-pointer overflow-hidden rounded-xl border-[1.5px]">
                                                        <CardContent className="p-4">
                                                            <div className="flex items-start gap-4 mb-4">
                                                                <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-black text-xs group-hover:bg-primary group-hover:text-primary-foreground transition-colors shadow-inner">
                                                                    {(lead.person?.name || lead.title || "L")
                                                                        .split(" ")
                                                                        .map((n: string) => n[0])
                                                                        .slice(0, 2)
                                                                        .join("")}
                                                                </div>
                                                                <div className="flex-1 min-w-0">
                                                                    <h4 className="font-bold text-foreground text-[13px] leading-tight truncate group-hover:text-primary transition-colors">
                                                                        {lead.person?.name || "Untitled Lead"}
                                                                    </h4>
                                                                    <p className="text-[11px] text-muted-foreground mt-1 font-medium truncate opacity-80">{lead.title}</p>
                                                                </div>
                                                            </div>

                                                            <div className="flex items-center justify-between mb-4 bg-muted/40 p-2.5 rounded-lg border border-border/50">
                                                                <div className="flex flex-col">
                                                                    <span className="text-[8px] uppercase font-black text-muted-foreground tracking-tighter">Value</span>
                                                                    <div className="flex items-center gap-1.5 text-[11px] font-black text-foreground">
                                                                        <span>PKR {(Number(lead.lead_value) || 0).toLocaleString()}</span>
                                                                    </div>
                                                                </div>
                                                                <div className="flex flex-col items-end">
                                                                    <span className="text-[8px] uppercase font-black text-muted-foreground tracking-tighter">Owner</span>
                                                                    <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground font-bold">
                                                                        <span className="truncate max-w-[80px]">{lead.user?.name || "Unassigned"}</span>
                                                                    </div>
                                                                </div>
                                                            </div>

                                                            <div className="flex items-center gap-2">
                                                                {lead.source?.name && (
                                                                    <div className="flex items-center gap-1 px-2 py-0.5 bg-muted rounded-md text-[9px] font-black uppercase text-muted-foreground tracking-widest border border-border">
                                                                        <div className="w-1 h-1 rounded-full bg-blue-500" />
                                                                        {lead.source.name}
                                                                    </div>
                                                                )}
                                                                {lead.type && (
                                                                    <div className="px-2 py-0.5 bg-muted rounded-md text-[9px] font-black uppercase text-muted-foreground tracking-widest border border-border">
                                                                        {lead.type}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </CardContent>
                                                    </Card>
                                                </Link>
                                            ))
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            ) : (
                <div className="p-6 overflow-hidden flex-1">
                    <div className="bg-card rounded-xl border border-border overflow-hidden shadow-sm h-full">
                        <LeadsTable />
                    </div>
                </div>
            )}
        </div>
    )
}