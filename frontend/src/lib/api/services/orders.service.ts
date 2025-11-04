import {apiClient} from '@/lib/api/clients';
import {ENDPOINTS} from '@/lib/api/endpoints';
import {ShippingAddress, Order} from '@/lib/api/definitions';


export const ordersService = {
    // Create order from cart
    createOrder: async (shippingAddress: ShippingAddress): Promise<Order> => {
        const rest =  await apiClient.post<Order>(ENDPOINTS.ORDERS.CREATE, {shippingAddress}, ENDPOINTS.CREDENTIALS.INCLUDE);
        return rest.data;
    },

    // Get user's orders
    getUserOrders: async (): Promise<Order[]> => {
        const rest =  await apiClient.get(ENDPOINTS.ORDERS.USER_ORDERS, ENDPOINTS.CREDENTIALS.INCLUDE);
        return rest.data;
    },

    // Get specific order
    getOrderById: async (orderId: string): Promise<Order> => {
        const rest =  await apiClient.get(ENDPOINTS.ORDERS.ONE(orderId), ENDPOINTS.CREDENTIALS.INCLUDE);
        return rest.data;
    },

    // Get all orders (admin)
    getAllOrders: async (): Promise<Order[]> => {
        const rest =  await apiClient.get(ENDPOINTS.ORDERS.ALL_ORDERS, ENDPOINTS.CREDENTIALS.INCLUDE);
        return rest.data;
    },

    // Update order status (admin)
    updateOrderStatus: async (orderId: string, status: string): Promise<Order> => {
        const rest =  await apiClient.put(ENDPOINTS.ORDERS.UPDATE_STATUS(orderId), {status}, ENDPOINTS.CREDENTIALS.INCLUDE);
        return rest.data;
    },

    // Update payment status (admin)
    updatePaymentStatus: async (orderId: string, paymentStatus: string): Promise<Order> => {
        const rest =  await apiClient.put(ENDPOINTS.ORDERS.UPDATE_PAYMENT(orderId), {paymentStatus}, ENDPOINTS.CREDENTIALS.INCLUDE);
        return rest.data;
    },

    // Delete order (admin)
    cancelOrder: async (orderId: string): Promise<void> => {
        const rest =  await apiClient.delete(ENDPOINTS.ORDERS.DELETE(orderId), ENDPOINTS.CREDENTIALS.INCLUDE);
    }
}