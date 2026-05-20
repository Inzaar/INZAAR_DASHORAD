import axiosInstance from "./axiosInstance";

/**
 * Submit support issue to the backend
 * @param {Object} data - Form data containing name, email, and issue
 * @returns {Promise<Object>} API Response
 */
export const submitSupportIssue = async (data) => {
    const res = await axiosInstance.post("/support/submit-issue", data, {
        withCredentials: true,
    });
    return res.data;
};
