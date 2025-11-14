import {apiClient} from '@/lib/api/clients';
import {ENDPOINTS} from '@/lib/api/endpoints';
import {User} from '@/lib/api/definitions';


export const usersService = {
    // Get all users (Admin only)
    getAllUsers: async (): Promise<User[]> => {
        const res = await apiClient.get<User[]>(ENDPOINTS.USERS.ALL, ENDPOINTS.CREDENTIALS.INCLUDE);
        return res.data;
    },

    // Get user by ID (Admin only)
    getUserById: async (userId: string): Promise<User> => {
        const res = await apiClient.get<User>(ENDPOINTS.USERS.ONE(userId), ENDPOINTS.CREDENTIALS.INCLUDE);
        return res.data;
    },

    // Update user roles (Admin only)
    updateUserRole: async (userId: string, roles: string[]): Promise<User> => {
        const res = await apiClient.put<User>(
            ENDPOINTS.USERS.UPDATE_ROLE(userId),
            {roles},
            ENDPOINTS.CREDENTIALS.INCLUDE
        );
        return res.data;
    },

    // Delete user (Admin only)
    deleteUser: async (userId: string): Promise<void> => {
        await apiClient.delete(
            ENDPOINTS.USERS.DELETE(userId),
            ENDPOINTS.CREDENTIALS.INCLUDE
        );
    },
};