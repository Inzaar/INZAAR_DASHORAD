import axiosInstance from "./axiosInstance";

export const getLectureNotes = (lectureId) => {
    return axiosInstance.get("/lecture-notes", {
        params: { lectureId },
        withCredentials: true,
    });
};

export const createLectureNote = (data) => {
    return axiosInstance.post("/lecture-notes", data, {
        withCredentials: true,
    });
};

export const updateLectureNote = (id, data) => {
    return axiosInstance.patch(`/lecture-notes/${id}`, data, {
        withCredentials: true,
    });
};

export const deleteLectureNote = (id) => {
    return axiosInstance.delete(`/lecture-notes/${id}`, {
        withCredentials: true,
    });
};
