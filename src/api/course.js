import axiosInstance from "./axiosInstance";

export const getEnrolledCoursesByUserId = () => {
    const res = axiosInstance.get("/enrollments/my-courses", {
        withCredentials: true,
    });
    return res;
}

export const getAllCourses = () => {
    const res = axiosInstance.get("/courses", {
        withCredentials: true,
    });
    return res;
}

// Fetch complete course detail for the logged-in user
export const getCourseById = (courseId) => {
    const res = axiosInstance.get(`/enrollments/my-courses/${courseId}`, {
        withCredentials: true,
    });
    return res;
}

export const enrollCourse = async (id) => {
    try {
        const res = await axiosInstance.post(`/enrollments/enroll`, {
            courseId: id,
        }, {
            withCredentials: true
        });
        return res;
    } catch (error) {
        console.log(error);
        throw error;
    }
}

// Create a course along with all its lectures in one request
export const createCourseWithLectures = async (data) => {
    const res = await axiosInstance.post("/courses/with-lectures", data, {
        withCredentials: true,
    });
    return res;
}

// Upload an image to Cloudinary via the backend
// file: File object from <input type="file">
// Returns { url, public_id }
export const uploadImage = async (file) => {
    const formData = new FormData();
    formData.append("image", file);
    const res = await axiosInstance.post("/upload/image", formData, {
        headers: { "Content-Type": "multipart/form-data" },
        withCredentials: true,
    });
    return res.data.data; // { url, public_id }
}
