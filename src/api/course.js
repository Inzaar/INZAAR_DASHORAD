
export const getEnrolledCourses = () => {
    const res = axiosInstance.get("/");
    return res;
}