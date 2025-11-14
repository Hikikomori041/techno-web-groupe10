import {apiClient} from '@/lib/api/clients';
import {ENDPOINTS} from '@/lib/api/endpoints';
import {CartItem, Cart} from '@/lib/api/definitions';


export const cartService = {
    // Add product to cart
    addToCart: async (productId: string, quantity: number = 1): Promise<CartItem> => {
        const res = await apiClient.post<CartItem>(
            ENDPOINTS.CART.ADD,
            {productId, quantity},
            ENDPOINTS.CREDENTIALS.INCLUDE
        );

        return res.data;
    },

    // Get user's cart
    getCart: async (): Promise<Cart> => {
        const res = await apiClient.get<Cart>(
            ENDPOINTS.CART.USER_CART,
            ENDPOINTS.CREDENTIALS.INCLUDE
        );

        return res.data;
    },

    // Update cart item quantity
    updateQuantity: async (productId: string, quantity: number): Promise<Cart> => {
        const res = await apiClient.post<Cart>(
            ENDPOINTS.CART.UPDATE_ITEM(productId),
            {quantity},
            ENDPOINTS.CREDENTIALS.INCLUDE
        );

        return res.data;
    },

    // Remove item from cart
    removeFromCart: async (productId: string): Promise<Cart> => {
        const res = await apiClient.delete<Cart>(
            ENDPOINTS.CART.REMOVE_ITEM(productId),
            ENDPOINTS.CREDENTIALS.INCLUDE
        );

        return res.data;
    },

    // Clear cart
    clearCart: async (): Promise<void> => {
        await apiClient.delete(
            ENDPOINTS.CART.CLEAR,
            ENDPOINTS.CREDENTIALS.INCLUDE
        );
    },
}
