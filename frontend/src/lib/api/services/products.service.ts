import {apiClient} from '@/lib/api/clients';
import {ENDPOINTS} from '@/lib/api/endpoints';
import {Product, ProductFilters, CreateProductDto} from "@/lib/api/definitions";


export const productsService = {
    // Fetch all products
    getAllProducts: async (): Promise<Product[]> => {
        const res = await apiClient.get<Product[]>(ENDPOINTS.PRODUCTS.ALL);
        return res.data;
    },

    getAllProductsDashboard: async (): Promise<Product[]> => {
        const res = await apiClient.get<Product[]>(ENDPOINTS.PRODUCTS.DASHBOARD_ALL, ENDPOINTS.CREDENTIALS.INCLUDE);
        return res.data;
    },

    getProductById: async (id: string): Promise<Product> => {
        const res = await apiClient.get<Product>(ENDPOINTS.PRODUCTS.ONE(id));
        return res.data;
    },

    filterProducts: async (page: number = 1,
                           limit: number = 12,
                           filters?: ProductFilters): Promise<{
        products: Product[];
        total: number;
        hasMore: boolean;
    }> => {
        const params: Record<string, string | number | boolean | undefined> = {
            page,
            limit,
        };

        // Add filters only if they have values
        if (filters?.categoryId && filters.categoryId.trim() !== '') {
            params.categoryId = filters.categoryId.trim();
        }

        if (filters?.search && filters.search.trim()) {
            params.search = filters.search.trim();
        }

        if (filters?.minPrice !== undefined && filters.minPrice > 0) {
            params.minPrice = filters.minPrice;
        }

        if (filters?.maxPrice !== undefined && filters.maxPrice < 5000) {
            params.maxPrice = filters.maxPrice;
        }

        if (filters?.inStockOnly) {
            params.inStockOnly = filters.inStockOnly;
        }

        // Convert specifications object to JSON string for the backend
        if (filters?.specifications && Object.keys(filters.specifications).length > 0) {
            params.specifications = JSON.stringify(filters.specifications);
        }

        const res = await apiClient.get<{
            products: Product[];
            total: number;
            hasMore: boolean;
        }>(ENDPOINTS.PRODUCTS.ALL, {params})
        return res.data;
    },

    createProduct: async (productData: CreateProductDto): Promise<Product> => {
        const res = await apiClient.post<Product>(ENDPOINTS.PRODUCTS.CREATE, productData, ENDPOINTS.CREDENTIALS.INCLUDE);
        return res.data;
    },

    updateProduct: async (productId: string, productData: CreateProductDto): Promise<Product> => {
        const res = await apiClient.put<Product>(ENDPOINTS.PRODUCTS.UPDATE(productId), productData, ENDPOINTS.CREDENTIALS.INCLUDE);
        return res.data;
    },

    deleteProductById: async (id: string): Promise<void> => {
        return apiClient.delete(ENDPOINTS.PRODUCTS.DELETE(id), ENDPOINTS.CREDENTIALS.INCLUDE);
    }
}