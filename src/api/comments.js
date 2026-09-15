import axiosInstance from "./axiosInstance";

export const getComments = (lectureId, studentId) => {
    return axiosInstance.get("/comments", {
        params: { lectureId, studentId },
        withCredentials: true,
    });
};

export const createComment = (data) => {
    return axiosInstance.post("/comments", data, {
        withCredentials: true,
    });
};

export const updateComment = (id, data) => {
    return axiosInstance.put(`/comments/${id}`, data, {
        withCredentials: true,
    });
};

export const deleteComment = (id) => {
    return axiosInstance.delete(`/comments/${id}`, {
        withCredentials: true,
    });
};

export const reactToComment = (id, emoji) => {
    return axiosInstance.post(`/comments/${id}/react`, { emoji }, {
        withCredentials: true,
    });
};
