import axios from "axios";
const axiosInstance = axios.create({
    baseURL: "https://inzaar.duckdns.org/api/v1",
    // baseURL: "http://localhost:8000/api/v1",
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
export default axiosInstance;
