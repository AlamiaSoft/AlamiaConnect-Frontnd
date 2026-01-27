"use client"

import { Suspense } from 'react';
import DashboardLayout from '@/components/dashboard-layout';
import { QuotesTable } from '@/components/quotes/quotes-table';
import { Breadcrumbs } from '@/components/ui/breadcrumbs';

import { PermissionGuard } from "@/components/auth/permission-guard"

export default function QuotesPage() {
    return (
        <DashboardLayout>
            <PermissionGuard permission="quotes" showError={true}>
                <div className="space-y-6">
                    <Breadcrumbs items={[
                        { label: "Dashboard", href: "/" },
                        { label: "Quotes" }
                    ]} />
                    <Suspense fallback={<div className="p-6">Loading quotes...</div>}>
                        <QuotesTable />
                    </Suspense>
                </div>
            </PermissionGuard>
        </DashboardLayout>
    );
}
