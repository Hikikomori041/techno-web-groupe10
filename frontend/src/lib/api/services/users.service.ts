import {apiClient} from '@/lib/api/clients';
import {ENDPOINTS} from '@/lib/api/endpoints';
import {User} from '@/lib/api/definitions';


export const usersService = {
    // Get all users (Admin only)
    getAllUsers: async (): Promise<User[]> => {
        return apiClient.get<User[]>(ENDPOINTS.USERS.ALL, ENDPOINTS.CREDENTIALS.INCLUDE);
    },

    // Get user by ID (Admin only)
    getUserById: async (userId: string): Promise<User> => {
        return apiClient.get<User>(ENDPOINTS.USERS.ONE(userId), ENDPOINTS.CREDENTIALS.INCLUDE);
    },

    // Update user roles (Admin only)
    updateUserRole: async (userId: string, roles: string[]): Promise<User> => {
        return apiClient.put<User>(
            ENDPOINTS.USERS.UPDATE_ROLE(userId),
            {roles},
            ENDPOINTS.CREDENTIALS.INCLUDE
        );
    },

    // Delete user (Admin only)
    deleteUser: async (userId: string): Promise<void> => {
        return apiClient.delete<void>(
            ENDPOINTS.USERS.DELETE(userId),
            ENDPOINTS.CREDENTIALS.INCLUDE
        );
    },
};