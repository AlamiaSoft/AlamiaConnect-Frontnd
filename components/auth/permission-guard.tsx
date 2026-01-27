"use client";

import { useAuth } from "@/hooks/use-auth";
import { Lock } from "lucide-react";

interface PermissionGuardProps {
    permission: string;
    children: React.ReactNode;
    fallback?: React.ReactNode;
    showError?: boolean;
}

export function PermissionGuard({
    permission,
    children,
    fallback,
    showError = false
}: PermissionGuardProps) {
    const { user, loading } = useAuth();

    // While loading, we might want to render nothing or a skeleton
    if (loading) return null;

    if (!user || !user.role) {
        // If logged in but no role, assume no access
        return renderFallback();
    }

    // Admin override
    if (user.role.name === 'Super Admin' || user.role.permission_type === 'all') {
        return <>{children}</>;
    }

    const hasPermission = user.role.permissions?.includes(permission);

    if (!hasPermission) {
        return renderFallback();
    }

    return <>{children}</>;

    function renderFallback() {
        if (fallback) return <>{fallback}</>;

        if (showError) {
            return (
                <div className="flex h-[50vh] flex-col items-center justify-center gap-4 text-center">
                    <div className="rounded-full bg-muted p-4">
                        <Lock className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <div className="space-y-2">
                        <h3 className="text-xl font-semibold">Access Denied</h3>
                        <p className="text-muted-foreground max-w-sm">
                            You don't have permission to access the <strong>{permission}</strong> module.
                            Please contact your administrator.
                        </p>
                    </div>
                </div>
            );
        }

        return null;
    }
}
