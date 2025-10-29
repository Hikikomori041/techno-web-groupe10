import { apiClient } from '@/lib/api/clients';
import { ENDPOINTS } from '@/lib/api/endpoints';


export const categoriesService = {
    // Fetch all categories
    fetchAll: async () => {
        return apiClient.get(ENDPOINTS.CATEGORIES.ALL);
    },
}