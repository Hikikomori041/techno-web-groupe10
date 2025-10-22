const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export interface Category {
  _id: string;
  name: string;
  description?: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateCategoryData {
  name: string;
  description?: string;
  isActive?: boolean;
}

export interface UpdateCategoryData {
  name?: string;
  description?: string;
  isActive?: boolean;
}

export const categoriesApi = {
  // Get all categories
  getCategories: async (): Promise<Category[]> => {
    const response = await fetch(`${API_URL}/categories`, {
      method: 'GET',
      credentials: 'include',
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Failed to fetch categories' }));
      throw new Error(errorData.message || 'Failed to fetch categories');
    }

    return response.json();
  },

  // Get single category by ID
  getCategory: async (id: string): Promise<Category> => {
    const response = await fetch(`${API_URL}/categories/${id}`, {
      method: 'GET',
      credentials: 'include',
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Failed to fetch category' }));
      throw new Error(errorData.message || 'Failed to fetch category');
    }

    return response.json();
  },

  // Create new category (Admin only)
  createCategory: async (data: CreateCategoryData): Promise<Category> => {
    const response = await fetch(`${API_URL}/categories`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Failed to create category' }));
      throw new Error(errorData.message || 'Failed to create category');
    }

    return response.json();
  },

  // Update category (Admin only)
  updateCategory: async (id: string, data: UpdateCategoryData): Promise<Category> => {
    const response = await fetch(`${API_URL}/categories/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Failed to update category' }));
      throw new Error(errorData.message || 'Failed to update category');
    }

    return response.json();
  },

  // Delete category (Admin only)
  deleteCategory: async (id: string): Promise<void> => {
    const response = await fetch(`${API_URL}/categories/${id}`, {
      method: 'DELETE',
      credentials: 'include',
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Failed to delete category' }));
      throw new Error(errorData.message || 'Failed to delete category');
    }
  },
};

