const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export interface User {
  _id: string;
  email: string;
  firstName: string;
  lastName: string;
  provider: 'local' | 'google';
  roles: string[];
  picture?: string;
  createdAt: string;
  updatedAt: string;
}

export const usersApi = {
  // Get all users (Admin only)
  getAllUsers: async (): Promise<User[]> => {
    const response = await fetch(`${API_URL}/users`, {
      method: 'GET',
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error('Failed to fetch users');
    }

    return response.json();
  },

  // Get user by ID (Admin only)
  getUserById: async (userId: string): Promise<User> => {
    const response = await fetch(`${API_URL}/users/${userId}`, {
      method: 'GET',
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error('Failed to fetch user');
    }

    return response.json();
  },

  // Update user roles (Admin only)
  updateUserRole: async (userId: string, roles: string[]): Promise<User> => {
    const response = await fetch(`${API_URL}/users/${userId}/role`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ roles }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to update user role');
    }

    return response.json();
  },

  // Delete user (Admin only)
  deleteUser: async (userId: string): Promise<void> => {
    const response = await fetch(`${API_URL}/users/${userId}`, {
      method: 'DELETE',
      credentials: 'include',
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to delete user');
    }
  },
};

