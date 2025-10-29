import {apiClient} from '@/lib/api/clients';
import {ENDPOINTS} from '@/lib/api/endpoints';
import { LoginCredentials, RegisterCredentials, User} from '@/lib/api/definitions';
import {useRouter} from "next/navigation";



const router = useRouter();


export const authService = {
    // Email/Password Login
    login: async (credentials: LoginCredentials) => {
        return await apiClient.post(
            ENDPOINTS.AUTH.LOGIN,
            credentials
        );
    },

    // Register
    register: async (credentials: RegisterCredentials) => {
        return await apiClient.post(
            ENDPOINTS.AUTH.REGISTER,
            credentials
        );
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
            alert("Logged out successfully.");
            router.push('/login');
        }
    },

    // Get current user
    getUserprofile: async () => {
        return apiClient.get(ENDPOINTS.AUTH.PROFILE, true);
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