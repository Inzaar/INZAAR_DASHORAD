import axiosInstance from "./axiosInstance";

export const getAllUsers = async () => {
    const res = await axiosInstance.get("/users", {
        withCredentials: true,
    });
    return res.data;
};
