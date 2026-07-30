import axios from "axios";
const axiosInstance = axios.create({
    baseURL: "ttps://aa95-2400-adc7-2918-d000-2c7c-f0e5-1ef4-f4d4.ngrok-free.app/api/v1",
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
