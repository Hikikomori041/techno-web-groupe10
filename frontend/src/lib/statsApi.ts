const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export interface DashboardStats {
  revenue: {
    total: number;
    thisMonth: number;
    today: number;
    averageOrder: number;
  };
  orders: {
    total: number;
    pending: number;
    preparation: number;
    payment_confirmed: number;
    shipped: number;
    delivered: number;
    cancelled: number;
  };
  products: {
    total: number;
    inStock: number;
    outOfStock: number;
    lowStock: number;
  };
  users: {
    total: number;
    admins: number;
    moderators: number;
  };
  sales: {
    totalQuantitySold: number;
    topProducts: Array<{
      name: string;
      quantity: number;
      revenue: number;
    }>;
  };
  recentOrders: Array<{
    _id: string;
    orderNumber: string;
    total: number;
    status: string;
    createdAt: string;
  }>;
  revenueByDay: Array<{
    date: string;
    revenue: number;
    orders: number;
  }>;
}

export const statsApi = {
  getDashboardStats: async (): Promise<DashboardStats> => {
    const response = await fetch(`${API_URL}/stats/dashboard`, {
      method: 'GET',
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error('Failed to fetch dashboard stats');
    }

    return response.json();
  },
};

