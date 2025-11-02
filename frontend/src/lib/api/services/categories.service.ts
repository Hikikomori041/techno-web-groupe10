import {apiClient} from '@/lib/api/clients';
import {ENDPOINTS} from '@/lib/api/endpoints';
import {Category, CreateCategoryData, UpdateCategoryData} from '@/lib/api/definitions';


export const categoriesService = {
    // Fetch all categories
    getAllCategories: async (): Promise<Category[]> => {
        const res = await apiClient.get<Category[]>(ENDPOINTS.CATEGORIES.ALL);
        return res.data;
    },

    getCategory: async (id: string): Promise<Category> => {
        const res = await apiClient.get<Category>(ENDPOINTS.CATEGORIES.ONE(id));
        return res.data;
    },

    createCategory: async (data: CreateCategoryData): Promise<Category> => {
        const res = await apiClient.post<Category>(ENDPOINTS.CATEGORIES.CREATE, data, ENDPOINTS.CREDENTIALS.INCLUDE);
        return res.data;
    },

    updateCategory: async (id: string, data: UpdateCategoryData): Promise<Category> => {
        const res = await apiClient.put<Category>(ENDPOINTS.CATEGORIES.UPDATE(id), data, ENDPOINTS.CREDENTIALS.INCLUDE);
        return res.data;
    },

    deleteCategory: async (id: string): Promise<void> => {
        const res = await apiClient.delete<void>(ENDPOINTS.CATEGORIES.DELETE(id), ENDPOINTS.CREDENTIALS.INCLUDE);
        return res.data;
    }
}