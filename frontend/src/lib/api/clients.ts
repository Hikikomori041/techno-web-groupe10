// lib/api/client.ts

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

        // Add authentication token (if exists)
        const token = localStorage.getItem('token');
        if (token) {
            config.headers = {
                ...config.headers,
                Authorization: `Bearer ${token}`,
            };
        }

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

    // HTTP Methods
    async get<T>(endpoint: string, params?: Record<string, any>): Promise<T> {
        const queryString = params
            ? '?' + new URLSearchParams(params).toString()
            : '';
        return this.request<T>(`${endpoint}${queryString}`, { method: 'GET' });
    }

    async post<T>(endpoint: string, data?: any): Promise<T> {
        return this.request<T>(endpoint, {
            method: 'POST',
            body: data ? JSON.stringify(data) : undefined,
        });
    }

    async put<T>(endpoint: string, data: any): Promise<T> {
        return this.request<T>(endpoint, {
            method: 'PUT',
            body: JSON.stringify(data),
        });
    }

    async patch<T>(endpoint: string, data: any): Promise<T> {
        return this.request<T>(endpoint, {
            method: 'PATCH',
            body: JSON.stringify(data),
        });
    }

    async delete<T>(endpoint: string): Promise<T> {
        return this.request<T>(endpoint, { method: 'DELETE' });
    }

    // File upload
    async upload<T>(endpoint: string, formData: FormData): Promise<T> {
        const token = localStorage.getItem('token');
        const headers: HeadersInit = {};

        if (token) {
            headers.Authorization = `Bearer ${token}`;
        }
        // Note: Don't set Content-Type for FormData, browser sets it automatically

        return this.request<T>(endpoint, {
            method: 'POST',
            body: formData,
            headers,
        });
    }
}

export const apiClient = new ApiClient();