import { apiClient } from '@/lib/api/clients';
import { ENDPOINTS } from '@/lib/api/endpoints';
import {LoginCredentials, RegisterCredentials, AuthResponse, User} from '@/lib/api/types/api.types';

export const authService = {
    // Email/Password Login
    login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
        const response = await apiClient.post<AuthResponse>(
            ENDPOINTS.AUTH.LOGIN,
            credentials
        );

        // Store tokens in localStorage
        if (typeof window !== 'undefined') {
            localStorage.setItem('access_token', response.access_token);
            localStorage.setItem('user', JSON.stringify(response.user));
        }

        return response;
    },

    // Register
    register: async (credentials: RegisterCredentials): Promise<AuthResponse> => {
        const response = await apiClient.post<AuthResponse>(
            ENDPOINTS.AUTH.REGISTER,
            credentials
        );

        if (typeof window !== 'undefined') {
            localStorage.setItem('access_token', response.access_token);
            localStorage.setItem('user', JSON.stringify(response.user));
        }

        return response;
    },

    // Google OAuth (returns redirect URL)
    getGoogleAuthUrl: (): string => {
        return `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}${ENDPOINTS.AUTH.GOOGLE}`;
    },

    // Logout
    logout: async (): Promise<void> => {
        try {
            await apiClient.post(ENDPOINTS.AUTH.LOGOUT);
        } finally {
            if (typeof window !== 'undefined') {
                localStorage.removeItem('access_token');
                localStorage.removeItem('user');
            }
        }
    },

    // Get current user
    getCurrentUser: async () => {
        return apiClient.get(ENDPOINTS.AUTH.ME);
    },

    // Check if user is authenticated
    isAuthenticated: (): boolean => {
        if (typeof window === 'undefined') return false;
        return !!localStorage.getItem('access_token');
    },

    // Get stored user
    getStoredUser: (): User | null => {
        if (typeof window === 'undefined') return null;
        const userStr = localStorage.getItem('user');
        return userStr ? JSON.parse(userStr) : null;
    },
};