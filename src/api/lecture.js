import axiosInstance from "./axiosInstance";

export const getLectureById = (id) => {
    return axiosInstance.get(`/lectures/${id}`, {
        withCredentials: true,
    });
};

export const updateLecture = (id, data) => {
    return axiosInstance.patch(`/lectures/${id}`, data, {
        withCredentials: true,
    });
};

export const deleteLecture = (id) => {
    return axiosInstance.delete(`/lectures/${id}`, {
        withCredentials: true,
    });
};
