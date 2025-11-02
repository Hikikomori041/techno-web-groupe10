import axios from "axios";

const API_BASE_URL = "http://localhost:3000";

export const apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        "Content-Type": "application/json",
    }
});

// Optional interceptors for logging or attaching tokens
apiClient.interceptors.request.use(
    (config) => {
        // Example: attach token if needed
        // const token = localStorage.getItem("token");
        // if (token) config.headers.Authorization = `Bearer ${token}`;
        return config;
    },
    (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        console.error("API Error:", error.response?.data || error.message);
        return Promise.reject(error);
    }
);


/*
class ApiClient {
    private readonly baseURL: string = "http://localhost:3000"; // Default base URL

    // constructor() {
    //     this.baseURL = process.env.NEXT_PUBLIC_API_URL || '';
    // }

    // Core request method
    private async request<T>(
        endpoint: string,
        options: RequestInit = {}
    ): Promise<T> {
        const url = `${this.baseURL}${endpoint}`;

        // Default headers
        const config: RequestInit = {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                ...options.headers,
            },
        };

        try {
            const response = await fetch(url, config);

            // Handle HTTP errors
            if (!response.ok) {
                const error = await response.json().catch(() => ({}));
                throw new Error(error.message || `HTTP Error: ${response.status}`);
            }

            // Handle empty responses (204 No Content)
            if (response.status === 204) {
                return {} as T;
            }

            return response.json();
        } catch (error) {
            console.error('API Request failed:', error);
            throw error;
        }
    }

    async get<T>(endpoint: string, options?: RequestInit): Promise<T> {
        return this.request<T>(endpoint, {method: 'GET', ...options});
    }

    // HTTP Methods
    async getSearch<T>(endpoint: string, params?: Record<string, any>, options?: RequestInit): Promise<T> {
        const queryString = params
            ? '?' + new URLSearchParams(params).toString()
            : '';
        return this.request<T>(`${endpoint}${queryString}`, {method: 'GET', ...options});
    }

    async post<T>(endpoint: string, data?: any, options?: RequestInit): Promise<T> {
        return this.request<T>(endpoint, {
            ...options,
            method: 'POST',
            body: data ? JSON.stringify(data) : undefined,
        });
    }

    async put<T>(endpoint: string, data: any, options?: RequestInit): Promise<T> {
        return this.request<T>(endpoint, {
            ...options,
            method: 'PUT',
            body: JSON.stringify(data),
        });
    }

    async patch<T>(endpoint: string, data: any, options?: RequestInit): Promise<T> {
        return this.request<T>(endpoint, {
            ...options,
            method: 'PATCH',
            body: JSON.stringify(data),
        });
    }

    async delete<T>(endpoint: string, options?: RequestInit): Promise<T> {
        return this.request<T>(endpoint, {...options, method: 'DELETE'});
    }

    // File upload
    async upload<T>(endpoint: string, formData?: FormData, options?: RequestInit): Promise<T> {

        return this.request<T>(endpoint, {
            ...options,
            method: 'POST',
            body: formData,
        });
    }
}

export const apiClient = new ApiClient();*/