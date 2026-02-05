"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
    Phone,
    Mail,
    Calendar,
    FileText,
    Users,
    DollarSign,
    ChevronDown,
    ChevronUp,
    Edit,
    MoreVertical,
    MessageSquare,
    Share2,
    Star,
    Clock,
    Briefcase,
    User,
    Tag,
    X,
    FileSpreadsheet,
    Activity,
    StickyNote
} from "lucide-react"
import { cn } from "@/lib/utils"

interface ActivityItem {
    id: string
    type: "call" | "update" | "meeting" | "email" | "note"
    title: string
    timestamp: string
    user: string
    details?: string
    color: string
}

interface LeadDetailProps {
    leadId?: string
    initialData?: any
}

export function LeadDetail({ leadId, initialData }: LeadDetailProps) {
    const [aboutExpanded, setAboutExpanded] = useState(true)
    const [personaExpanded, setPersonaExpanded] = useState(true)
    const [activeTab, setActiveTab] = useState("all")
    const [activeStage, setActiveStage] = useState("new")

    const leadData = initialData || {
        id: leadId || "1",
        title: "Query for Fiber CNC",
        lead_value: 20000000.0,
        source: "Web",
        type: "New Business",
        sales_owner: "Amir Shah",
        expected_close_date: "2026-02-10",
        region: null,
        stage: "New",
        person: {
            name: "Ahmed Nawaz",
            email: "nawaz@email.com",
            phone: "+92 300 1234567",
            organization: {
                name: "Tech Industries Ltd.",
            },
        },
    }

    const activities: ActivityItem[] = [
        {
            id: "1",
            type: "call",
            title: "Call to Ahmed Nawaz",
            timestamp: "31 Jan 2026, 1:05 PM",
            user: "Admin",
            details:
                "Scheduled on: 2 Feb 2026, 2:00 PM - 2 Feb 2026, 2:00 PM\nParticipants: Amir Shah\nLocation: Karachi HeadOffice\nAmir will call Ahmed Nawaz",
            color: "bg-blue-500",
        },
        {
            id: "2",
            type: "update",
            title: "Updated Stage : Empty",
            timestamp: "31 Jan 2026, 12:59 PM",
            user: "Admin",
            color: "bg-yellow-500",
        },
        {
            id: "3",
            type: "update",
            title: "Updated Pipeline : Empty → Default Pipeline",
            timestamp: "31 Jan 2026, 12:59 PM",
            user: "Admin",
            color: "bg-yellow-500",
        },
        {
            id: "4",
            type: "update",
            title: "Updated Expected Close Date : Empty → Tue Feb 10, 2026",
            timestamp: "31 Jan 2026, 12:59 PM",
            user: "Admin",
            color: "bg-yellow-500",
        },
    ]

    const stages = [
        { value: "new", label: "New" },
        { value: "follow-up", label: "Follow Up" },
        { value: "prospect", label: "Prospect" },
        { value: "negotiation", label: "Negotiation" },
        { value: "won-lost", label: "Won/Lost" },
    ]

    const activityTabs = [
        { value: "all", label: "All" },
        { value: "planned", label: "Planned" },
        { value: "notes", label: "Notes" },
        { value: "calls", label: "Calls" },
        { value: "meetings", label: "Meetings" },
        { value: "lunches", label: "Lunches" },
        { value: "files", label: "Files" },
        { value: "emails", label: "Emails" },
        { value: "changelogs", label: "Changelogs" },
        { value: "description", label: "Description" },
        { value: "products", label: "Products" },
        { value: "quotes", label: "Quotes" },
    ]

    return (
        <div className="flex flex-col h-full bg-background text-foreground">
            {/* Header Area */}
            <div className="border-b border-border bg-card">
                <div className="px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center space-x-4">
                        <div className="text-[11px] font-medium tracking-wide">
                            <span className="text-muted-foreground">Dashboard</span>
                            <span className="mx-2 text-muted-foreground">/</span>
                            <span className="text-muted-foreground">Leads</span>
                            <span className="mx-2 text-muted-foreground">/</span>
                            <span className="text-foreground font-semibold">#{leadData.id}</span>
                        </div>
                    </div>

                    {/* Status Progress bar */}
                    <div className="flex items-center h-8 bg-muted rounded-md p-1 border border-border">
                        {stages.map((stage) => {
                            const isActive = activeStage === stage.value;
                            return (
                                <button
                                    key={stage.value}
                                    onClick={() => setActiveStage(stage.value)}
                                    className={cn(
                                        "px-4 h-full text-[10px] font-bold tracking-wider uppercase transition-all rounded-[4px]",
                                        isActive ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground hover:bg-background"
                                    )}
                                >
                                    {stage.label}
                                </button>
                            );
                        })}
                    </div>
                </div>

                <div className="px-6 overflow-x-auto scrollbar-hide border-t border-border/50">
                    <Tabs value={activeTab} onValueChange={setActiveTab}>
                        <TabsList className="bg-transparent h-12 p-0 gap-6">
                            {activityTabs.map((tab) => (
                                <TabsTrigger
                                    key={tab.value}
                                    value={tab.value}
                                    className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent text-[11px] font-bold uppercase tracking-widest text-muted-foreground data-[state=active]:text-foreground px-0 h-full"
                                >
                                    {tab.label}
                                </TabsTrigger>
                            ))}
                        </TabsList>
                    </Tabs>
                </div>
            </div>

            <div className="flex flex-1 overflow-hidden">
                {/* Left Sidebar */}
                <div className="w-[320px] border-r border-border bg-card overflow-y-auto pr-1">
                    <div className="p-6 space-y-8">
                        <div>
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-2 bg-primary/10 rounded-lg text-primary">
                                    <Tag className="h-5 w-5" />
                                </div>
                                <h2 className="text-lg font-bold text-foreground tracking-tight">{leadData.title}</h2>
                            </div>

                            <div className="grid grid-cols-2 gap-2">
                                <Button variant="outline" className="h-16 flex flex-col items-center justify-center bg-muted/50 hover:bg-muted border-border text-foreground transition-all">
                                    <Mail className="h-4 w-4 mb-1 text-muted-foreground" />
                                    <span className="text-[10px] font-bold uppercase tracking-tighter">Mail</span>
                                </Button>
                                <Button variant="outline" className="h-16 flex flex-col items-center justify-center bg-muted/50 hover:bg-muted border-border text-foreground transition-all">
                                    <FileText className="h-4 w-4 mb-1 text-muted-foreground" />
                                    <span className="text-[10px] font-bold uppercase tracking-tighter">File</span>
                                </Button>
                                <Button variant="outline" className="h-16 flex flex-col items-center justify-center bg-muted/50 hover:bg-muted border-border text-foreground transition-all">
                                    <StickyNote className="h-4 w-4 mb-1 text-muted-foreground" />
                                    <span className="text-[10px] font-bold uppercase tracking-tighter">Note</span>
                                </Button>
                                <Button variant="outline" className="h-16 flex flex-col items-center justify-center bg-muted/50 hover:bg-muted border-border text-foreground transition-all">
                                    <Activity className="h-4 w-4 mb-1 text-muted-foreground" />
                                    <span className="text-[10px] font-bold uppercase tracking-tighter">Activity</span>
                                </Button>
                            </div>
                        </div>

                        <Collapsible open={aboutExpanded} onOpenChange={setAboutExpanded}>
                            <CollapsibleTrigger asChild>
                                <Button variant="ghost" className="w-full justify-between p-0 h-auto hover:bg-transparent group">
                                    <span className="text-[11px] font-bold uppercase tracking-[2px] text-muted-foreground">
                                        About Lead
                                    </span>
                                    <div className="flex items-center space-x-2 text-muted-foreground">
                                        <Edit className="h-3.5 w-3.5" />
                                        {aboutExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                                    </div>
                                </Button>
                            </CollapsibleTrigger>
                            <CollapsibleContent className="pt-4 space-y-4">
                                <div className="flex justify-between items-center">
                                    <label className="text-[11px] text-muted-foreground font-medium">Lead Value</label>
                                    <div className="text-xs font-bold text-foreground">
                                        PKR {Number(leadData.lead_value).toLocaleString()}
                                    </div>
                                </div>
                                <div className="flex justify-between items-center">
                                    <label className="text-[11px] text-muted-foreground font-medium">Source</label>
                                    <span className="text-xs">{leadData.source}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <label className="text-[11px] text-muted-foreground font-medium">Type</label>
                                    <span className="text-xs">{leadData.type}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <label className="text-[11px] text-muted-foreground font-medium">Sales Owner</label>
                                    <div className="flex items-center gap-1.5 text-xs font-semibold text-primary">
                                        <User className="h-3 w-3" />
                                        <span>{leadData.sales_owner}</span>
                                    </div>
                                </div>
                                <div className="flex justify-between items-center">
                                    <label className="text-[11px] text-muted-foreground font-medium">Close Date</label>
                                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                        <Calendar className="h-3 w-3" />
                                        <span>{new Date(leadData.expected_close_date).toLocaleDateString()}</span>
                                    </div>
                                </div>
                            </CollapsibleContent>
                        </Collapsible>

                        <Collapsible open={personaExpanded} onOpenChange={setPersonaExpanded}>
                            <CollapsibleTrigger asChild>
                                <Button variant="ghost" className="w-full justify-between p-0 h-auto hover:bg-transparent group">
                                    <span className="text-[11px] font-bold uppercase tracking-[2px] text-muted-foreground">
                                        About Persona
                                    </span>
                                    <div className="flex items-center space-x-2 text-muted-foreground">
                                        <Edit className="h-3.5 w-3.5" />
                                        {personaExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                                    </div>
                                </Button>
                            </CollapsibleTrigger>
                            <CollapsibleContent className="pt-6 space-y-4">
                                <div className="flex items-center space-x-3 bg-muted/30 p-3 rounded-xl border border-border">
                                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
                                        {leadData.person.name.split(" ").map((n: string) => n[0]).join("")}
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-sm font-bold text-foreground truncate">{leadData.person.name}</p>
                                        <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground font-medium mt-0.5">
                                            <Briefcase className="h-3 w-3" />
                                            <span className="truncate">{leadData.person.organization?.name || "N/A"}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-3 px-1">
                                    <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                                        <div className="flex items-center gap-2">
                                            <Mail className="h-3.5 w-3.5" />
                                            <span>Email</span>
                                        </div>
                                        <span className="text-foreground">{leadData.person.email}</span>
                                    </div>
                                    <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                                        <div className="flex items-center gap-2">
                                            <Phone className="h-3.5 w-3.5" />
                                            <span>Phone</span>
                                        </div>
                                        <span className="text-foreground font-medium">{leadData.person.phone}</span>
                                    </div>
                                </div>
                            </CollapsibleContent>
                        </Collapsible>
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="flex-1 bg-background/50 overflow-y-auto pb-20">
                    <div className="p-8 max-w-4xl mx-auto">
                        <div className="relative space-y-10">
                            {/* Vertical Line */}
                            <div className="absolute left-6 top-2 bottom-2 w-px bg-border" />

                            {activities.map((activity) => (
                                <div key={activity.id} className="relative flex gap-8 group">
                                    <div className="sticky top-0 z-10">
                                        <div className={cn(
                                            "h-12 w-12 rounded-full flex items-center justify-center border-4 border-background bg-card shadow-sm transition-all group-hover:scale-105",
                                            "text-muted-foreground"
                                        )}>
                                            {activity.type === 'call' ? <Phone className="h-4 w-4" /> : <Activity className="h-4 w-4" />}
                                        </div>
                                    </div>
                                    <div className="flex-1">
                                        <Card className="bg-card border-border shadow-sm hover:border-primary/30 transition-all duration-300">
                                            <CardContent className="p-6">
                                                <div className="flex items-start justify-between mb-3">
                                                    <h3 className="text-sm font-bold text-foreground tracking-tight">{activity.title}</h3>
                                                    <div className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">{activity.timestamp}</div>
                                                </div>
                                                {activity.details && (
                                                    <div className="p-3 bg-muted/40 rounded-lg border border-border/50 text-xs text-muted-foreground leading-relaxed whitespace-pre-line mb-3">
                                                        {activity.details}
                                                    </div>
                                                )}
                                                <div className="flex items-center gap-2">
                                                    <div className="h-5 w-5 rounded-full bg-primary/20 flex items-center justify-center text-[8px] font-bold text-primary uppercase">A</div>
                                                    <p className="text-[10px] text-muted-foreground font-bold tracking-wide uppercase">
                                                        By <span className="text-primary">{activity.user}</span>
                                                    </p>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}