import axiosInstance from "./axiosInstance";

export const getEnrolledCoursesByUserId = () => {
    const res = axiosInstance.get("/enrollments/my-courses", {
        withCredentials: true,
    });
    return res;
}

export const getAllCourses = (params = {}) => {
    const res = axiosInstance.get("/courses", {
        params,
        withCredentials: true,
    });
    return res;
}

export const getCourseDetails = (courseId) => {
    const res = axiosInstance.get(`/courses/${courseId}`, {
        withCredentials: true,
    });
    return res;
}

// Create a single course (without lectures) and return its _id
export const createCourse = async (data) => {
    const res = await axiosInstance.post("/courses", data, {
        withCredentials: true,
    });
    return res.data;
};

export const getAdminCourseById = (courseId) => {
    const res = axiosInstance.get(`/admin/courses/${courseId}`, {
        withCredentials: true,
    });
    return res;
}

// Fetch complete course detail for the logged-in user or a specific student (for admins/mods)
export const getCourseById = (courseId, userId = null) => {
    const config = {
        withCredentials: true,
    };
    if (userId) {
        config.params = { userId };
    }
    const res = axiosInstance.get(`/enrollments/my-courses/${courseId}`, config);
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

// Update lecture watched progress for the logged-in student
// courseId   — the course the lecture belongs to
// lectureId  — the specific lecture being watched
// watchedPercentage — 0–100
// lastWatchedTime   — current video playback position in seconds (for resume)
export const updateLectureProgress = async (courseId, { lectureId, watchedPercentage, lastWatchedTime, timeSpentDelta }) => {
    const res = await axiosInstance.patch(
        `/enrollments/my-courses/${courseId}/progress`,
        { lectureId, watchedPercentage, lastWatchedTime, timeSpentDelta },
        { withCredentials: true }
    );
    return res.data.data;
};

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

export const uploadAudio = async (file) => {
    const formData = new FormData();
    formData.append("audio", file);
    const res = await axiosInstance.post("/upload/audio", formData, {
        headers: { "Content-Type": "multipart/form-data" },
        withCredentials: true,
    });
    return res.data.data; // { url, public_id }
}

export const uploadVideo = async (file) => {
    const formData = new FormData();
    formData.append("video", file);
    const res = await axiosInstance.post("/upload/video", formData, {
        headers: { "Content-Type": "multipart/form-data" },
        withCredentials: true,
    });
    return res.data.data; // { url, public_id }
}

export const uploadPdf = async (file) => {
    const formData = new FormData();
    formData.append("pdf", file);
    const res = await axiosInstance.post("/upload/pdf", formData, {
        headers: { "Content-Type": "multipart/form-data" },
        withCredentials: true,
    });
    return res.data.data; // { url, public_id }
}

// Save a generated certificate URL back to the enrollment
export const saveCertificate = async (courseId, certificateUrl) => {
    const res = await axiosInstance.patch(
        `/enrollments/my-courses/${courseId}/certificate`,
        { certificateUrl },
        { withCredentials: true }
    );
    return res.data.data;
};

export const updateCourse = async (id, data) => {
    const res = await axiosInstance.patch(`/courses/${id}`, data, {
        withCredentials: true,
    });
    return res;
};
