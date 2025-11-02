import {apiClient} from '@/lib/api/clients';
import {ENDPOINTS} from '@/lib/api/endpoints';
import {CartItem, Cart} from '@/lib/api/definitions';


export const cartService = {
    // Add product to cart
    addToCart: async (productId: string, quantity: number = 1): Promise<CartItem> => {
        return await apiClient.post(
            ENDPOINTS.CART.ADD,
            {productId, quantity},
            ENDPOINTS.CREDENTIALS.INCLUDE
        );
    },

    // Get user's cart
    getCart: async (): Promise<Cart> => {
        return await apiClient.get(
            ENDPOINTS.CART.USER_CART,
            ENDPOINTS.CREDENTIALS.INCLUDE
        );
    },

    // Update cart item quantity
    updateQuantity: async (productId: string, quantity: number): Promise<any> => {
        return await apiClient.post(
            ENDPOINTS.CART.UPDATE_ITEM(productId),
            {quantity},
            ENDPOINTS.CREDENTIALS.INCLUDE
        );
    },

    // Remove item from cart
    removeFromCart: async (productId: string): Promise<any> => {
        return await apiClient.delete(
            ENDPOINTS.CART.REMOVE_ITEM(productId),
            ENDPOINTS.CREDENTIALS.INCLUDE
        );
    },

    // Clear cart
    clearCart: async (): Promise<any> => {
        return await apiClient.delete(
            ENDPOINTS.CART.CLEAR,
            ENDPOINTS.CREDENTIALS.INCLUDE
        );
    },
}
