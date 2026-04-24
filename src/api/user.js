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
export const getModeratorStudents = async (id, courseTitle, page = 1, limit = 5) => {
    const res = await axiosInstance.get(`/users/${id}/students`, {
        params: { courseTitle, page, limit },
        withCredentials: true,
    });
    return res.data;
};

export const getStudentProfiles = async (page = 1, limit = 10, search = "", status = "", fromDate = "", toDate = "", searchType = "NAME") => {
    const res = await axiosInstance.get("/users/students/profiles", {
        params: { page, limit, search, status, fromDate, toDate, searchType },
        withCredentials: true,
    });
    return res.data;
};

export const getModeratorProfiles = async (page = 1, limit = 6, search = "", status = "", fromDate = "", toDate = "", searchType = "NAME") => {
    const res = await axiosInstance.get("/users/moderators/profiles", {
        params: { page, limit, search, status, fromDate, toDate, searchType },
        withCredentials: true,
    });
    return res.data;
};

export const getStudentCourseStats = async (userId, courseId) => {
    const res = await axiosInstance.get(`/users/${userId}/courses/${courseId}/stats`, {
        withCredentials: true,
    });
    return res.data;
};

export const getModeratorFeatures = async () => {
    const res = await axiosInstance.get("/admin/features", {
        withCredentials: true,
    });
    return res.data;
};

export const fetchAllModerators = async () => {
    const res = await axiosInstance.get("/admin/moderators", {
        withCredentials: true,
    });
    return res.data;
};

export const assignBatch = async (moderatorId, batchId) => {
    const res = await axiosInstance.post(`/admin/moderators/${moderatorId}/assign-batch`, { batchId }, {
        withCredentials: true,
    });
    return res.data;
};

export const removeModerator = async (batchId) => {
    const res = await axiosInstance.delete(`/admin/batches/${batchId}/remove-moderator`, {
        withCredentials: true,
    });
    return res.data;
};


export const assignUserRole = async (id, data) => {
    const res = await axiosInstance.post(`/admin/users/${id}/assign-role`, data, {
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

export const restoreUser = async (id) => {
    const res = await axiosInstance.patch(`/users/${id}/restore`, {}, {
        withCredentials: true,
    });
    return res.data;
};

export const adminCreateStudent = async (data) => {
    const res = await axiosInstance.post("/admin/students", data, {
        withCredentials: true,
    });
    return res.data;
};

export const adminCreateModerator = async (data) => {
    const res = await axiosInstance.post("/admin/moderators", data, {
        withCredentials: true,
    });
    return res.data;
};
