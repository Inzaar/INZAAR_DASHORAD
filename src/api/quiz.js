import axiosInstance from "./axiosInstance";

// ─── Quiz CRUD ───────────────────────────────────────────────────────────────

// POST /api/v1/quizzes
export const createQuiz = async (payload) => {
    const res = await axiosInstance.post("/quizzes", payload, {
        withCredentials: true,
    });
    return res.data; // { success, data: quiz, message }
};

// POST /api/v1/upload/quiz-media  (image or video attached to a question)
export const uploadQuizMedia = async (file) => {
    const formData = new FormData();
    formData.append("media", file);
    const res = await axiosInstance.post("/upload/quiz-media", formData, {
        headers: { "Content-Type": "multipart/form-data" },
        withCredentials: true,
    });
    return res.data.data; // { url, public_id, mediaType }
};

// GET /api/v1/quizzes/course/:courseId
export const getQuizzesByCourse = async (courseId) => {
    const res = await axiosInstance.get(`/quizzes/course/${courseId}`, {
        withCredentials: true,
    });
    return res.data;
};

// GET /api/v1/quizzes/:id
export const getQuizById = async (quizId) => {
    const res = await axiosInstance.get(`/quizzes/${quizId}`, {
        withCredentials: true,
    });
    return res.data;
};

// PATCH /api/v1/quizzes/:id
export const updateQuiz = async (quizId, payload) => {
    const res = await axiosInstance.patch(`/quizzes/${quizId}`, payload, {
        withCredentials: true,
    });
    return res.data;
};

// POST /api/v1/quizzes/:id/submit
export const submitQuiz = async (quizId, payload) => {
    const res = await axiosInstance.post(`/quizzes/${quizId}/submit`, payload, {
        withCredentials: true,
    });
    return res.data;
};

// DELETE /api/v1/quizzes/:id
export const deleteQuiz = async (quizId) => {
    const res = await axiosInstance.delete(`/quizzes/${quizId}`, {
        withCredentials: true,
    });
    return res.data;
};

// ─── Granular Question Endpoints ─────────────────────────────────────────────

// POST /api/v1/quizzes/:id/questions
export const addQuestion = async (quizId, question) => {
    const res = await axiosInstance.post(`/quizzes/${quizId}/questions`, question, {
        withCredentials: true,
    });
    return res.data;
};

// PATCH /api/v1/quizzes/:id/questions/:questionId
export const updateQuestion = async (quizId, questionId, data) => {
    const res = await axiosInstance.patch(`/quizzes/${quizId}/questions/${questionId}`, data, {
        withCredentials: true,
    });
    return res.data;
};

// DELETE /api/v1/quizzes/:id/questions/:questionId
export const deleteQuestion = async (quizId, questionId) => {
    const res = await axiosInstance.delete(`/quizzes/${quizId}/questions/${questionId}`, {
        withCredentials: true,
    });
    return res.data;
};
