export interface LoginCredentials {
    email: string;
    password: string;
}

export interface RegisterCredentials {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
}

export interface AuthCheckResponse {
    authenticated: boolean;
    user?: User;
}

export interface User {
    _id: string;
    email: string;
    firstName: string;
    lastName: string;
    provider: 'local' | 'google';
    roles: string[];
    picture?: string;
    createdAt: string;
    updatedAt: string;
}

export interface Product {
    _id: string;
    nom: string;
    prix: number;
    description?: string;
    images?: string[];
    specifications: Array<{ key: string; value: string }>;
    id_categorie: string;
    quantite_en_stock: number;
    date_de_creation: string;
}

export interface ProductFilters {
    categoryId?: string;
    search?: string;
    minPrice?: number;
    maxPrice?: number;
    inStockOnly?: boolean;
    specifications?: { [key: string]: string };
}

export interface CreateProductDto {
    nom: string;
    prix: number;
    description: string | null | undefined;
    images?: string[] | null | undefined;
    categoryId: string;
    specifications: Array<{ key: string; value: string }>;
    quantite_en_stock: number;
}

export interface Category {
    _id: string;
    name: string;
    description?: string;
    isActive: boolean;
    createdAt?: string;
    updatedAt?: string;
}


export interface CreateCategoryData {
    name: string;
    description?: string;
    isActive?: boolean;
}

export interface UpdateCategoryData {
    name?: string;
    description?: string;
    isActive?: boolean;
}

export interface CartItem {
    _id: string;
    productId: {
        _id: string;
        nom: string;
        prix: number;
        description?: string;
        images?: string[];
        id_categorie: string;
    };
    quantity: number;
    subtotal: number;
    addedAt: string;
}

export interface Cart {
    items: CartItem[];
    total: number;
    itemCount: number;
}

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
    userId: string | { _id: string; email: string; firstName?: string; lastName?: string };
    orderNumber: string;
    items: OrderItem[];
    total: number;
    status: 'pending' | 'preparation' | 'payment_confirmed' | 'shipped' | 'delivered' | 'cancelled';
    paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
    shippingAddress: ShippingAddress;
    createdAt: string;
    updatedAt: string;
}

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