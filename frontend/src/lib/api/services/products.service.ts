import {apiClient} from '@/lib/api/clients';
import {ENDPOINTS} from '@/lib/api/endpoints';
import {Product, ProductFilters, CreateProductDto} from "@/lib/api/definitions";


export const productsService = {
    // Fetch all products
    getAllProducts: async (): Promise<Product[]> => {
        const res = await apiClient.get(ENDPOINTS.PRODUCTS.ALL);
        return res.data;
    },

    getAllProductsDashboard: async (): Promise<{ products: Product[] }> => {
        const res = await apiClient.get(ENDPOINTS.PRODUCTS.DASHBOARD_ALL, ENDPOINTS.CREDENTIALS.INCLUDE);
        return res.data;
    },

    getProductById: async (id: string): Promise<Product> => {
        const res = await apiClient.get(ENDPOINTS.PRODUCTS.ONE(id));
        return res.data;
    },

    filterProducts: async (page: number = 1,
                           limit: number = 12,
                           filters?: ProductFilters): Promise<{
        products: Product[];
        total: number;
        hasMore: boolean;
    }> => {
        const params: Record<string, any> = {
            page,
            limit,
            ...filters, // spread optional filter fields
        };
        const res = await apiClient.get(ENDPOINTS.PRODUCTS.ALL, {params})
        return res.data;
    },

    createProduct: async (productData: CreateProductDto): Promise<Product> => {
        const res = await apiClient.post(ENDPOINTS.PRODUCTS.CREATE, productData, ENDPOINTS.CREDENTIALS.INCLUDE);
        return res.data;
    },

    updateProduct: async (productId: string, productData: CreateProductDto): Promise<Product> => {
        const res = await apiClient.put(ENDPOINTS.PRODUCTS.UPDATE(productId), productData, ENDPOINTS.CREDENTIALS.INCLUDE);
        return res.data;
    },

    deleteProductById: async (id: string): Promise<void> => {
        return apiClient.delete(ENDPOINTS.PRODUCTS.DELETE(id), ENDPOINTS.CREDENTIALS.INCLUDE);
    }
}