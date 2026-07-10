import axios from "axios";
const axiosInstance = axios.create({
    baseURL: "https://c94a-2400-adc7-2918-d000-41db-36fc-ca02-db03.ngrok-free.app/api/v1",
    headers: {
        "Content-Type": "application/json",
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
