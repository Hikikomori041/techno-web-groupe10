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

export interface User {
    id: string;
    email: string;
    name: string;
    avatar?: string;
    createdAt: string;
}

export interface AuthResponse {
    access_token: string;
    user: User;
}

export interface ApiError {
    message: string;
    statusCode?: number;
}