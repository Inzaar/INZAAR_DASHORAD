import axiosInstance from "./axiosInstance";

export const createDepartment = async (name) => {
    const res = await axiosInstance.post("/departments", { name });
    return res.data;
};

export const getAllDepartments = async () => {
    const res = await axiosInstance.get("/departments");
    return res.data;
};

export const updateDepartment = async (id, name) => {
    const res = await axiosInstance.put(`/departments/${id}`, { name });
    return res.data;
};

export const deleteDepartment = async (id) => {
    const res = await axiosInstance.delete(`/departments/${id}`);
    return res.data;
};
