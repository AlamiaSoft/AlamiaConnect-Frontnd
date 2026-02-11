'use client';

import React from 'react';
import { useAuth } from '@/contexts/auth-context';
import { AlertCircle, ExternalLink, ShieldAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function BillingBanner() {
    const { user } = useAuth();

    if (!user || !user.billing) return null;

    const { subscription_status, portal_url, portal_label } = user.billing;
    const actionLabel = portal_label || 'View Invoice';

    if (subscription_status === 'overdue') {
        return (
            <div className="bg-destructive/15 text-destructive px-4 py-2 border-b border-destructive/30 flex items-center justify-between text-sm animate-in fade-in slide-in-from-top duration-500">
                <div className="flex items-center gap-2">
                    <AlertCircle className="h-4 w-4" />
                    <span><strong>Attention:</strong> Your monthly invoice is overdue. Please {actionLabel.toLowerCase()} to avoid service interruption.</span>
                </div>
                {portal_url && (
                    <Button variant="link" size="sm" className="h-auto p-0 text-destructive font-bold h-4 gap-1 hover:no-underline" asChild>
                        <a href={portal_url} target="_blank" rel="noopener noreferrer">
                            {actionLabel} <ExternalLink className="h-3 w-3" />
                        </a>
                    </Button>
                )}
            </div>
        );
    }

    if (subscription_status === 'suspended') {
        return (
            <div className="fixed inset-0 z-[1000] bg-destructive text-destructive-foreground flex flex-col items-center justify-center p-6 text-center overflow-hidden">
                <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent pointer-events-none" />

                <ShieldAlert className="h-24 w-24 mb-6 animate-pulse" />

                <h1 className="text-4xl md:text-6xl font-black mb-4 tracking-tighter">SUBSCRIPTION SUSPENDED</h1>

                <p className="text-xl md:text-2xl mb-8 max-w-2xl opacity-90 font-medium">
                    Your access to AlamiaConnect has been suspended due to an unpaid monthly invoice.
                    Please settle your dues to restore full access.
                </p>

                {portal_url ? (
                    <Button size="lg" variant="secondary" className="text-destructive font-bold text-xl px-12 py-8 rounded-xl shadow-2xl hover:scale-105 transition-all duration-300 active:scale-95" asChild>
                        <a href={portal_url} target="_blank" rel="noopener noreferrer">
                            {actionLabel.toUpperCase()}
                        </a>
                    </Button>
                ) : (
                    <div className="bg-white/10 backdrop-blur-md p-6 rounded-2xl border border-white/20">
                        <p className="text-xl font-bold italic">Please contact AlamiaSoft administration to resolve this issue.</p>
                    </div>
                )}

                <div className="mt-12 text-sm opacity-50">
                    AlamiaConnect Operations Manager
                </div>
            </div>
        );
    }

    return null;
}
