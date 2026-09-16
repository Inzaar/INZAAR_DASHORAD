import axiosInstance from "./axiosInstance";

export const getAllLimits = async () => {
    try {
        const response = await axiosInstance.get("/limits");
        return response.data.data; // Return the inner data array from ApiResponse
    } catch (error) {
        throw error.response?.data || error;
    }
};

export const getLimitById = async (id) => {
    try {
        const response = await axiosInstance.get(`/limits/${id}`);
        return response.data.data;
    } catch (error) {
        throw error.response?.data || error;
    }
};

export const updateLimit = async (id, data) => {
    try {
        const response = await axiosInstance.patch(`/limits/${id}`, data);
        return response.data.data;
    } catch (error) {
        throw error.response?.data || error;
    }
};

/**
 * Fetch all limites for a specific course with live enrollment stats.
 * @param {string} courseId
 */
export const getLimitsByCourse = async (courseId) => {
    try {
        const response = await axiosInstance.get(`/limits/by-course/${courseId}`);
        return response.data.data;
    } catch (error) {
        throw error.response?.data || error;
    }
};

export const getStudentsByGroup = async (limitId) => {
    try {
        const response = await axiosInstance.get(`/limits/${limitId}/students`);
        return response.data.data;
    } catch (error) {
        throw error.response?.data || error;
    }
};

/**
 * Move N students from a source limit to a target limit.
 * @param {string} sourceLimitId
 * @param {string} targetLimitId
 * @param {number} count  - number of students to move
 */
export const moveStudents = async (sourceLimitId, targetLimitId, count) => {
    try {
        const response = await axiosInstance.post("/limits/move-students", {
            sourceLimitId,
            targetLimitId,
            count,
        });
        return response.data;
    } catch (error) {
        throw error.response?.data || error;
    }
};
