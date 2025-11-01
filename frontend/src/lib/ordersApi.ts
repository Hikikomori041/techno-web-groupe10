const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export interface ShippingAddress {
  street: string;
  city: string;
  postalCode: string;
  country: string;
}

export interface OrderItem {
  productId: string;
  productName: string;
  productPrice: number;
  quantity: number;
  subtotal: number;
}

export interface Order {
  _id: string;
  userId: any;
  orderNumber: string;
  items: OrderItem[];
  total: number;
  status: 'pending' | 'preparation' | 'payment_confirmed' | 'shipped' | 'delivered' | 'cancelled';
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  shippingAddress: ShippingAddress;
  createdAt: string;
  updatedAt: string;
}

export const ordersApi = {
  // Create order from cart
  createOrder: async (shippingAddress: ShippingAddress): Promise<Order> => {
    const response = await fetch(`${API_URL}/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ shippingAddress }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to create order');
    }

    return response.json();
  },

  // Get user's orders
  getUserOrders: async (): Promise<Order[]> => {
    const response = await fetch(`${API_URL}/orders`, {
      method: 'GET',
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error('Failed to fetch orders');
    }

    return response.json();
  },

  // Get specific order
  getOrderById: async (orderId: string): Promise<Order> => {
    const response = await fetch(`${API_URL}/orders/${orderId}`, {
      method: 'GET',
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error('Failed to fetch order');
    }

    return response.json();
  },

  // Get all orders (admin)
  getAllOrders: async (): Promise<Order[]> => {
    const response = await fetch(`${API_URL}/orders/all`, {
      method: 'GET',
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error('Failed to fetch all orders');
    }

    return response.json();
  },

  // Update order status
  updateOrderStatus: async (orderId: string, status: string): Promise<Order> => {
    const response = await fetch(`${API_URL}/orders/${orderId}/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ status }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to update status');
    }

    return response.json();
  },

  // Update payment status
  updatePaymentStatus: async (orderId: string, paymentStatus: string): Promise<Order> => {
    const response = await fetch(`${API_URL}/orders/${orderId}/payment`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ paymentStatus }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to update payment status');
    }

    return response.json();
  },

  // Cancel order
  cancelOrder: async (orderId: string): Promise<Order> => {
    const response = await fetch(`${API_URL}/orders/${orderId}`, {
      method: 'DELETE',
      credentials: 'include',
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to cancel order');
    }

    return response.json();
  },
};

