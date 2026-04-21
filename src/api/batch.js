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

/**
 * Fetch all batches for a specific course with live enrollment stats.
 * @param {string} courseId
 */
export const getBatchesByCourse = async (courseId) => {
    try {
        const response = await axiosInstance.get(`/batches/by-course/${courseId}`);
        return response.data.data;
    } catch (error) {
        throw error.response?.data || error;
    }
};

/**
 * Move N students from a source batch to a target batch.
 * @param {string} sourceBatchId
 * @param {string} targetBatchId
 * @param {number} count  - number of students to move
 */
export const moveStudents = async (sourceBatchId, targetBatchId, count) => {
    try {
        const response = await axiosInstance.post("/batches/move-students", {
            sourceBatchId,
            targetBatchId,
            count,
        });
        return response.data;
    } catch (error) {
        throw error.response?.data || error;
    }
};
