import axiosInstance from "./axiosInstance";

export const getAllUsers = async () => {
    const res = await axiosInstance.get("/users", {
        withCredentials: true,
    });
    return res.data;
};

export const getUserProfileById = async (id) => {
    const res = await axiosInstance.get(`/users/${id}`, {  // ✅ use /:id route
        withCredentials: true,
    });
    return res.data;
};


// export const getUserProfileById = async (id) => {
//     const res = await axiosInstance.get(`/users/profile?id=${id}`, {
//         withCredentials: true,
//     });
//     return res.data;
// };

export const updateUser = async (id, data) => {
    const res = await axiosInstance.patch(`/users/${id}`, data, {
        withCredentials: true,
    });
    return res.data;
};
