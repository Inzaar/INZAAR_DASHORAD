import axiosInstance from "./axiosInstance";

export const getMyNotifications = () => {
    return axiosInstance.get("/notifications/my-notifications");
};

export const markNotificationsAsSeen = () => {
    return axiosInstance.post("/notifications/mark-seen");
};

export const markSingleAsRead = (id) => {
    return axiosInstance.post(`/notifications/mark-read/${id}`);
};
