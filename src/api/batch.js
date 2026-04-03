import axiosInstance from "./axiosInstance";

export const getAllBatches = async () => {
    try {
        const response = await axiosInstance.get("/batches");
        return response.data.data; // Return the inner data array from ApiResponse
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
