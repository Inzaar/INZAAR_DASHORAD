import axiosInstance from "./axiosInstance";

export const getAllUsers = async () => {
    const res = await axiosInstance.get("/users", {
        withCredentials: true,
    });
    return res.data;
};

export const getUserProfileById = async (id) => {
    const res = await axiosInstance.get(`/users/${id}`, {
        withCredentials: true,
    });
    return res.data;
};

export const updateUser = async (id, data) => {
    const res = await axiosInstance.patch(`/users/${id}`, data, {
        withCredentials: true,
    });
    return res.data;
};

export const deleteUser = async (id) => {
    const res = await axiosInstance.delete(`/users/${id}`, {
        withCredentials: true,
    });
    return res.data;
};

export const deactivateUser = async (id, isActive) => {
    const res = await axiosInstance.patch(`/users/${id}`, { isActive }, {
        withCredentials: true,
    });
    return res.data;
};
