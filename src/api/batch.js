import axiosInstance from "./axiosInstance";

export const createBatch = async (data) => {
    try {
        const response = await axiosInstance.post("/batches", data);
        return response.data.data;
    } catch (error) {
        throw error.response?.data || error;
    }
};
export const getAllBatches = async (isMyBatches = false) => {
    try {
        const response = await axiosInstance.get(`/batches${isMyBatches ? '?myBatches=true' : ''}`);
        return response.data.data;
    } catch (error) {
        throw error.response?.data || error;
    }
};

export const getBatchById = async (id, isMyBatches = false) => {
    try {
        const response = await axiosInstance.get(`/batches/${id}${isMyBatches ? '?myBatches=true' : ''}`);
        return response.data.data;
    } catch (error) {
        throw error.response?.data || error;
    }
};

export const getBatchesByCourse = async (courseId) => {
    try {
        const response = await axiosInstance.get(`/batches/by-course/${courseId}`);
        return response.data.data;
    } catch (error) {
        throw error.response?.data || error;
    }
};

export const updateBatch = async (id, data) => {
    try {
        const response = await axiosInstance.patch(`/batches/${id}`, data);
        return response.data.data;
    } catch (error) {
        throw error.response?.data || error;
    }
};

export const deleteBatch = async (id) => {
    try {
        const response = await axiosInstance.delete(`/batches/${id}`);
        return response.data.data;
    } catch (error) {
        throw error.response?.data || error;
    }
};
