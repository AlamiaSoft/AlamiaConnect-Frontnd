'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';

interface ProtectedRouteProps {
    children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
    const { isAuthenticated, loading } = useAuth();
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        // If auth check is done and user is not authenticated, redirect to login
        // but avoid redirect loops if already on login page
        if (!loading && !isAuthenticated && pathname !== '/login') {
            router.push('/login');
        }
    }, [isAuthenticated, loading, router, pathname]);

    // Show loading state while checking auth
    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center bg-background">
                <div className="flex flex-col items-center gap-4">
                    <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent shadow-lg"></div>
                    <p className="text-sm font-medium text-muted-foreground animate-pulse">
                        Authenticating...
                    </p>
                </div>
            </div>
        );
    }

    // If not authenticated, don't render children while redirecting
    if (!isAuthenticated && pathname !== '/login') {
        return null;
    }

    return <>{children}</>;
}
