import {apiClient} from '@/lib/api/clients';
import {ENDPOINTS} from '@/lib/api/endpoints';
import { LoginCredentials, RegisterCredentials, AuthCheckResponse} from '@/lib/api/definitions';
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

    // Check if user is authenticated
    isAuthenticated(): Promise<AuthCheckResponse> {
        try {
            const response = await apiClient.get(ENDPOINTS.AUTH.CHECK,ENDPOINTS.CREDENTIALS.INCLUDE)

            if (!response.ok) {
                return { authenticated: false };
            }

            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Auth check failed:', error);
            return { authenticated: false };
        }
    }
};