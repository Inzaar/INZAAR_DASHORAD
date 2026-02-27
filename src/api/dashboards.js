import axiosInstance from "./axiosInstance";

export const getStudentDashboard = () => {
    const res = axiosInstance.get("/users/student/dashboard", {
        withCredentials: true,
    });
    return res;
}

export const getUserProfile = () => {
    const res = axiosInstance.get("/users/profile", {
        withCredentials: true,
    });
    return res;
}