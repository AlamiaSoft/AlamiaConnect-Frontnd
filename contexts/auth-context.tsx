'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { AuthService, User, LoginCredentials } from '@/services/auth-service';
import { toast } from 'sonner';

interface AuthContextType {
    user: User | null;
    loading: boolean;
    login: (credentials: LoginCredentials) => Promise<void>;
    logout: () => Promise<void>;
    isAuthenticated: boolean;
    refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    /**
     * Initialize auth state from localStorage and verify with backend
     */
    const initAuth = async () => {
        const storedToken = AuthService.getToken();
        const storedUser = AuthService.getUser();

        if (storedToken && storedUser) {
            setUser(storedUser);
            // Verify token/session integrity with backend in the background
            try {
                const freshUser = await AuthService.getCurrentUser();
                setUser(freshUser);
                AuthService.setSession(storedToken, freshUser);
            } catch (error) {
                console.error('Session validation failed:', error);
                // If it's a 401, clear session and redirect
                // Note: lib/api.ts interceptor should handle 401, but we handle it here for initial load
                AuthService.clearSession();
                setUser(null);
                router.push('/login');
            }
        }
        setLoading(false);
    };

    useEffect(() => {
        initAuth();
    }, []);

    const login = async (credentials: LoginCredentials) => {
        setLoading(true);
        try {
            const { token, user: loggedInUser, message } = await AuthService.login(credentials);
            AuthService.setSession(token, loggedInUser);
            setUser(loggedInUser);
            toast.success(message);
            router.push('/');
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || error.message || 'Login failed';
            toast.error(errorMessage);
            throw error;
        } finally {
            setLoading(false);
        }
    };

    const logout = async () => {
        setLoading(true);
        try {
            await AuthService.logout();
            setUser(null);
            toast.success('Logged out successfully');
            router.push('/login');
        } catch (error: any) {
            toast.error('Logout failed');
        } finally {
            setLoading(false);
        }
    };

    const refreshUser = async () => {
        try {
            const freshUser = await AuthService.getCurrentUser();
            setUser(freshUser);
            const token = AuthService.getToken();
            if (token) {
                AuthService.setSession(token, freshUser);
            }
        } catch (error) {
            console.error('Failed to refresh user data:', error);
        }
    };

    return (
        <AuthContext.Provider value={{
            user,
            loading,
            login,
            logout,
            isAuthenticated: !!user,
            refreshUser
        }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
