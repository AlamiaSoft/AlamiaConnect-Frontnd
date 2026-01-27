import api from '@/lib/api';
import axios from 'axios';
import type { paths, components } from '@/types/api';
import { BaseService } from './base-service';

// Extract types from OpenAPI spec
type LoginOperation = paths['/api/v1/login']['post'];
type LoginResponse = LoginOperation['responses']['200']['content']['application/json'];

type GetUserOperation = paths['/api/v1/get']['get'];
type GetUserResponse = GetUserOperation['responses']['200']['content']['application/json'];

// User type from components
// User type from components
export type ApiUser = components['schemas']['User'];

export interface Role {
    id: number;
    name: string;
    permission_type: 'all' | 'custom';
    permissions: string[];
    access_level?: 'global' | 'group' | 'individual';
}

export interface User extends Omit<ApiUser, 'role'> {
    role?: Role;
    [key: string]: any;
}

// Login credentials interface
export interface LoginCredentials {
    email: string;
    password: string;
    device_name?: string;
}

export class AuthService {
    /**
     * Fetch CSRF cookie for Laravel Sanctum
     */
    static async csrf(): Promise<void> {
        // Derive root URL by stripping /api/v1 from the baseURL
        const rootUrl = api.defaults.baseURL?.replace('/api/v1', '') || 'http://localhost:8000';

        try {
            await axios.get(`${rootUrl}/sanctum/csrf-cookie`, {
                withCredentials: true,
                headers: {
                    'X-Requested-With': 'XMLHttpRequest'
                }
            });
        } catch (e) {
            console.warn('CSRF fetch failed', e);
        }
    }

    /**
     * Login user and return authentication token
     * Response structure now matches OpenAPI spec with nested data.data
     */
    static async login(credentials: LoginCredentials): Promise<{
        token: string;
        user: User;
        message: string;
    }> {
        await this.csrf();

        try {
            const response = await api.post<LoginResponse>('/login', {
                email: credentials.email,
                password: credentials.password,
                device_name: credentials.device_name || 'alamia-connect-web',
            });

            // Extract user from JSON:API structure
            // Handle both nested .data.data (standard JSON:API collection) and .data (unwrapped resource) cases
            const userData = response.data.data?.data || response.data.data;
            if (!userData || !response.data.token) {
                throw new Error('Invalid login response structure');
            }

            const user: User = {
                id: parseInt(userData.id || '0', 10),
                ...userData.attributes,
            };

            return {
                token: response.data.token,
                user: user,
                message: response.data.message || 'Login successful',
            };
        } catch (error) {
            return BaseService.handleError(error);
        }
    }

    /**
     * Get current authenticated user
     * Response structure now matches OpenAPI spec
     */
    static async getCurrentUser(): Promise<User> {
        const response = await api.get<GetUserResponse>('/get');

        const userData = response.data.data;
        if (!userData) {
            throw new Error('User data not found in response');
        }

        // Extract user from JSON:API structure
        return {
            id: parseInt(userData.id || '0', 10),
            ...userData.attributes,
        };
    }

    /**
     * Logout current user
     */
    static async logout(): Promise<void> {
        try {
            await api.delete('/logout');
        } catch (e) {
            console.error('Logout error', e);
        } finally {
            this.clearSession();
        }
    }

    /**
     * Store authentication session
     */
    static setSession(token: string, user: User): void {
        if (typeof window !== 'undefined') {
            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(user));
        }
    }

    /**
     * Clear authentication session
     */
    static clearSession(): void {
        if (typeof window !== 'undefined') {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
        }
    }

    /**
     * Get stored user from session
     */
    static getUser(): User | null {
        if (typeof window !== 'undefined') {
            const userStr = localStorage.getItem('user');
            return userStr ? JSON.parse(userStr) : null;
        }
        return null;
    }

    /**
     * Get stored token from session
     */
    static getToken(): string | null {
        if (typeof window !== 'undefined') {
            return localStorage.getItem('token');
        }
        return null;
    }

    /**
     * Check if user is authenticated
     */
    static isAuthenticated(): boolean {
        return !!this.getToken();
    }
}
