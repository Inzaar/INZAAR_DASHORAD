import axiosInstance from "./axiosInstance";

export const getAllEnrollments = async () => {
    const res = await axiosInstance.get("/enrollments", {
        withCredentials: true,
    });
    return res.data;
};
