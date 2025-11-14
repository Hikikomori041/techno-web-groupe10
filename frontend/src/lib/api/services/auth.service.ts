import {apiClient} from '@/lib/api/clients';
import {ENDPOINTS} from '@/lib/api/endpoints';
import {LoginCredentials, RegisterCredentials, AuthCheckResponse, User} from '@/lib/api/definitions';
import {toast} from "sonner";

export const authService = {
    // Email/Password Login
    login: async (credentials: LoginCredentials) => {
        const res = await apiClient.post(
            ENDPOINTS.AUTH.LOGIN,
            credentials,
            ENDPOINTS.CREDENTIALS.INCLUDE
        );

        return res.data;
    },

    // Register
    register: async (credentials: RegisterCredentials) => {
        const res = await apiClient.post(
            ENDPOINTS.AUTH.REGISTER,
            credentials
        );

        return res.data;
    },

    // Google OAuth (returns redirect URL)
    getGoogleAuthUrl: (): string => {
        return `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}${ENDPOINTS.AUTH.GOOGLE}`;
    },

    // Logout
    logout: async (): Promise<void> => {
        try {
            await apiClient.post(ENDPOINTS.AUTH.LOGOUT, {}, ENDPOINTS.CREDENTIALS.INCLUDE);
        } finally {
            toast.success("Logged out successfully.");
        }
    },

    // Check if user is authenticated
    async isAuthenticated(): Promise<AuthCheckResponse> {
        try {
            const res = await apiClient.get(ENDPOINTS.AUTH.CHECK, ENDPOINTS.CREDENTIALS.INCLUDE);
            return res.data;
        } catch (error: any) {
            // 401 is expected when user is not authenticated - return false instead of throwing
            if (error?.response?.status === 401) {
                return { authenticated: false };
            }
            // For other errors, rethrow
            throw error;
        }
    },


    async profile(): Promise<User> {
        const res = await apiClient.get(ENDPOINTS.AUTH.PROFILE, ENDPOINTS.CREDENTIALS.INCLUDE);
        return res.data;
    }
};