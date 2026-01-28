import axiosInstance from "./axiosInstance";

export const login = (data) => {
    const res = axiosInstance.post("/auth/login", data);
    return res;
}

export const register = (data) => {
    const res = axiosInstance.post("/auth/register", data);
    return res;
}

export const logout = () => {
    const res = axiosInstance.post("/auth/logout");
    return res;
}

export const forgotPassword = (data) => {
    const res = axiosInstance.post("/auth/forgot-password", data);
    return res;
}

export const resetPassword = (data) => {
    const res = axiosInstance.post("/auth/reset-password", data);
    return res;
}

export const updateProfile = (data) => {
    const res = axiosInstance.put("/auth/update-profile", data);
    return res;
}
