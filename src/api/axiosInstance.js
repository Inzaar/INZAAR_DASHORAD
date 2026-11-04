import axios from "axios";
const axiosInstance = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api/v1",
    headers: {
        "Content-Type": "application/json",
        "ngrok-skip-browser-warning": "69420"
    },
    withCredentials: true,
});

// Attach JWT token from localStorage to every request
axiosInstance.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("token");
        if (token) {
            config.headers["Authorization"] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Intercept 401 Unauthorized responses (token expiration)
axiosInstance.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            const isLoginRequest = error.config?.url?.includes('/users/login');
            if (!isLoginRequest) {
                localStorage.removeItem("token");
                localStorage.removeItem("user");
                localStorage.removeItem("isGuest");
                localStorage.removeItem("firstName");
                localStorage.removeItem("userId");
                sessionStorage.clear();

                window.location.replace('/');
            }
        }
        return Promise.reject(error);
    }
);

export default axiosInstance;
