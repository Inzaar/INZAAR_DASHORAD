import axiosInstance from "./axiosInstance";

export const getEnrolledCoursesByUserId = () => {
    const res = axiosInstance.get("/enroll/dashboard", {
        withCredentials: true,
    });
    return res;
}

export const getAllCourses = () => {
    const res = axiosInstance.get("/courses/list", {
        withCredentials: true,
    });
    return res;
}

export const getCourseById = (id) => {
    const res = axiosInstance.get(`/enroll/dashboard/${id}`, {
        withCredentials: true,
    });
    return res;
}

export const enrollCourse = async (id) => {
    try {
        const res = await axiosInstance.post(`/enroll/enroll`, {
            courseId: id,
            userId: localStorage.getItem("userId"),
        });
        return res;
    } catch (error) {
        console.log(error);
        throw error;
    }
}
