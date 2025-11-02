import {apiClient} from '@/lib/api/clients';
import {ENDPOINTS} from '@/lib/api/endpoints';
import {ShippingAddress, Order} from '@/lib/api/definitions';


export const ordersService = {
    // Create order from cart
    createOrder: async (shippingAddress: ShippingAddress): Promise<Order> => {
        return await apiClient.post<Order>(ENDPOINTS.ORDERS.CREATE, {shippingAddress}, ENDPOINTS.CREDENTIALS.INCLUDE);
    },

    // Get user's orders
    getUserOrders: async (): Promise<Order[]> => {
        return await apiClient.get<Order[]>(ENDPOINTS.ORDERS.USER_ORDERS, ENDPOINTS.CREDENTIALS.INCLUDE);
    },

    // Get specific order
    getOrderById: async (orderId: string): Promise<Order> => {
        return await apiClient.get<Order>(ENDPOINTS.ORDERS.ONE(orderId), ENDPOINTS.CREDENTIALS.INCLUDE);
    },

    // Get all orders (admin)
    getAllOrders: async (): Promise<Order[]> => {
        return await apiClient.get<Order[]>(ENDPOINTS.ORDERS.ALL_ORDERS, ENDPOINTS.CREDENTIALS.INCLUDE);
    },

    // Update order status (admin)
    updateOrderStatus: async (orderId: string, status: string): Promise<Order> => {
        return await apiClient.put<Order>(ENDPOINTS.ORDERS.UPDATE_STATUS(orderId), {status}, ENDPOINTS.CREDENTIALS.INCLUDE);
    },

    // Update payment status (admin)
    updatePaymentStatus: async (orderId: string, paymentStatus: string): Promise<Order> => {
        return await apiClient.put<Order>(ENDPOINTS.ORDERS.UPDATE_PAYMENT(orderId), {paymentStatus}, ENDPOINTS.CREDENTIALS.INCLUDE);
    },

    // Delete order (admin)
    cancelOrder: async (orderId: string): Promise<void> => {
        return await apiClient.delete<void>(ENDPOINTS.ORDERS.DELETE(orderId), ENDPOINTS.CREDENTIALS.INCLUDE);
    }
}