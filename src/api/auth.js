import axiosInstance from "./axiosInstance";

export const login = (data) => {
    const res = axiosInstance.post("/users/login", data);
    return res;
}

export const register = (data) => {
    const res = axiosInstance.post("/users/register", data);
    return res;
}

export const logout = () => {
    const res = axiosInstance.post("/users/logout", {}, {
        withCredentials: true,
    });
    return res;
}

export const forgotPassword = (data) => {
    const res = axiosInstance.post("/users/forgot-password", data);
    return res;
}

export const resetPassword = (data) => {
    const res = axiosInstance.post("/users/reset-password", data);
    return res;
}

export const updateProfile = (data) => {
    const res = axiosInstance.patch("/users/profile", data);
    return res;
}
