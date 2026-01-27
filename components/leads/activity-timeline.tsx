"use client"

import { useEffect, useState } from "react"
import { LeadsService } from "@/services/leads-service"
import {
    Phone,
    Mail,
    Calendar,
    Clock,
    MessageSquare,
    FileText,
    CheckCircle2
} from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"

interface ActivityTimelineProps {
    leadId: string | number
}

interface Activity {
    id: string
    type: string
    title: string
    comment?: string
    created_at: string
    user?: {
        name: string
    }
    is_done?: boolean
}

export function ActivityTimeline({ leadId }: ActivityTimelineProps) {
    const [activities, setActivities] = useState<Activity[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchActivities = async () => {
            if (!leadId) return
            try {
                const response = await LeadsService.getActivities(leadId)
                setActivities(response.data as unknown as Activity[])
            } catch (error) {
                console.error("Failed to fetch activities", error)
            } finally {
                setLoading(false)
            }
        }
        fetchActivities()
    }, [leadId])

    if (loading) {
        return <div className="text-center py-8 text-muted-foreground">Loading timeline...</div>
    }

    if (activities.length === 0) {
        return (
            <div className="text-center py-8 text-muted-foreground border-2 border-dashed rounded-lg">
                No recent activities or interaction history found.
            </div>
        )
    }

    const getActivityIcon = (type: string) => {
        switch (type.toLowerCase()) {
            case 'call': return <Phone className="h-4 w-4" />
            case 'email': return <Mail className="h-4 w-4" />
            case 'meeting': return <Calendar className="h-4 w-4" />
            case 'note': return <FileText className="h-4 w-4" />
            case 'system': return <CheckCircle2 className="h-4 w-4" />
            default: return <MessageSquare className="h-4 w-4" />
        }
    }

    const getActivityColor = (type: string) => {
        switch (type.toLowerCase()) {
            case 'call': return "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800"
            case 'email': return "bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-800"
            case 'meeting': return "bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-900/30 dark:text-orange-300 dark:border-orange-800"
            case 'note': return "bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700"
            default: return "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700"
        }
    }

    return (
        <div className="relative space-y-8 pl-4 before:absolute before:inset-0 before:ml-4 before:-translate-x-px before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-200 before:to-transparent dark:before:via-slate-700">
            {activities.map((activity) => (
                <div key={activity.id} className="relative flex items-start gap-4 group">
                    <div className={cn(
                        "absolute -left-4 mt-1 flex h-8 w-8 items-center justify-center rounded-full border shadow-sm z-10",
                        getActivityColor(activity.type)
                    )}>
                        {getActivityIcon(activity.type)}
                    </div>

                    <div className="flex-1 rounded-lg border bg-card p-4 shadow-sm transition-shadow hover:shadow-md ml-6">
                        <div className="flex items-center justify-between gap-4">
                            <h4 className="font-semibold text-sm">{activity.title}</h4>
                            <time className="text-xs text-muted-foreground whitespace-nowrap flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {format(new Date(activity.created_at), "MMM d, yyyy h:mm a")}
                            </time>
                        </div>

                        {activity.comment && (
                            <div className="mt-2 text-sm text-foreground/80 bg-muted/50 p-2 rounded-md border border-transparent group-hover:border-border">
                                {activity.comment}
                            </div>
                        )}

                        <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
                            <span className="font-medium text-foreground">{activity.user?.name || "System"}</span>
                            <span>•</span>
                            <span className="capitalize">{activity.type}</span>
                            {activity.is_done && (
                                <>
                                    <span>•</span>
                                    <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-0.5">
                                        <CheckCircle2 className="h-3 w-3" /> Completed
                                    </span>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            ))}
        </div>
    )
}
