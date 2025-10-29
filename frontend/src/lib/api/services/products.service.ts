import { apiClient } from '@/lib/api/clients';
import { ENDPOINTS } from '@/lib/api/endpoints';
import {Product} from "@/lib/api/definitions";


export const productsService = {
    // Fetch all products
    getProducts: async ():Promise<Product[]> => {
        return apiClient.get(ENDPOINTS.PRODUCTS.ALL);
    },

    getProductById: async (id: string):Promise<Product> => {
        return apiClient.get(ENDPOINTS.PRODUCTS.ONE(id));
    },

    createProduct: async (productData: Product) => {
        return apiClient.post(ENDPOINTS.PRODUCTS.CREATE, productData);
    }
}