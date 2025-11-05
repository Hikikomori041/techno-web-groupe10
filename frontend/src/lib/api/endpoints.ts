export const ENDPOINTS = {
    AUTH: {
        LOGIN: '/auth/login',
        GOOGLE: '/auth/google',
        REGISTER: '/auth/register',
        LOGOUT: '/auth/logout',
        PROFILE: '/auth/profile',
        CHECK: '/auth/check',
    },
    USERS: {
        ALL: '/users',
        ONE: (id: string) => `/users/${id}`,
        UPDATE_ROLE: (id: string) => `/users/${id}/role`,
        DELETE: (id: string) => `/users/${id}`,
    },
    CATEGORIES: {
        ALL: '/categories',
        ONE: (id: string) => `/categories/${id}`,
        CREATE: '/categories',
        UPDATE: (id: string) => `/categories/${id}`,
        DELETE: (id: string) => `/categories/${id}`,
    },
    PRODUCTS: {
        DASHBOARD_ALL: '/products/dashboard/all',
        ALL: '/products',
        ONE: (id: string) => `/products/${id}`,
        CREATE: '/products/create',
        UPDATE: (id: string) => `/products/${id}`,
        DELETE: (id: string) => `/products/${id}`,
    },
    CART: {
        ADD: '/cart',
        USER_CART: `/cart`,
        UPDATE_ITEM: (productID: string) => `/cart/${productID}`,
        REMOVE_ITEM: (productID: string) => `/cart/${productID}`,
        CLEAR: '/cart/clear',
    },
    ORDERS: {
        CREATE: '/orders',
        USER_ORDERS: '/orders',
        ALL_ORDERS: '/orders/all',
        ONE: (id: string) => `/orders/${id}`,
        UPDATE_STATUS: (id: string) => `/orders/${id}/status`,
        UPDATE_PAYMENT: (id: string) => `/orders/${id}/payment`,
        DELETE: (id: string) => `/orders/${id}`,
    },
    STATS:{
        DASHBOARD: '/stats/dashboard',
    },
    UPLOAD: {
        IMAGE: '/upload/image',
    },
    CREDENTIALS: {
        INCLUDE: {withCredentials: true}
    }
};