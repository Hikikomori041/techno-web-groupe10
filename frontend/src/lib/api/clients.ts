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
    (error) => Promise.reject(error)
);