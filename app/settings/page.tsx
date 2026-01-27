"use client"

"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
    Users,
    ShieldCheck,
    GitBranch,
    Zap,
    Hash,
    Mail,
    Webhook,
    FileJson,
    UserPlus,
    Database
} from "lucide-react"
import Link from "next/link"
import { DashboardLayout } from "@/components/dashboard-layout"

const settingGroups = [
    {
        title: "Leads",
        description: "Configure lead management pipelines and categories.",
        items: [
            { title: "Pipelines & Stages", icon: GitBranch, href: "/settings/leads/pipelines" },
            { title: "Sources", icon: Zap, href: "/settings/leads/sources" },
            { title: "Types", icon: Hash, href: "/settings/leads/types" },
        ]
    },
    {
        title: "User Management",
        description: "Manage users, roles and access permissions.",
        items: [
            { title: "Users", icon: Users, href: "/settings/users" },
            { title: "Roles & Permissions", icon: ShieldCheck, href: "/settings/roles" },
            { title: "Groups", icon: UserPlus, href: "/settings/groups" },
        ]
    },
    {
        title: "Customization",
        description: "Tailor the system with custom fields and rules.",
        items: [
            { title: "Attributes", icon: FileJson, href: "/settings/attributes" },
            { title: "Workflows", icon: Zap, href: "/settings/workflows" },
            { title: "Email Templates", icon: Mail, href: "/settings/email-templates" },
        ]
    },
    {
        title: "Integration & Data",
        description: "Automate and manage external data flows.",
        items: [
            { title: "Webhooks", icon: Webhook, href: "/settings/webhooks" },
            { title: "Imports", icon: Database, href: "/settings/imports" },
        ]
    }
]

import { PermissionGuard } from "@/components/auth/permission-guard"

export default function SettingsPage() {
    return (
        <DashboardLayout>
            <PermissionGuard permission="settings" showError={true}>
                <div className="space-y-6">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">System Settings</h1>
                        <p className="text-muted-foreground mt-1">Manage your CRM configuration and administrative settings.</p>
                    </div>

                    <div className="grid gap-6 md:grid-cols-2">
                        {settingGroups.map((group) => (
                            <Card key={group.title} className="hover:border-primary/50 transition-colors">
                                <CardHeader>
                                    <CardTitle>{group.title}</CardTitle>
                                    <CardDescription>{group.description}</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        {group.items.map((item) => (
                                            <Link key={item.title} href={item.href}>
                                                <div className="flex items-center gap-3 p-3 rounded-lg border bg-card hover:bg-accent transition-colors">
                                                    <item.icon className="h-5 w-5 text-primary" />
                                                    <span className="font-sm">{item.title}</span>
                                                </div>
                                            </Link>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            </PermissionGuard>
        </DashboardLayout>
    )
}
